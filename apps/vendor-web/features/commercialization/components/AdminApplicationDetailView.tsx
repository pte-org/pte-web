"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useState, type ReactElement } from "react";
import { Alert, useToast, useDashboardBreadcrumbLabel, useLocale, CheckIcon, XIcon } from "@pte/ui";
import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { useApplicationQuery, useApproveApplication, useRejectApplication } from "../api";
import {
  ADMIN_APPLICATION_DETAIL_TEXT as RAW_ADMIN_APPLICATION_DETAIL_TEXT,
  APPLICATIONS_LIST_PATH,
} from "../constants";
import { formatDateTime, formatElapsed } from "../applicationFormat";
import { ApplicationInfoSections } from "./ApplicationInfoSections";
import { CommercialStatusBadge } from "./CommercialStatusBadge";
import { RejectApplicationDialog } from "./RejectApplicationDialog";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface AdminApplicationDetailViewProps {
  applicationId: string;
}

type ReviewAction = "approve" | "reject";

const AdminApplicationDetailContent = ({
  applicationId,
}: AdminApplicationDetailViewProps): ReactElement => {
  const T = useAdminCopy(RAW_ADMIN_APPLICATION_DETAIL_TEXT);
  // Values the public registration form submits; unknown ones fall back to the raw value.
  const organizationTypeLabels = useAdminCopy({
    school: "School",
    university: "University",
    "language-center": "Language center",
    other: "Other",
  });
  const applicationQuery = useApplicationQuery(applicationId);
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, applicationQuery.data?.orgName);
  const { showToast } = useToast();
  const { locale } = useLocale();
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [nowMs] = useState(() => Date.now());
  const [lastAction, setLastAction] = useState<ReviewAction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const mutationError =
    lastAction === "approve" ? approve.error : lastAction === "reject" ? reject.error : undefined;
  const errorMessage = mutationError
    ? getUserFacingApiErrorMessage(
        mutationError,
        mutationError instanceof ApiError && mutationError.kind === "conflict"
          ? T.UNCERTAIN
          : T.UPDATE_ERROR,
      )
    : undefined;

  if (applicationQuery.isLoading) return <p className="text-sm text-slate-500">{T.LOADING}</p>;

  if (applicationQuery.error) {
    const error = applicationQuery.error;
    const message =
      error instanceof ApiError && error.status === 403
        ? T.FORBIDDEN
        : error instanceof ApiError && error.status === 404
          ? T.NOT_FOUND
          : getUserFacingApiErrorMessage(error, T.LOAD_ERROR);
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="error">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{message}</span>
            {!(error instanceof ApiError && (error.status === 403 || error.status === 404)) && (
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => void applicationQuery.refetch()}
              >
                {T.RETRY}
              </button>
            )}
          </div>
        </Alert>
      </div>
    );
  }

  const application = applicationQuery.data;
  if (!application) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="error">{T.NOT_FOUND}</Alert>
      </div>
    );
  }

  const canReview = application.status === "PENDING";
  const isReviewing = approve.isPending || reject.isPending || isRefreshing;
  const refreshAfterUncertainResult = (action: ReviewAction): void => {
    setIsRefreshing(true);
    void applicationQuery.refetch().then(
      (result) => {
        if (result.error) {
          showToast(T.REFRESH_ERROR, { tone: "error" });
        } else if (result.data?.status !== "PENDING") {
          // The decision was already settled elsewhere; a still-pending application keeps its rejection reason on screen.
          if (action === "approve") approve.reset();
          if (action === "reject") reject.reset();
          setLastAction(null);
        }
        setIsRefreshing(false);
      },
      () => {
        showToast(T.REFRESH_ERROR, { tone: "error" });
        setIsRefreshing(false);
      },
    );
  };
  const handleReviewError = (error: unknown, action: ReviewAction): void => {
    if (
      error instanceof ApiError &&
      (error.kind === "conflict" || error.kind === "network" || error.kind === "server")
    ) {
      refreshAfterUncertainResult(action);
    }
  };
  const approveApplication = (): void => {
    setLastAction("approve");
    approve.mutate(application.publicId, {
      onSuccess: () => showToast(T.APPROVED, { tone: "success" }),
      onError: (error) => handleReviewError(error, "approve"),
    });
  };
  const rejectApplication = (reason: string): void => {
    setLastAction("reject");
    reject.mutate(
      { publicId: application.publicId, payload: { reason } },
      {
        onSuccess: () => setIsRejectOpen(false),
        onError: (error) => handleReviewError(error, "reject"),
      },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <Link
            href={APPLICATIONS_LIST_PATH}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
            title={T.BACK}
            aria-label={T.BACK}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {application.orgName}
              </h1>
              <CommercialStatusBadge status={application.status} />
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                {application.requestedCode}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {T.SUBMITTED_AT}: {formatDateTime(application.submittedAt, locale)} (
              {formatElapsed(application.submittedAt, locale, nowMs)})
            </p>
          </div>
        </div>

        {canReview && (
          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsRejectOpen(true)}
              disabled={isReviewing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 shadow-xs transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
            >
              <XIcon className="h-3.5 w-3.5" />
              <span>{T.REJECT_ACTION}</span>
            </button>
            <button
              type="button"
              onClick={approveApplication}
              disabled={isReviewing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4 stroke-[2.5]" />
              <span>{approve.isPending ? T.APPROVING : T.APPROVE_ACTION}</span>
            </button>
          </div>
        )}
      </div>

      {errorMessage && lastAction !== "reject" && <Alert tone="error">{errorMessage}</Alert>}

      <ApplicationInfoSections
        application={application}
        text={T}
        organizationTypeLabels={organizationTypeLabels}
        nowMs={nowMs}
      />
      <RejectApplicationDialog
        key={String(isRejectOpen)}
        open={isRejectOpen && canReview}
        title={T.REJECT_DIALOG_TITLE}
        description={T.REJECT_DIALOG_DESCRIPTION}
        reasonLabel={T.REJECTION_REASON_LABEL}
        reasonPlaceholder={T.REJECTION_REASON_PLACEHOLDER}
        confirmLabel={T.REJECT}
        pendingLabel={T.REJECTING}
        cancelLabel={T.CANCEL}
        isRejecting={reject.isPending}
        errorMessage={lastAction === "reject" ? errorMessage : undefined}
        onConfirm={rejectApplication}
        onClose={() => setIsRejectOpen(false)}
      />
    </div>
  );
};

export const AdminApplicationDetailView = ({
  applicationId,
}: AdminApplicationDetailViewProps): ReactElement => (
  <AdminApplicationDetailContent key={applicationId} applicationId={applicationId} />
);
