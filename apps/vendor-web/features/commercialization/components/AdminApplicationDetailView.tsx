"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, DescriptionList, Input, PageHeader } from "@pte/ui";
import { DEMO_APPLICATIONS } from "../data";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

interface AdminApplicationDetailViewProps {
  applicationId: string;
}

export const AdminApplicationDetailView = ({
  applicationId,
}: AdminApplicationDetailViewProps): ReactElement => {
  const application = useMemo(
    () => DEMO_APPLICATIONS.find((item) => item.id === applicationId) ?? DEMO_APPLICATIONS[0],
    [applicationId],
  );
  const [status, setStatus] = useState(application.status);
  const [rejectionReason, setRejectionReason] = useState(application.note ?? "");
  const [saved, setSaved] = useState(false);

  const review = (nextStatus: "APPROVED" | "REJECTED"): void => {
    setStatus(nextStatus);
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/applications" className="text-sm font-medium text-action hover:underline">
        &larr; Back to applications
      </Link>
      <PageHeader
        title={application.organizationName}
        subtitle={`${application.reference} · Submitted ${application.submittedAt}`}
        actions={<CommercialStatusBadge status={status} />}
      />
      {saved && (
        <Alert tone="success" title="Review saved">
          The application status is ready to sync with the approval workflow.
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <CommercialPanel title="Application details" subtitle="Submitted organization information.">
          <DescriptionList
            items={[
              { label: "Organization type", value: application.organizationType },
              { label: "Requested tenant code", value: application.tenantCode },
              { label: "Representative", value: application.representative },
              { label: "Work email", value: application.email },
              { label: "Phone number", value: application.phone },
              { label: "Application reference", value: application.reference },
            ]}
          />
        </CommercialPanel>

        <CommercialPanel
          title="Review decision"
          subtitle="Approve access or record a reason for rejection."
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current status
              </p>
              <div className="mt-2">
                <CommercialStatusBadge status={status} />
              </div>
            </div>
            <Input
              id="rejection-reason"
              label="Rejection reason"
              placeholder="Optional review note"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => review("APPROVED")} disabled={status === "APPROVED"}>
                Approve application
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => review("REJECTED")}
                disabled={status === "REJECTED"}
              >
                Reject application
              </Button>
            </div>
          </div>
        </CommercialPanel>
      </div>

      <CommercialPanel title="Next steps" subtitle="What happens after approval.">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Create tenant", "Reserve the tenant code and workspace."],
            ["2", "Create host admin", "Issue the initial sign-in invitation."],
            ["3", "Unlock plans", "The organization can purchase a plan."],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-md border border-slate-200 p-4">
              <span className="text-sm font-semibold text-action">{step}</span>
              <p className="mt-2 text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </CommercialPanel>
    </div>
  );
};
