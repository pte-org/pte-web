"use client";

import { useSyncExternalStore, useState, type FormEvent, type ReactElement } from "react";
import {
  ActionMenu,
  Alert,
  BanIcon,
  Button,
  Checkbox,
  ConfirmDialog,
  DataTable,
  Input,
  Modal,
  PageHeader,
  Select,
  useSessionManager,
} from "@pte/ui";
import {
  ApiError,
  decodeAccessTokenClaims,
  getUserFacingApiErrorMessage,
  type ConfirmLicenseRevokeRequest,
  type IssueLicenseCodeRequest,
  type LicenseCodeResponse,
  type LicenseRevokePreviewResponse,
} from "@pte/api-client";
import {
  useIssueLicenseCode,
  useLicenseCodeRevokePreview,
  useLicenseCodesQuery,
  usePlansQuery,
  useRevokeLicenseCode,
} from "../api";
import { LICENSE_CODES_TEXT as T } from "../constants";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleString() : T.EMPTY_VALUE;

type IssueIntent = { idempotencyKey: string; payload: IssueLicenseCodeRequest };
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
  return () => { window.removeEventListener("storage", notify); window.removeEventListener("license-issue-intent", notify); };
};
const parseRecovery = (stored: string | null): IssueIntent | null => {
  try {
    const value: unknown = stored ? JSON.parse(stored) : null;
    if (typeof value !== "object" || value === null || !("idempotencyKey" in value)
        || typeof value.idempotencyKey !== "string" || !("payload" in value)
        || typeof value.payload !== "object" || value.payload === null || !("planId" in value.payload)
        || typeof value.payload.planId !== "string" || !("codeExpiresAt" in value.payload)
        || (value.payload.codeExpiresAt !== null && typeof value.payload.codeExpiresAt !== "string")) return null;
    return { idempotencyKey: value.idempotencyKey, payload: { planId: value.payload.planId, codeExpiresAt: value.payload.codeExpiresAt } };
  } catch { return null; }
};

export const LicenseCodesView = (): ReactElement => {
  const { data: codes = [], isLoading, isError } = useLicenseCodesQuery();
  const { data: plans = [], refetch: refreshPlans, isError: plansError } = usePlansQuery();
  const issue = useIssueLicenseCode();
  const revokePreviewRequest = useLicenseCodeRevokePreview();
  const revoke = useRevokeLicenseCode();
  const [planId, setPlanId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [codeToRevoke, setCodeToRevoke] = useState<LicenseCodeResponse | null>(null);
  const [revokePreview, setRevokePreview] = useState<LicenseRevokePreviewResponse | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>(T.REVOKE_REASON);
  const [cancelSubscription, setCancelSubscription] = useState(false);
  const [cancelScheduledScope, setCancelScheduledScope] = useState(false);
  const [preserveOpenClosed, setPreserveOpenClosed] = useState(false);
  const [message, setMessage] = useState("");
  const [memoryRecovery, setMemoryRecovery] = useState<{ owner: string; intent: IssueIntent | null } | null>(null);
  const [localError, setLocalError] = useState("");
  const [confirmNewIntent, setConfirmNewIntent] = useState(false);
  const { session, isReady } = useSessionManager();
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const recoveryKey = actorId ? `pte-license-issue:${actorId}` : null;
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const expiryDate = expiresAt ? new Date(expiresAt) : null;
  const utcPreview = expiryDate && !Number.isNaN(expiryDate.getTime()) ? expiryDate.toISOString() : T.EMPTY_VALUE;

  const storedIntent = useSyncExternalStore(subscribeRecovery, () => {
    try { return recoveryKey ? window.sessionStorage.getItem(recoveryKey) : null; } catch { return null; }
  }, () => null);
  const intent = memoryRecovery?.owner === recoveryKey ? memoryRecovery.intent : parseRecovery(storedIntent);
  const issueErrorCode = issue.error instanceof ApiError ? issue.error.code : undefined;
  const rejected = issueErrorCode !== undefined && SAFE_NEW_INTENT_ERROR_CODES.has(issueErrorCode);
  const saveRecovery = (next: IssueIntent | null): void => {
    if (!recoveryKey) return;
    setMemoryRecovery({ owner: recoveryKey, intent: next });
    try {
      if (next) window.sessionStorage.setItem(recoveryKey, JSON.stringify(next));
      else window.sessionStorage.removeItem(recoveryKey);
      window.dispatchEvent(new Event("license-issue-intent"));
    } catch { /* Current-page retry still uses in-memory state when storage is unavailable. */ }
  };
  const activePlans = plans.filter(
    (plan) => plan.type === "EXAM_PACKAGE" && plan.status === "ACTIVE",
  );
  const error = issue.error ?? revoke.error ?? revokePreviewRequest.error;
  const errorMessage = localError || (error
    ? getUserFacingApiErrorMessage(error, T.ERROR)
    : isError || plansError
      ? T.ERROR
      : undefined);

  const issueCode = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (issue.isPending || !recoveryKey) return;
    setLocalError("");
    setMessage("");
    const submittedExpiry = expiresAt ? new Date(expiresAt) : null;
    if (!intent && (!planId || (submittedExpiry && (Number.isNaN(submittedExpiry.getTime()) || submittedExpiry.getTime() <= new Date().getTime())))) {
      setLocalError(T.INVALID_EXPIRY);
      return;
    }
    const next = intent ?? { idempotencyKey: crypto.randomUUID(), payload: {
      planId, codeExpiresAt: submittedExpiry ? submittedExpiry.toISOString() : null,
    } };
    saveRecovery(next);
    try {
      const result = await issue.mutateAsync(next);
      setMessage(result.replayed ? T.RECOVERED_SUCCESS(result.publicId) : T.ISSUED_SUCCESS(result.publicId));
      saveRecovery(null);
      setPlanId("");
      setExpiresAt("");
    } catch { /* Mutation error is rendered; retry retains the same key and payload. */ }
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
    } catch { /* Preview failure is rendered and cannot be confirmed blindly. */ }
  };

  const beginRevoke = (row: LicenseCodeResponse): void => {
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
    if (!codeToRevoke || !revokePreview
        || !cancelScheduledScope || !preserveOpenClosed
        || (revokePreview.subscriptionPublicId !== null && !cancelSubscription)) return;
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
      await revoke.mutateAsync({
        publicId: codeToRevoke.publicId,
        payload,
      });
      setMessage(T.REVOKED_SUCCESS(codeToRevoke.publicId));
      setCodeToRevoke(null);
      setRevokePreview(null);
    } catch (caught) {
      if (caught instanceof ApiError && (
        caught.code === "LICENSE_CODE_REVOKE_SCOPE_CHANGED"
        || caught.code === "LICENSE_CODE_REVOKE_PREVIEW_EXPIRED"
      )) {
        setLocalError(caught.code === "LICENSE_CODE_REVOKE_PREVIEW_EXPIRED"
          ? T.REVOKE_PREVIEW_EXPIRED : T.REVOKE_SCOPE_CHANGED);
        void loadRevokePreview(codeToRevoke.publicId);
      }
      /* Keep confirmation open; a response loss must not blindly resubmit. */
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={T.TITLE} subtitle={T.SUBTITLE} />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}
      {intent && <Alert tone="warning">{issue.isPending ? T.ISSUE_PENDING : rejected ? T.ISSUE_REJECTED : T.UNCERTAIN} {intent.payload.planId} · {intent.payload.codeExpiresAt ?? T.EMPTY_VALUE}</Alert>}
      <CommercialPanel title={T.ISSUE_TITLE} subtitle={T.ISSUE_SUBTITLE}>
        <form
          className="grid gap-4 sm:grid-cols-[1fr_220px_auto] sm:items-end"
          onSubmit={(event) => void issueCode(event)}
        >
          <Select
            id="license-plan"
            label={T.PLAN_LABEL}
            placeholder={T.PLAN_PLACEHOLDER}
            options={activePlans.map((plan) => ({ label: plan.name, value: plan.publicId }))}
            value={planId}
            onChange={(event) => setPlanId(event.target.value)}
            required
            disabled={intent !== null || issue.isPending}
          />
          <Input
            id="license-expires"
            label={T.EXPIRY_LABEL}
            type="datetime-local"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            disabled={intent !== null || issue.isPending}
          />
          <Button type="submit" isLoading={issue.isPending} disabled={!isReady || !actorId || (!planId && !intent)}>
            {intent ? T.RETRY_ISSUE : T.ISSUE}
          </Button>
        </form>
        <p className="mt-3 text-xs text-slate-600">{T.EXPIRY_HELP(zone, utcPreview)}</p>
        <Button type="button" disabled={issue.isPending} onClick={() => void refreshPlans()}>{T.REFRESH_PLANS}</Button>
        {intent && <Button type="button" disabled={issue.isPending} onClick={() => setConfirmNewIntent(true)}>
          {T.NEW_ISSUE}
        </Button>}
      </CommercialPanel>
      <CommercialPanel
        title={T.ISSUED_TITLE}
        subtitle={T.ISSUED_SUBTITLE}
      >
        <DataTable
          columns={[
            {
              key: "code",
              header: T.CODE,
              cell: (row: LicenseCodeResponse) => (
                <span className="font-mono text-xs font-semibold text-slate-900">{row.code}</span>
              ),
            },
            {
              key: "plan",
              header: T.PLAN_ID,
              cell: (row: LicenseCodeResponse) => (
                <span className="font-mono text-xs">{row.planId}</span>
              ),
            },
            {
              key: "issued",
              header: T.ISSUED,
              cell: (row: LicenseCodeResponse) => formatDate(row.issuedAt),
            },
            {
              key: "expires",
              header: T.EXPIRES,
              cell: (row: LicenseCodeResponse) => formatDate(row.codeExpiresAt),
            },
            {
              key: "status",
              header: T.STATUS,
              cell: (row: LicenseCodeResponse) => <CommercialStatusBadge status={row.status} />,
            },
          ]}
          rows={codes}
          getRowKey={(row) => row.publicId}
          rowActions={(row) =>
            (row.status === "ISSUED" || (row.status === "REDEEMED" && row.subscriptionId !== null)) ? (
              <ActionMenu
                items={[
                  {
                    label: T.REVOKE,
                    icon: BanIcon,
                    danger: true,
                    onSelect: () => beginRevoke(row),
                  },
                ]}
              />
            ) : null
          }
          rowActionsHeader=""
          emptyTitle={isLoading ? T.LOADING : T.EMPTY}
        />
      </CommercialPanel>
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
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={revoke.isPending}
              disabled={!revokePreview || !cancelScheduledScope || !preserveOpenClosed
                || (revokePreview?.subscriptionPublicId !== null && !cancelSubscription)}
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
                <Button variant="ghost" onClick={() => void loadRevokePreview(codeToRevoke.publicId)}>
                  {T.REVOKE_PREVIEW_RETRY}
                </Button>
              )}
            </div>
          )}
          {revokePreview && (
            <>
              <div className="grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm sm:grid-cols-2">
                <div><span className="text-gray-500">Impact</span><div className="font-medium text-gray-900">
                  {revokePreview.impactCategory === "EXAM_SUBSCRIPTION"
                    ? T.REVOKE_IMPACT_EXAM : T.REVOKE_IMPACT_CODE_ONLY}
                </div></div>
                <div><span className="text-gray-500">{T.REVOKE_SUBSCRIPTION}</span><div className="font-medium text-gray-900">
                  {revokePreview.subscriptionStatus ?? T.EMPTY_VALUE}
                </div></div>
                <div><span className="text-gray-500">{T.REVOKE_SCHEDULED}</span><div className="font-medium text-gray-900">
                  {revokePreview.scheduledCount || T.REVOKE_NO_SCHEDULED}
                </div></div>
                <div><span className="text-gray-500">{T.REVOKE_OPEN}</span><div className="font-medium text-gray-900">
                  {revokePreview.openCount}
                </div></div>
                <div><span className="text-gray-500">{T.REVOKE_CLOSED}</span><div className="font-medium text-gray-900">
                  {revokePreview.closedCount}
                </div></div>
                <div><span className="text-gray-500">Preview valid until</span><div className="font-medium text-gray-900">
                  {formatDate(revokePreview.previewExpiresAt)}
                </div></div>
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
