"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, DescriptionList, Input, PageHeader } from "@pte/ui";
import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { useApplicationQuery, useApproveApplication, useRejectApplication } from "../api";
import { ADMIN_APPLICATION_DETAIL_TEXT as RAW_ADMIN_APPLICATION_DETAIL_TEXT } from "../constants";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface AdminApplicationDetailViewProps {
  applicationId: string;
}

type ReviewAction = "approve" | "reject";

const AdminApplicationDetailContent = ({
  applicationId,
}: AdminApplicationDetailViewProps): ReactElement => {
  const T = useAdminCopy(RAW_ADMIN_APPLICATION_DETAIL_TEXT);
  const organizationTypeLabels = useAdminCopy({
    SCHOOL: "School",
    UNIVERSITY: "University",
    TRAINING_CENTER: "Training Center",
    CORPORATE: "Corporate",
  });
  const applicationQuery = useApplicationQuery(applicationId);
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalSent, setApprovalSent] = useState(false);
  const [lastAction, setLastAction] = useState<ReviewAction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const mutationError =
    lastAction === "approve" ? approve.error : lastAction === "reject" ? reject.error : undefined;
  const errorMessage = mutationError
    ? mutationError instanceof ApiError && mutationError.kind === "conflict"
      ? T.UNCERTAIN
      : getUserFacingApiErrorMessage(mutationError, T.UPDATE_ERROR)
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
    setRefreshFailed(false);
    setIsRefreshing(true);
    void applicationQuery.refetch().then(
      (result) => {
        if (result.error) {
          setRefreshFailed(true);
        } else {
          if (action === "approve") approve.reset();
          if (action === "reject") reject.reset();
          setLastAction(null);
        }
        setIsRefreshing(false);
      },
      () => {
        setRefreshFailed(true);
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
  const review = (nextStatus: "APPROVED" | "REJECTED"): void => {
    if (nextStatus === "APPROVED") {
      setLastAction("approve");
      approve.mutate(application.publicId, {
        onSuccess: () => setApprovalSent(true),
        onError: (error) => handleReviewError(error, "approve"),
      });
      return;
    }
    const reason = rejectionReason.trim();
    if (!reason) return;
    setLastAction("reject");
    reject.mutate(
      { publicId: application.publicId, payload: { reason } },
      { onError: (error) => handleReviewError(error, "reject") },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={application.orgName}
        subtitle={T.REQUESTED_CODE(application.requestedCode)}
        actions={<CommercialStatusBadge status={application.status} />}
      />
      {refreshFailed && <Alert tone="error">{T.REFRESH_ERROR}</Alert>}
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {approvalSent && <Alert tone="success">{T.APPROVED}</Alert>}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <CommercialPanel title={T.DETAILS_TITLE}>
          <DescriptionList
            items={[
              {
                label: T.ORGANIZATION_TYPE,
                value:
                  organizationTypeLabels[
                    application.orgType as keyof typeof organizationTypeLabels
                  ] ?? application.orgType,
              },
              { label: T.REQUESTED_TENANT_CODE, value: application.requestedCode },
              { label: T.WORK_EMAIL, value: application.contactEmail },
              { label: T.PHONE, value: application.contactPhone ?? T.EMPTY_VALUE },
              { label: T.TAX_CODE, value: application.taxCode ?? T.EMPTY_VALUE },
              ...(application.reviewedBy
                ? [{ label: T.REVIEWED_BY, value: application.reviewedBy }]
                : []),
              ...(application.reviewedAt
                ? [
                    {
                      label: T.REVIEWED_AT,
                      value: new Date(application.reviewedAt).toLocaleString(),
                    },
                  ]
                : []),
              ...(application.rejectReason
                ? [{ label: T.REJECTION_REASON_LABEL, value: application.rejectReason }]
                : []),
            ]}
          />
        </CommercialPanel>
        <CommercialPanel title={T.REVIEW_TITLE}>
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {T.CURRENT_STATUS}
              </p>
              <div className="mt-2">
                <CommercialStatusBadge status={application.status} />
              </div>
            </div>
            <Input
              id="rejection-reason"
              label={T.REJECTION_REASON_LABEL}
              placeholder={T.REJECTION_REASON_PLACEHOLDER}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              disabled={!canReview || isReviewing}
              required={canReview}
              maxLength={500}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => void review("APPROVED")}
                disabled={!canReview || isReviewing}
              >
                {approve.isPending ? T.APPROVING : T.APPROVE}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => void review("REJECTED")}
                disabled={!canReview || isReviewing || !rejectionReason.trim()}
              >
                {reject.isPending ? T.REJECTING : T.REJECT}
              </Button>
            </div>
          </div>
        </CommercialPanel>
      </div>
    </div>
  );
};

export const AdminApplicationDetailView = ({
  applicationId,
}: AdminApplicationDetailViewProps): ReactElement => (
  <AdminApplicationDetailContent key={applicationId} applicationId={applicationId} />
);
