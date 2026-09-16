"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, DataTable, Input, PageHeader } from "@pte/ui";
import { DEMO_LICENSE_CODES } from "../data";
import type { LicenseCode } from "../types";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

export const LicenseCodesView = (): ReactElement => {
  const [tenant, setTenant] = useState("");
  const [issued, setIssued] = useState(false);

  const issueCode = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!tenant.trim()) return;
    setIssued(true);
    setTenant("");
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="License codes" subtitle="Issue and track redeemable exam package codes." />
      {issued && (
        <Alert tone="success" title="License code issued">
          A new code is ready to send to the tenant administrator.
        </Alert>
      )}
      <CommercialPanel title="Issue a code" subtitle="Codes are limited to an active exam package.">
        <form
          className="grid gap-4 sm:grid-cols-[1fr_220px_auto] sm:items-end"
          onSubmit={issueCode}
        >
          <Input
            id="license-tenant"
            label="Tenant"
            placeholder="Search tenant name"
            value={tenant}
            onChange={(event) => setTenant(event.target.value)}
            required
          />
          <Input id="license-plan" label="Plan" value="Exam Starter" readOnly />
          <Button type="submit">Issue code</Button>
        </form>
      </CommercialPanel>
      <CommercialPanel
        title="Issued codes"
        subtitle="Codes are shown once here for operational tracking."
      >
        <DataTable
          columns={[
            {
              key: "code",
              header: "Code",
              cell: (row: LicenseCode) => (
                <span className="font-mono text-xs font-semibold text-slate-900">{row.code}</span>
              ),
            },
            { key: "plan", header: "Plan", cell: (row: LicenseCode) => row.plan },
            { key: "tenant", header: "Tenant", cell: (row: LicenseCode) => row.tenant },
            { key: "issued", header: "Issued", cell: (row: LicenseCode) => row.issuedAt },
            {
              key: "status",
              header: "Status",
              cell: (row: LicenseCode) => <CommercialStatusBadge status={row.status} />,
            },
          ]}
          rows={DEMO_LICENSE_CODES}
          getRowKey={(row) => row.id}
          rowActions={() => (
            <button type="button" className="text-sm font-semibold text-action hover:underline">
              Revoke
            </button>
          )}
          rowActionsHeader=""
        />
      </CommercialPanel>
    </div>
  );
};
