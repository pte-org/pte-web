"use client";

import {
  useEffect,
  useSyncExternalStore,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import {
  ActionMenu,
  Alert,
  BanIcon,
  Button,
  Checkbox,
  ConfirmDialog,
  CopyIcon,
  DataTable,
  DateTimeInput,
  EyeIcon,
  Input,
  Modal,
  PaginationControls,
  Select,
  subscribeSessionLifecycle,
  useSessionManager,
  useToast,
} from "@pte/ui";
import {
  ApiError,
  decodeAccessTokenClaims,
  getUserFacingApiErrorMessage,
  type AdminLicenseCodeSummary,
  type ConfirmLicenseRevokeRequest,
  type IssueLicenseCodeRequest,
  type LicenseIssueReceipt,
  type LicenseCodeStatus,
  type LicenseRevokePreviewResponse,
} from "@pte/api-client";
import {
  lookupAdminLicenseCode,
  revealAdminLicenseCode,
  useAdminLicenseCodesQuery,
  useIssueLicenseCode,
  useLicenseCodeRevokePreview,
  usePlansQuery,
  useRevokeLicenseCode,
} from "../api";
import { LICENSE_CODES_TEXT as RAW_LICENSE_CODES_TEXT } from "../constants";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";
import { isPlatformAdmin } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useAdminSearchText } from "@/features/i18n/adminSearchCopy";
import { useDebouncedSearch } from "@/features/i18n/useDebouncedSearch";

const DEFAULT_PAGE_SIZE = 25;
const MAX_REVEAL_MS = 60_000;

const LICENSE_STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Issued", value: "ISSUED" },
  { label: "Redeemed", value: "REDEEMED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Revoked", value: "REVOKED" },
] as const;

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleString() : "—";

const ACTIVATION_CODE_SEARCH_PATTERN =
  /^(?:[A-Z0-9]{8}|[A-Z0-9]{4}-[A-Z0-9]{4}|[A-Z0-9]{4}(?:-[A-Z0-9]{4}){4})$/i;

const isActivationCodeSearch = (value: string): boolean =>
  ACTIVATION_CODE_SEARCH_PATTERN.test(value.trim().replace(/\s+/g, ""));

type IssueIntent = { idempotencyKey: string; payload: IssueLicenseCodeRequest };
type StatusFilter = LicenseCodeStatus | "";
type AppliedFilters = { status: StatusFilter; planId: string; tenantId: string };
type LicenseCodeRevealTarget = Pick<AdminLicenseCodeSummary, "publicId">;

const SAFE_NEW_INTENT_ERROR_CODES = new Set([
  "LICENSE_CODE_IDEMPOTENCY_KEY_REQUIRED",
  "LICENSE_CODE_IDEMPOTENCY_KEY_INVALID",
  "LICENSE_CODE_PLAN_REQUIRED",
  "LICENSE_CODE_PLAN_NOT_ACTIVE",
  "LICENSE_CODE_EXAM_PLAN_REQUIRED",
  "LICENSE_CODE_EXPIRY_INVALID",
  "LICENSE_CODE_EXPIRY_PRECISION_INVALID",
  "PLAN_NOT_FOUND",
]);

const subscribeRecovery = (notify: () => void): (() => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener("license-issue-intent", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("license-issue-intent", notify);
  };
};

const parseRecovery = (stored: string | null): IssueIntent | null => {
  try {
    const value: unknown = stored ? JSON.parse(stored) : null;
    if (
      typeof value !== "object" ||
      value === null ||
      !("idempotencyKey" in value) ||
      typeof value.idempotencyKey !== "string" ||
      !("payload" in value) ||
      typeof value.payload !== "object" ||
      value.payload === null ||
      !("planId" in value.payload) ||
      typeof value.payload.planId !== "string" ||
      !("codeExpiresAt" in value.payload) ||
      (value.payload.codeExpiresAt !== null && typeof value.payload.codeExpiresAt !== "string")
    ) {
      return null;
    }
    return {
      idempotencyKey: value.idempotencyKey,
      payload: { planId: value.payload.planId, codeExpiresAt: value.payload.codeExpiresAt },
    };
  } catch {
    return null;
  }
};

const safeOperationMessage = (error: unknown, fallback: string): string =>
  getUserFacingApiErrorMessage(error, fallback);

export const LicenseCodesView = (): ReactElement => {
  const T = useAdminCopy(RAW_LICENSE_CODES_TEXT);
  const searchText = useAdminSearchText("licenseCodes");
  const statusOptions = useAdminCopy(LICENSE_STATUS_FILTER_OPTIONS);
  const dateRangeLabel = useAdminCopy("Date range");
  const impactLabel = useAdminCopy("Impact");
  const previewValidUntilLabel = useAdminCopy("Preview valid until");
  const { session, isReady } = useSessionManager();
  const { showToast } = useToast();
  const canUseSensitiveActions = isPlatformAdmin(session?.roles);
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const recoveryKey = actorId ? `pte-license-issue:${actorId}` : null;
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const activationCodeSearch = isActivationCodeSearch(debouncedSearch);
  const [codeSearchResult, setCodeSearchResult] = useState<AdminLicenseCodeSummary | null>(null);
  const [codeSearchNotFound, setCodeSearchNotFound] = useState(false);
  const [codeSearchError, setCodeSearchError] = useState("");
  const [draftStatus, setDraftStatus] = useState<StatusFilter>("");
  const [draftPlanId, setDraftPlanId] = useState("");
  const [draftTenantId, setDraftTenantId] = useState("");
  const [filters, setFilters] = useState<AppliedFilters>({ status: "", planId: "", tenantId: "" });
  const codePageQuery = useAdminLicenseCodesQuery({
    page,
    size,
    status: filters.status || undefined,
    planId: filters.planId || undefined,
    tenantId: filters.tenantId || undefined,
    search: activationCodeSearch ? "UNSUPPORTED" : debouncedSearch,
  });
  const {
    data: plans = [],
    refetch: refreshPlans,
    isLoading: plansLoading,
    isError: plansError,
  } = usePlansQuery();
  const issue = useIssueLicenseCode();
  const revokePreviewRequest = useLicenseCodeRevokePreview();
  const revoke = useRevokeLicenseCode();

  const [planId, setPlanId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState<LicenseIssueReceipt | null>(null);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [codeToRevoke, setCodeToRevoke] = useState<AdminLicenseCodeSummary | null>(null);
  const [revokePreview, setRevokePreview] = useState<LicenseRevokePreviewResponse | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>(T.REVOKE_REASON);
  const [cancelSubscription, setCancelSubscription] = useState(false);
  const [cancelScheduledScope, setCancelScheduledScope] = useState(false);
  const [preserveOpenClosed, setPreserveOpenClosed] = useState(false);
  const [memoryRecovery, setMemoryRecovery] = useState<{
    owner: string;
    intent: IssueIntent | null;
  } | null>(null);
  const [localError, setLocalError] = useState("");
  const [confirmNewIntent, setConfirmNewIntent] = useState(false);

  const [lookupDialogOpen, setLookupDialogOpen] = useState(false);
  const [lookupInput, setLookupInput] = useState("");
  const [lookupResult, setLookupResult] = useState<AdminLicenseCodeSummary | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [revealTarget, setRevealTarget] = useState<LicenseCodeRevealTarget | null>(null);
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [revealBusy, setRevealBusy] = useState(false);
  const [revealError, setRevealError] = useState("");
  const [copied, setCopied] = useState(false);

  const storedIntent = useSyncExternalStore(
    subscribeRecovery,
    () => {
      try {
        return recoveryKey ? window.sessionStorage.getItem(recoveryKey) : null;
      } catch {
        return null;
      }
    },
    () => null,
  );
  const intent =
    memoryRecovery?.owner === recoveryKey ? memoryRecovery.intent : parseRecovery(storedIntent);
  const issueErrorCode = issue.error instanceof ApiError ? issue.error.code : undefined;
  const rejected = issueErrorCode !== undefined && SAFE_NEW_INTENT_ERROR_CODES.has(issueErrorCode);
  const activePlans = plans.filter(
    (plan) => plan.type === "EXAM_PACKAGE" && plan.status === "ACTIVE",
  );
  const codeSearchMatchesFilters =
    codeSearchResult !== null &&
    (!filters.status || codeSearchResult.effectiveStatus === filters.status) &&
    (!filters.planId || codeSearchResult.planPublicId === filters.planId) &&
    (!filters.tenantId || codeSearchResult.recipientPublicId === filters.tenantId);
  const codeSearchBusy =
    activationCodeSearch && codeSearchResult === null && !codeSearchNotFound && !codeSearchError;
  const codes = activationCodeSearch
    ? codeSearchMatchesFilters
      ? codeSearchResult
        ? [codeSearchResult]
        : []
      : []
    : codePageQuery.data?.data ?? [];
  const isFiltered = Boolean(filters.status || filters.planId || filters.tenantId || search.trim());
  const error =
    issue.error ?? revoke.error ?? revokePreviewRequest.error ?? codePageQuery.error ?? codeSearchError;
  const errorMessage =
    localError ||
    (error ? safeOperationMessage(error, T.ERROR) : codePageQuery.isError ? T.ERROR : undefined);
  const expiryDate = expiresAt ? new Date(expiresAt) : null;
  const utcPreview =
    expiryDate && !Number.isNaN(expiryDate.getTime()) ? expiryDate.toISOString() : T.EMPTY_VALUE;
  const issueSuccessPlanName = issueSuccess
    ? plans.find((plan) => plan.publicId === issueSuccess.planId)?.name ?? T.EMPTY_VALUE
    : T.EMPTY_VALUE;

  const saveRecovery = (next: IssueIntent | null): void => {
    if (!recoveryKey) return;
    setMemoryRecovery({ owner: recoveryKey, intent: next });
    try {
      if (next) window.sessionStorage.setItem(recoveryKey, JSON.stringify(next));
      else window.sessionStorage.removeItem(recoveryKey);
      window.dispatchEvent(new Event("license-issue-intent"));
    } catch {
      // The current-page in-memory value still supports a safe retry.
    }
  };

  const clearReveal = (): void => {
    setRevealTarget(null);
    setRevealedCode(null);
    setRevealError("");
    setCopied(false);
    setRevealBusy(false);
  };

  useEffect(
    () =>
      subscribeSessionLifecycle(() => {
        // Actor changes are the boundary; the bearer is never retained across it.
        setRevealTarget(null);
        setRevealedCode(null);
        setRevealError("");
        setCopied(false);
        setRevealBusy(false);
        setLookupResult(null);
        setLookupInput("");
        setLookupError("");
        setLookupDialogOpen(false);
        setIssueDialogOpen(false);
        setIssueSuccess(null);
        setAdvancedFiltersOpen(false);
        setLocalError("");
        setMemoryRecovery(null);
        setConfirmNewIntent(false);
        setCodeToRevoke(null);
        setRevokePreview(null);
        setCodeSearchResult(null);
        setCodeSearchNotFound(false);
        setCodeSearchError("");
      }),
    [],
  );

  useEffect(() => {
    if (!revealedCode) return undefined;
    const timeout = window.setTimeout(() => setRevealedCode(null), MAX_REVEAL_MS);
    return () => window.clearTimeout(timeout);
  }, [revealedCode]);

  useEffect(() => {
    let cancelled = false;
    if (!activationCodeSearch) {
      return () => {
        cancelled = true;
      };
    }

    void lookupAdminLicenseCode(debouncedSearch)
      .then((result) => {
        if (!cancelled) setCodeSearchResult(result);
      })
      .catch((caught) => {
        if (cancelled) return;
        if (caught instanceof ApiError && caught.status === 404) {
          setCodeSearchNotFound(true);
          return;
        }
        setCodeSearchError(safeOperationMessage(caught, T.ERROR));
      });

    return () => {
      cancelled = true;
    };
  }, [activationCodeSearch, debouncedSearch, T.ERROR]);

  const applyFilters = (): void => {
    setPage(0);
    setFilters({ status: draftStatus, planId: draftPlanId.trim(), tenantId: draftTenantId.trim() });
    clearReveal();
  };

  const resetFilters = (): void => {
    setDraftStatus("");
    setDraftPlanId("");
    setDraftTenantId("");
    setPage(0);
    setFilters({ status: "", planId: "", tenantId: "" });
    clearReveal();
  };

  const issueCode = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (issue.isPending || !recoveryKey) return;
    clearReveal();
    setLocalError("");
    const submittedExpiry = expiresAt ? new Date(expiresAt) : null;
    if (
      !intent &&
      (!planId ||
        (submittedExpiry &&
          (Number.isNaN(submittedExpiry.getTime()) ||
            submittedExpiry.getTime() <= new Date().getTime())))
    ) {
      setLocalError(T.INVALID_EXPIRY);
      return;
    }
    const next = intent ?? {
      idempotencyKey: crypto.randomUUID(),
      payload: { planId, codeExpiresAt: submittedExpiry ? submittedExpiry.toISOString() : null },
    };
    saveRecovery(next);
    try {
      const result = await issue.mutateAsync(next);
      showToast(
        result.replayed ? T.RECOVERED_SUCCESS : T.ISSUED_SUCCESS,
        { tone: "success" },
      );
      saveRecovery(null);
      setPlanId("");
      setExpiresAt("");
      setIssueDialogOpen(false);
      setIssueSuccess(result);
    } catch {
      // The mutation error is rendered; the same idempotency key remains recoverable.
    }
  };

  const loadRevokePreview = async (publicId: string): Promise<void> => {
    setRevokePreview(null);
    revokePreviewRequest.reset();
    try {
      const preview = await revokePreviewRequest.mutateAsync(publicId);
      setRevokePreview(preview);
      setLocalError("");
      setCancelSubscription(false);
      setCancelScheduledScope(false);
      setPreserveOpenClosed(false);
    } catch {
      // Preview failure is rendered and cannot be confirmed blindly.
    }
  };

  const beginRevoke = (row: AdminLicenseCodeSummary): void => {
    clearReveal();
    setCodeToRevoke(row);
    setLocalError("");
    revoke.reset();
    setRevokeReason(T.REVOKE_REASON);
    setCancelSubscription(false);
    setCancelScheduledScope(false);
    setPreserveOpenClosed(false);
    void loadRevokePreview(row.publicId);
  };

  const confirmRevoke = async (): Promise<void> => {
    if (
      !codeToRevoke ||
      !revokePreview ||
      !cancelScheduledScope ||
      !preserveOpenClosed ||
      (revokePreview.subscriptionPublicId !== null && !cancelSubscription)
    )
      return;
    const payload: ConfirmLicenseRevokeRequest = {
      reason: revokeReason,
      scopeDigest: revokePreview.scopeDigest,
      previewExpiresAt: revokePreview.previewExpiresAt,
      expectedEffectiveState: revokePreview.effectiveState,
      expectedPlanId: revokePreview.planId,
      expectedSubscriptionPublicId: revokePreview.subscriptionPublicId,
      expectedSubscriptionStatus: revokePreview.subscriptionStatus,
      cancelSubscription: revokePreview.subscriptionPublicId !== null,
      cancelScheduledScope,
      preserveOpenClosed,
    };
    try {
      await revoke.mutateAsync({ publicId: codeToRevoke.publicId, payload });
      showToast(T.REVOKED_SUCCESS, { tone: "success" });
      setCodeToRevoke(null);
      setRevokePreview(null);
    } catch (caught) {
      if (
        caught instanceof ApiError &&
        (caught.code === "LICENSE_CODE_REVOKE_SCOPE_CHANGED" ||
          caught.code === "LICENSE_CODE_REVOKE_PREVIEW_EXPIRED")
      ) {
        setLocalError(
          caught.code === "LICENSE_CODE_REVOKE_PREVIEW_EXPIRED"
            ? T.REVOKE_PREVIEW_EXPIRED
            : T.REVOKE_SCOPE_CHANGED,
        );
        void loadRevokePreview(codeToRevoke.publicId);
      }
      // Keep confirmation open; a lost response must not blindly resubmit.
    }
  };

  const revealCode = async (row: LicenseCodeRevealTarget): Promise<void> => {
    clearReveal();
    setRevealTarget(row);
    setRevealBusy(true);
    try {
      const result = await revealAdminLicenseCode(row.publicId);
      setRevealedCode(result.code);
    } catch (caught) {
      setRevealError(safeOperationMessage(caught, T.REVEAL_ERROR));
    } finally {
      setRevealBusy(false);
    }
  };

  const lookupCode = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const submittedCode = lookupInput.trim();
    if (!submittedCode || lookupBusy) return;
    clearReveal();
    setLookupBusy(true);
    setLookupError("");
    setLookupResult(null);
    try {
      setLookupResult(await lookupAdminLicenseCode(submittedCode));
      setLookupInput("");
    } catch (caught) {
      setLookupError(
        caught instanceof ApiError && caught.status === 404
          ? T.LOOKUP_NOT_FOUND
          : safeOperationMessage(caught, T.ERROR),
      );
    } finally {
      setLookupBusy(false);
    }
  };

  const copyRevealedCode = async (): Promise<void> => {
    if (!revealedCode || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(revealedCode);
      setCopied(true);
      showToast(T.COPIED, { tone: "success" });
    } catch {
      setRevealError(T.REVEAL_ERROR);
    }
  };

  const refreshLicenseCodes = (): void => {
    clearReveal();
    void codePageQuery.refetch();
  };

  return (
    <div className="flex flex-col gap-5">
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {codePageQuery.isFetching && codePageQuery.data && <Alert tone="info">{T.STALE_DATA}</Alert>}
      {intent && (
        <Alert tone="warning">
          {issue.isPending ? T.ISSUE_PENDING : rejected ? T.ISSUE_REJECTED : T.UNCERTAIN}{" "}
          {intent.payload.planId} · {intent.payload.codeExpiresAt ?? T.EMPTY_VALUE}
        </Alert>
      )}

      <CommercialPanel
        title={T.TITLE}
        subtitle={T.INVENTORY_SUBTITLE}
        actions={
          <>
            <Button type="button" onClick={() => setIssueDialogOpen(true)}>
              {T.CREATE_ACTION}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setLookupDialogOpen(true)}>
              {T.LOOKUP_ACTION}
            </Button>
            <Button type="button" variant="secondary" onClick={refreshLicenseCodes}>
              {T.REFRESH_LIST}
            </Button>
          </>
        }
      >
        {advancedFiltersOpen && (
          <div className="mb-4 rounded-md border border-[var(--table-border)] bg-[var(--surface-subtle)] p-3">
          <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_auto_auto] md:items-end">
            <Select
              id="license-status-filter"
              label={T.STATUS_FILTER}
              options={statusOptions}
              value={draftStatus}
              onChange={(event) => setDraftStatus(event.target.value as StatusFilter)}
            />
            <Select
              id="license-plan-filter"
              label={T.PLAN_ID}
              placeholder={T.ALL_PLANS}
              options={plans.map((plan) => ({ label: plan.name, value: plan.publicId }))}
              value={draftPlanId}
              onChange={(event) => setDraftPlanId(event.target.value)}
              disabled={plansLoading || plansError}
            />
            <Input
              id="license-tenant-filter"
              label={T.TENANT_FILTER}
              value={draftTenantId}
              onChange={(event) => setDraftTenantId(event.target.value)}
              aria-describedby="license-tenant-filter-help"
            />
            <Button type="button" onClick={applyFilters}>
              {T.APPLY_FILTERS}
            </Button>
            <Button type="button" variant="ghost" onClick={resetFilters}>
              {T.RESET_FILTERS}
            </Button>
            <p id="license-tenant-filter-help" className="text-xs text-slate-500 md:col-start-3">
              {T.TENANT_FILTER_HELP}
            </p>
          </div>
          </div>
        )}
        <DataTable
          searchPlaceholder={searchText.placeholder}
          searchAriaLabel={searchText.ariaLabel}
          searchValue={search}
          onSearchChange={(value) => {
            clearReveal();
            setCodeSearchResult(null);
            setCodeSearchNotFound(false);
            setCodeSearchError("");
            setSearch(value);
            setPage(0);
          }}
          filters={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAdvancedFiltersOpen((current) => !current)}
            >
              {advancedFiltersOpen ? T.HIDE_ADVANCED_FILTERS : T.ADVANCED_FILTERS}
            </Button>
          }
          columns={[
            {
              key: "code",
              header: T.CODE,
              cell: (row: AdminLicenseCodeSummary) => (
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {row.maskedCode}
                </span>
              ),
            },
            {
              key: "plan",
              header: T.PLAN_ID,
              cell: (row: AdminLicenseCodeSummary) => (
                <p className="font-medium text-slate-900">{row.planName}</p>
              ),
            },
            {
              key: "recipient",
              header: T.RECIPIENT,
              cell: (row: AdminLicenseCodeSummary) =>
                row.recipientPublicId ? (
                  <p>{row.recipientName ?? T.EMPTY_VALUE}</p>
                ) : (
                  T.EMPTY_VALUE
                ),
            },
            {
              key: "issued",
              header: T.ISSUED,
              filterType: "date-range",
              filterAccessor: (row: AdminLicenseCodeSummary) => row.issuedAt,
              filterPlaceholder: dateRangeLabel,
              cell: (row: AdminLicenseCodeSummary) => formatDate(row.issuedAt),
            },
            {
              key: "expires",
              header: T.EXPIRES,
              filterType: "date-range",
              filterAccessor: (row: AdminLicenseCodeSummary) => row.codeExpiresAt,
              filterPlaceholder: dateRangeLabel,
              cell: (row: AdminLicenseCodeSummary) => formatDate(row.codeExpiresAt),
            },
            {
              key: "status",
              header: T.STATUS,
              filterOptions: statusOptions,
              filterAccessor: (row: AdminLicenseCodeSummary) => row.effectiveStatus,
              cell: (row: AdminLicenseCodeSummary) => (
                <CommercialStatusBadge status={row.effectiveStatus} />
              ),
            },
          ]}
          rows={codes}
          getRowKey={(row) => row.publicId}
          isLoading={codePageQuery.isLoading || codeSearchBusy}
          rowActions={(row) => (
            <ActionMenu
              items={[
                ...(canUseSensitiveActions
                  ? [{ label: T.REVEAL, icon: EyeIcon, onSelect: () => void revealCode(row) }]
                  : []),
                ...(canUseSensitiveActions &&
                (row.effectiveStatus === "ISSUED" ||
                  (row.effectiveStatus === "REDEEMED" && row.subscriptionPublicId !== null))
                  ? [
                      {
                        label: T.REVOKE,
                        icon: BanIcon,
                        danger: true,
                        onSelect: () => beginRevoke(row),
                      },
                    ]
                  : []),
              ]}
            />
          )}
          rowActionsHeader=""
          emptyTitle={
            codePageQuery.isLoading || codeSearchBusy
              ? T.LOADING
              : isFiltered || codeSearchNotFound
                ? T.FILTER_EMPTY
                : T.EMPTY
          }
          clientSideFiltering={false}
          clientSidePagination={false}
          pagination={
            !activationCodeSearch && codePageQuery.data ? (
              <PaginationControls
                meta={codePageQuery.data.meta}
                onPageChange={(nextPage) => {
                  clearReveal();
                  setPage(nextPage);
                }}
                disabled={codePageQuery.isFetching}
                showPageSizeInput
                onPageSizeChange={(nextSize) => {
                  clearReveal();
                  setSize(nextSize);
                  setPage(0);
                }}
                totalItemsLabel={T.TOTAL_CODES(codePageQuery.data.meta.totalElements)}
              />
            ) : undefined
          }
        />
      </CommercialPanel>

      <Modal
        open={issueDialogOpen || intent !== null}
        title={T.ISSUE_TITLE}
        size="md"
        isDismissDisabled={issue.isPending}
        onClose={() => {
          if (!issue.isPending && !intent) {
            setIssueDialogOpen(false);
            setLocalError("");
          }
        }}
        footer={
          <>
            {intent && (
              <Button
                type="button"
                variant="ghost"
                disabled={issue.isPending}
                onClick={() => setConfirmNewIntent(true)}
              >
                {T.NEW_ISSUE}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              disabled={issue.isPending || intent !== null}
              onClick={() => setIssueDialogOpen(false)}
            >
              {T.CLOSE}
            </Button>
            <Button
              type="submit"
              form="license-issue-form"
              isLoading={issue.isPending}
              disabled={!isReady || !actorId || (!planId && !intent)}
            >
              {intent ? T.RETRY_ISSUE : T.ISSUE}
            </Button>
          </>
        }
      >
        <form
          id="license-issue-form"
          className="flex flex-col gap-4"
          onSubmit={(event) => void issueCode(event)}
        >
          <Select
            id="license-plan"
            label={T.PLAN_LABEL}
            placeholder={T.PLAN_PLACEHOLDER}
            options={activePlans.map((plan) => ({ label: plan.name, value: plan.publicId }))}
            value={intent?.payload.planId ?? planId}
            onChange={(event) => setPlanId(event.target.value)}
            required
            disabled={intent !== null || issue.isPending || plansLoading || plansError}
          />
          <DateTimeInput
            id="license-expires"
            label={T.EXPIRY_LABEL}
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            disabled={intent !== null || issue.isPending}
          />
          <p className="text-xs text-[var(--ink-muted)]">{T.EXPIRY_HELP(zone, utcPreview)}</p>
          {issue.error != null && (
            <Alert tone="error">{safeOperationMessage(issue.error, T.ERROR)}</Alert>
          )}
          {localError && <Alert tone="error">{localError}</Alert>}
          {plansError && (
            <div className="flex flex-col gap-2">
              <Alert tone="error">{T.PLAN_LOAD_ERROR}</Alert>
              <Button
                type="button"
                variant="ghost"
                disabled={issue.isPending}
                onClick={() => void refreshPlans()}
              >
                {T.REFRESH_PLANS}
              </Button>
            </div>
          )}
          {!plansError && !plansLoading && activePlans.length === 0 && (
            <div className="flex flex-col gap-2">
              <Alert tone="info">{T.PLAN_LOAD_ERROR}</Alert>
              <Button
                type="button"
                variant="ghost"
                disabled={issue.isPending}
                onClick={() => void refreshPlans()}
              >
                {T.REFRESH_PLANS}
              </Button>
            </div>
          )}
        </form>
      </Modal>

      <Modal
        open={issueSuccess !== null}
        title={T.ISSUE_SUCCESS_TITLE}
        size="md"
        onClose={() => setIssueSuccess(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIssueSuccess(null)}>
              {T.CLOSE}
            </Button>
            <Button
              onClick={() => {
                if (!issueSuccess) return;
                const publicId = issueSuccess.publicId;
                setIssueSuccess(null);
                void revealCode({ publicId });
              }}
            >
              {T.REVEAL}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--ink-secondary)]">{T.ISSUE_SUCCESS_DESCRIPTION}</p>
          {issueSuccess && (
            <dl className="grid gap-3 rounded-md border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{T.ISSUE_SUCCESS_PLAN}</dt>
                <dd className="mt-1 font-medium text-[var(--ink-primary)]">{issueSuccessPlanName}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">{T.ISSUE_SUCCESS_EXPIRY}</dt>
                <dd className="mt-1 font-medium text-[var(--ink-primary)]">
                  {formatDate(issueSuccess.codeExpiresAt)}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </Modal>

      <Modal
        open={lookupDialogOpen}
        title={T.LOOKUP_TITLE}
        size="md"
        onClose={() => setLookupDialogOpen(false)}
        footer={
          <Button variant="ghost" onClick={() => setLookupDialogOpen(false)}>
            {T.CLOSE}
          </Button>
        }
      >
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => void lookupCode(event)}
        >
          <Input
            id="license-code-lookup"
            label={T.LOOKUP_LABEL}
            value={lookupInput}
            onChange={(event) => setLookupInput(event.target.value)}
            autoComplete="off"
            disabled={lookupBusy}
          />
          <Button type="submit" isLoading={lookupBusy} disabled={!lookupInput.trim()}>
            {T.LOOKUP}
          </Button>
        </form>
        {lookupError && <Alert tone="error">{lookupError}</Alert>}
        {lookupResult && (
          <div className="mt-4 rounded-md border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--ink-primary)]">{T.LOOKUP_RESULT}</p>
                <p className="mt-2 font-mono text-sm font-semibold text-[var(--ink-primary)]">
                  {lookupResult.maskedCode}
                </p>
              </div>
              <CommercialStatusBadge status={lookupResult.effectiveStatus} />
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--ink-secondary)]">{T.PLAN_LABEL}</dt>
                <dd className="mt-1 font-medium text-[var(--ink-primary)]">{lookupResult.planName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--ink-secondary)]">{T.RECIPIENT}</dt>
                <dd className="mt-1 font-medium text-[var(--ink-primary)]">
                  {lookupResult.recipientName ?? T.NOT_REDEEMED}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--ink-secondary)]">{T.ISSUED_AT}</dt>
                <dd className="mt-1 text-[var(--ink-primary)]">{formatDate(lookupResult.issuedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--ink-secondary)]">{T.EXPIRES_AT}</dt>
                <dd className="mt-1 text-[var(--ink-primary)]">
                  {lookupResult.codeExpiresAt ? formatDate(lookupResult.codeExpiresAt) : T.NO_EXPIRY}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--ink-secondary)]">{T.REDEEMED_AT}</dt>
                <dd className="mt-1 text-[var(--ink-primary)]">
                  {lookupResult.redeemedAt ? formatDate(lookupResult.redeemedAt) : T.NOT_REDEEMED}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmNewIntent}
        title={T.NEW_ISSUE_CONFIRM}
        description={rejected ? T.REJECTED_NEW_ISSUE : T.NEW_ISSUE_WARNING}
        confirmLabel={T.NEW_ISSUE}
        onConfirm={() => {
          if (issue.isPending) return;
          saveRecovery(null);
          issue.reset();
          setConfirmNewIntent(false);
        }}
        onClose={() => setConfirmNewIntent(false)}
      />

      <Modal
        open={revealTarget !== null}
        title={T.REVEAL_TITLE}
        size="md"
        isDismissDisabled={revealBusy}
        onClose={() => {
          if (!revealBusy) clearReveal();
        }}
        footer={
          <>
            <Button variant="ghost" disabled={revealBusy} onClick={clearReveal}>
              {T.CLOSE}
            </Button>
            <Button
              leftIcon={<CopyIcon className="h-4 w-4" />}
              disabled={!revealedCode || revealBusy}
              onClick={() => void copyRevealedCode()}
            >
              {copied ? T.COPIED : T.COPY}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-600">{T.REVEAL_DESCRIPTION}</p>
          {revealBusy && <p className="text-sm text-slate-600">{T.REVEAL}...</p>}
          {revealError && <Alert tone="error">{revealError}</Alert>}
          {revealedCode && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 font-mono text-sm font-semibold text-slate-900">
              {revealedCode}
            </div>
          )}
          {revealedCode && <p className="text-xs text-slate-600">{T.REVEALED}</p>}
        </div>
      </Modal>

      <Modal
        open={codeToRevoke !== null}
        title={T.REVOKE_TITLE}
        size="lg"
        isDismissDisabled={revoke.isPending || revokePreviewRequest.isPending}
        onClose={() => {
          if (revoke.isPending || revokePreviewRequest.isPending) return;
          setCodeToRevoke(null);
          setRevokePreview(null);
          setLocalError("");
        }}
        footer={
          <>
            <Button
              variant="ghost"
              disabled={revoke.isPending || revokePreviewRequest.isPending}
              onClick={() => {
                setCodeToRevoke(null);
                setRevokePreview(null);
              }}
            >
              {T.CLOSE}
            </Button>
            <Button
              variant="danger"
              isLoading={revoke.isPending}
              disabled={
                !revokePreview ||
                !cancelScheduledScope ||
                !preserveOpenClosed ||
                (revokePreview?.subscriptionPublicId !== null && !cancelSubscription)
              }
              onClick={() => void confirmRevoke()}
            >
              {T.REVOKE_CONFIRM}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">{T.REVOKE_DESCRIPTION}</p>
          {revokePreviewRequest.isPending && (
            <p className="text-sm text-gray-600">{T.REVOKE_PREVIEW_LOADING}</p>
          )}
          {!revokePreviewRequest.isPending && !revokePreview && (
            <div className="flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
              <span>{T.REVOKE_PREVIEW_ERROR}</span>
              {codeToRevoke && (
                <Button
                  variant="ghost"
                  onClick={() => void loadRevokePreview(codeToRevoke.publicId)}
                >
                  {T.REVOKE_PREVIEW_RETRY}
                </Button>
              )}
            </div>
          )}
          {revokePreview && (
            <>
              <div className="grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-gray-500">{impactLabel}</span>
                  <div className="font-medium text-gray-900">
                    {revokePreview.impactCategory === "EXAM_SUBSCRIPTION"
                      ? T.REVOKE_IMPACT_EXAM
                      : T.REVOKE_IMPACT_CODE_ONLY}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">{T.REVOKE_SUBSCRIPTION}</span>
                  <div className="font-medium text-gray-900">
                    {revokePreview.subscriptionStatus ?? T.EMPTY_VALUE}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">{T.REVOKE_SCHEDULED}</span>
                  <div className="font-medium text-gray-900">
                    {revokePreview.scheduledCount || T.REVOKE_NO_SCHEDULED}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">{T.REVOKE_OPEN}</span>
                  <div className="font-medium text-gray-900">{revokePreview.openCount}</div>
                </div>
                <div>
                  <span className="text-gray-500">{T.REVOKE_CLOSED}</span>
                  <div className="font-medium text-gray-900">{revokePreview.closedCount}</div>
                </div>
                <div>
                  <span className="text-gray-500">{previewValidUntilLabel}</span>
                  <div className="font-medium text-gray-900">
                    {formatDate(revokePreview.previewExpiresAt)}
                  </div>
                </div>
              </div>
              <Input
                id="license-revoke-reason"
                label={T.REVOKE_REASON}
                value={revokeReason}
                maxLength={255}
                onChange={(event) => setRevokeReason(event.target.value)}
                helperText={T.REVOKE_REASON_HELP}
                disabled={revoke.isPending}
              />
              {revokePreview.subscriptionPublicId && (
                <Checkbox
                  id="license-revoke-subscription"
                  label={T.REVOKE_ACK_SUBSCRIPTION}
                  checked={cancelSubscription}
                  onChange={(event) => setCancelSubscription(event.target.checked)}
                  disabled={revoke.isPending}
                />
              )}
              <Checkbox
                id="license-revoke-scheduled"
                label={T.REVOKE_ACK_SCHEDULED}
                checked={cancelScheduledScope}
                onChange={(event) => setCancelScheduledScope(event.target.checked)}
                disabled={revoke.isPending}
              />
              <Checkbox
                id="license-revoke-open-closed"
                label={T.REVOKE_ACK_OPEN_CLOSED}
                checked={preserveOpenClosed}
                onChange={(event) => setPreserveOpenClosed(event.target.checked)}
                disabled={revoke.isPending}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
