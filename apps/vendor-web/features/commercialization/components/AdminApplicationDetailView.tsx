"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, DescriptionList, Input, PageHeader } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useApplicationsQuery, useApproveApplication, useRejectApplication } from "../api";
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
        "The application could not be updated. Please try again.",
      )
    : undefined;

  if (isLoading) return <p className="text-sm text-slate-500">Loading application...</p>;
  if (!application) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/applications" className="text-sm font-medium text-action hover:underline">
          &larr; Back to applications
        </Link>
        <Alert tone="error">This application was not found or is no longer available.</Alert>
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
        &larr; Back to applications
      </Link>
      <PageHeader
        title={application.orgName}
        subtitle={`Requested code ${application.requestedCode}`}
        actions={<CommercialStatusBadge status={application.status} />}
      />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {approvalSent && (
        <Alert tone="success">
          Application approved. One-time host credentials were sent to the contact email.
        </Alert>
      )}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <CommercialPanel title="Application details" subtitle="Submitted organization information.">
          <DescriptionList
            items={[
              { label: "Organization type", value: application.orgType },
              { label: "Requested tenant code", value: application.requestedCode },
              { label: "Work email", value: application.contactEmail },
              { label: "Phone number", value: application.contactPhone ?? "—" },
              { label: "Tax code", value: application.taxCode ?? "—" },
            ]}
          />
        </CommercialPanel>
        <CommercialPanel title="Review decision" subtitle="Approve access or record a reason for rejection.">
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current status</p>
              <div className="mt-2"><CommercialStatusBadge status={application.status} /></div>
            </div>
            <Input
              id="rejection-reason"
              label="Rejection reason"
              placeholder="Explain what must be corrected"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              disabled={!canReview || reject.isPending}
              required={canReview}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => void review("APPROVED")} disabled={!canReview || approve.isPending}>
                {approve.isPending ? "Approving..." : "Approve application"}
              </Button>
              <Button size="sm" variant="danger" onClick={() => void review("REJECTED")} disabled={!canReview || reject.isPending || !rejectionReason.trim()}>
                {reject.isPending ? "Rejecting..." : "Reject application"}
              </Button>
            </div>
          </div>
        </CommercialPanel>
      </div>
    </div>
  );
};
