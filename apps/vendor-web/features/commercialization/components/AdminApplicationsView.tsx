"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, BuildingIcon, DataTable, PageHeader, Select, StatCard, UsersIcon } from "@pte/ui";
import { useApplicationsQuery } from "../api";
import type { TenantApplicationResponse } from "@pte/api-client";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export const AdminApplicationsView = (): ReactElement => {
  const [status, setStatus] = useState("ALL");
  const { data: applications = [], isLoading, isError } = useApplicationsQuery();
  const visibleApplications = useMemo(
    () => applications.filter((application) => status === "ALL" || application.status === status),
    [applications, status],
  );
  const pendingCount = applications.filter((item) => item.status === "PENDING").length;
  const approvedCount = applications.filter((item) => item.status === "APPROVED").length;

  const columns = [
    {
      key: "organization",
      header: "Organization",
      cell: (row: TenantApplicationResponse) => (
        <div>
          <p className="font-medium text-slate-900">{row.orgName}</p>
          <p className="mt-1 text-xs text-slate-500">{row.requestedCode}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (row: TenantApplicationResponse) => (
        <div>
          <p>{row.contactEmail}</p>
          {row.contactPhone && <p className="mt-1 text-xs text-slate-500">{row.contactPhone}</p>}
        </div>
      ),
    },
    { key: "type", header: "Type", cell: (row: TenantApplicationResponse) => row.orgType },
    {
      key: "taxCode",
      header: "Tax code",
      cell: (row: TenantApplicationResponse) => (
        <span className="font-mono text-xs">{row.taxCode ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: TenantApplicationResponse) => <CommercialStatusBadge status={row.status} />,
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
      {isError && <Alert tone="error">Applications could not be loaded. Try again shortly.</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total applications"
          value={String(applications.length)}
          icon={<BuildingIcon />}
          accent="blue"
        />
        <StatCard
          label="Needs review"
          value={String(pendingCount)}
          icon={<UsersIcon />}
          accent="cream"
          highlight
        />
        <StatCard
          label="Approved"
          value={String(approvedCount)}
          icon={<BuildingIcon />}
          accent="mint"
        />
      </div>
      <DataTable
        columns={columns}
        rows={visibleApplications}
        getRowKey={(row) => row.publicId}
        rowActions={(row) => (
          <Link
            href={`/admin/applications/${row.publicId}`}
            className="text-sm font-semibold text-action hover:underline"
          >
            View detail
          </Link>
        )}
        rowActionsHeader=""
        emptyTitle={isLoading ? "Loading applications..." : "No applications found"}
        emptyDescription={isLoading ? "" : "Try another status filter."}
      />
    </div>
  );
};
