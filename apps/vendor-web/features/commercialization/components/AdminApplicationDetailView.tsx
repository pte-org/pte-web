"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, DescriptionList, Input, PageHeader } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useApplicationsQuery, useApproveApplication, useRejectApplication } from "../api";
import { ADMIN_APPLICATION_DETAIL_TEXT as T } from "../constants";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

interface AdminApplicationDetailViewProps {
  applicationId: string;
}

export const AdminApplicationDetailView = ({ applicationId }: AdminApplicationDetailViewProps): ReactElement => {
  const { data: applications = [], isLoading } = useApplicationsQuery();
  const approve = useApproveApplication();
  const reject = useRejectApplication();
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalSent, setApprovalSent] = useState(false);
  const application = applications.find((item) => item.publicId === applicationId);
  const mutationError = approve.error ?? reject.error;
  const errorMessage = mutationError
    ? getUserFacingApiErrorMessage(
        mutationError,
        T.UPDATE_ERROR,
      )
    : undefined;

  if (isLoading) return <p className="text-sm text-slate-500">{T.LOADING}</p>;
  if (!application) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/applications" className="text-sm font-medium text-action hover:underline">
          {T.BACK}
        </Link>
        <Alert tone="error">{T.NOT_FOUND}</Alert>
      </div>
    );
  }

  const canReview = application.status === "PENDING";
  const review = async (nextStatus: "APPROVED" | "REJECTED"): Promise<void> => {
    try {
      if (nextStatus === "APPROVED") {
        await approve.mutateAsync(application.publicId);
        setApprovalSent(true);
        return;
      }
      if (!rejectionReason.trim()) return;
      await reject.mutateAsync({ publicId: application.publicId, payload: { reason: rejectionReason.trim() } });
    } catch {
      // The mutation error is rendered from the TanStack Query mutation state.
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/applications" className="text-sm font-medium text-action hover:underline">
        {T.BACK}
      </Link>
      <PageHeader
        title={application.orgName}
        subtitle={T.REQUESTED_CODE(application.requestedCode)}
        actions={<CommercialStatusBadge status={application.status} />}
      />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {approvalSent && (
        <Alert tone="success">
          {T.APPROVED}
        </Alert>
      )}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <CommercialPanel title={T.DETAILS_TITLE} subtitle={T.DETAILS_SUBTITLE}>
          <DescriptionList
            items={[
              { label: T.ORGANIZATION_TYPE, value: application.orgType },
              { label: T.REQUESTED_TENANT_CODE, value: application.requestedCode },
              { label: T.WORK_EMAIL, value: application.contactEmail },
              { label: T.PHONE, value: application.contactPhone ?? T.EMPTY_VALUE },
              { label: T.TAX_CODE, value: application.taxCode ?? T.EMPTY_VALUE },
            ]}
          />
        </CommercialPanel>
        <CommercialPanel title={T.REVIEW_TITLE} subtitle={T.REVIEW_SUBTITLE}>
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{T.CURRENT_STATUS}</p>
              <div className="mt-2"><CommercialStatusBadge status={application.status} /></div>
            </div>
            <Input
              id="rejection-reason"
              label={T.REJECTION_REASON_LABEL}
              placeholder={T.REJECTION_REASON_PLACEHOLDER}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              disabled={!canReview || reject.isPending}
              required={canReview}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => void review("APPROVED")} disabled={!canReview || approve.isPending}>
                {approve.isPending ? T.APPROVING : T.APPROVE}
              </Button>
              <Button size="sm" variant="danger" onClick={() => void review("REJECTED")} disabled={!canReview || reject.isPending || !rejectionReason.trim()}>
                {reject.isPending ? T.REJECTING : T.REJECT}
              </Button>
            </div>
          </div>
        </CommercialPanel>
      </div>
    </div>
  );
};
