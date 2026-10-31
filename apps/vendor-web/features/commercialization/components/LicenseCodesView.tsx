"use client";

import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import {
  ActionMenu,
  Alert,
  BanIcon,
  Button,
  Checkbox,
  CopyIcon,
  DataTable,
  EyeIcon,
  Input,
  Modal,
  PaginationControls,
  subscribeSessionLifecycle,
  useSessionManager,
  useToast,
} from "@pte/ui";
import {
  ApiError,
  getUserFacingApiErrorMessage,
  type AdminLicenseCodeSummary,
  type ConfirmLicenseRevokeRequest,
  type LicenseRevokePreviewResponse,
} from "@pte/api-client";
import {
  lookupAdminLicenseCode,
  revealAdminLicenseCode,
  useAdminLicenseCodesQuery,
  useLicenseCodeRevokePreview,
  useRevokeLicenseCode,
} from "../api";
import { LICENSE_CODES_TEXT as RAW_LICENSE_CODES_TEXT } from "../constants";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";
import { GrantLicenseWizard } from "@/features/licenseGrant/components";
import { formatContractDate } from "@/features/licenseGrant/utils";
import { isPlatformAdmin } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useAdminSearchText } from "@/features/i18n/adminSearchCopy";
import { useDebouncedSearch } from "@/features/i18n/useDebouncedSearch";

const DEFAULT_PAGE_SIZE = 25;
/**
 * Hidden: admin grants never set a code deadline, so the column only ever showed "—". Legacy code expiry stays
 * visible through the Expired status badge and the Lookup dialog. Set to true to show it again.
 */
const SHOW_CODE_EXPIRY_COLUMN = false;
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

type LicenseCodeRevealTarget = Pick<AdminLicenseCodeSummary, "publicId">;

const safeOperationMessage = (error: unknown, fallback: string): string =>
  getUserFacingApiErrorMessage(error, fallback);

export const LicenseCodesView = (): ReactElement => {
  const T = useAdminCopy(RAW_LICENSE_CODES_TEXT);
  const searchText = useAdminSearchText("licenseCodes");
  const statusOptions = useAdminCopy(LICENSE_STATUS_FILTER_OPTIONS);
  const dateRangeLabel = useAdminCopy("Date range");
  const impactLabel = useAdminCopy("Impact");
  const previewValidUntilLabel = useAdminCopy("Preview valid until");
  const { session } = useSessionManager();
  const { showToast } = useToast();
  const canUseSensitiveActions = isPlatformAdmin(session?.roles);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const activationCodeSearch = isActivationCodeSearch(debouncedSearch);
  const [codeSearchResult, setCodeSearchResult] = useState<AdminLicenseCodeSummary | null>(null);
  const [codeSearchNotFound, setCodeSearchNotFound] = useState(false);
  const [codeSearchError, setCodeSearchError] = useState("");
  const codePageQuery = useAdminLicenseCodesQuery({
    page,
    size,
    search: activationCodeSearch ? "UNSUPPORTED" : debouncedSearch,
  });
  const revokePreviewRequest = useLicenseCodeRevokePreview();
  const revoke = useRevokeLicenseCode();

  const [grantOpen, setGrantOpen] = useState(false);
  const [codeToRevoke, setCodeToRevoke] = useState<AdminLicenseCodeSummary | null>(null);
  const [revokePreview, setRevokePreview] = useState<LicenseRevokePreviewResponse | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>(T.REVOKE_REASON);
  const [cancelSubscription, setCancelSubscription] = useState(false);
  const [cancelScheduledScope, setCancelScheduledScope] = useState(false);
  const [preserveOpenClosed, setPreserveOpenClosed] = useState(false);
  const [localError, setLocalError] = useState("");

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

  const codeSearchBusy =
    activationCodeSearch && codeSearchResult === null && !codeSearchNotFound && !codeSearchError;
  const codes = activationCodeSearch
    ? codeSearchResult
      ? [codeSearchResult]
      : []
    : codePageQuery.data?.data ?? [];
  const isFiltered = Boolean(search.trim());
  const error = revoke.error ?? revokePreviewRequest.error ?? codePageQuery.error ?? codeSearchError;
  const errorMessage =
    localError ||
    (error ? safeOperationMessage(error, T.ERROR) : codePageQuery.isError ? T.ERROR : undefined);

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
        setGrantOpen(false);
        setLocalError("");
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

      <CommercialPanel
        title={T.TITLE}
        subtitle={T.INVENTORY_SUBTITLE}
        actions={
          <>
            <Button type="button" onClick={() => setGrantOpen(true)}>
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
              key: "contract",
              header: T.CONTRACT,
              cell: (row: AdminLicenseCodeSummary) => row.contractReference ?? T.EMPTY_VALUE,
            },
            {
              key: "period",
              header: T.PERIOD,
              cell: (row: AdminLicenseCodeSummary) =>
                row.subscriptionStartsAt && row.subscriptionExpiresAt
                  ? `${formatContractDate(row.subscriptionStartsAt)} – ${formatContractDate(row.subscriptionExpiresAt)}`
                  : T.EMPTY_VALUE,
            },
            {
              key: "issued",
              header: T.ISSUED,
              filterType: "date-range",
              filterAccessor: (row: AdminLicenseCodeSummary) => row.issuedAt,
              filterPlaceholder: dateRangeLabel,
              cell: (row: AdminLicenseCodeSummary) => formatDate(row.issuedAt),
            },
            ...(SHOW_CODE_EXPIRY_COLUMN
              ? [
                  {
                    key: "expires",
                    header: T.EXPIRES,
                    filterType: "date-range" as const,
                    filterAccessor: (row: AdminLicenseCodeSummary) => row.codeExpiresAt,
                    filterPlaceholder: dateRangeLabel,
                    cell: (row: AdminLicenseCodeSummary) => formatDate(row.codeExpiresAt),
                  },
                ]
              : []),
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

      <GrantLicenseWizard open={grantOpen} onClose={() => setGrantOpen(false)} />

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
