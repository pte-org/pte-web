"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { BuildingIcon, DataTable, PageHeader, Select, StatCard, UsersIcon } from "@pte/ui";
import { DEMO_APPLICATIONS } from "../data";
import type { ApplicationStatus, TenantApplication } from "../types";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export const AdminApplicationsView = (): ReactElement => {
  const [status, setStatus] = useState("ALL");
  const applications = useMemo(
    () =>
      DEMO_APPLICATIONS.filter((application) => status === "ALL" || application.status === status),
    [status],
  );

  const columns = [
    {
      key: "organization",
      header: "Organization",
      cell: (row: TenantApplication) => (
        <div>
          <p className="font-medium text-slate-900">{row.organizationName}</p>
          <p className="mt-1 text-xs text-slate-500">{row.reference}</p>
        </div>
      ),
    },
    {
      key: "representative",
      header: "Representative",
      cell: (row: TenantApplication) => (
        <div>
          <p>{row.representative}</p>
          <p className="mt-1 text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    { key: "submitted", header: "Submitted", cell: (row: TenantApplication) => row.submittedAt },
    {
      key: "status",
      header: "Status",
      cell: (row: TenantApplication) => <CommercialStatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Tenant applications"
        subtitle="Review organization requests before workspace access is created."
        actions={
          <Select
            id="application-status"
            aria-label="Filter applications by status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-w-36"
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total applications" value="24" icon={<BuildingIcon />} accent="blue" />
        <StatCard label="Needs review" value="7" icon={<UsersIcon />} accent="cream" highlight />
        <StatCard label="Approved this month" value="12" icon={<BuildingIcon />} accent="mint" />
      </div>

      <DataTable
        columns={columns}
        rows={applications}
        getRowKey={(row) => row.id}
        rowActions={(row) => (
          <Link
            href={`/admin/applications/${row.id}`}
            className="text-sm font-semibold text-action hover:underline"
          >
            View detail
          </Link>
        )}
        rowActionsHeader=""
        emptyTitle="No applications found"
        emptyDescription="Try another status filter."
      />
    </div>
  );
};

export const applicationStatusLabel = (status: ApplicationStatus): string =>
  status.charAt(0) + status.slice(1).toLowerCase();
