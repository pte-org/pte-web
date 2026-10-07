"use client";

import { useMemo, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ActionMenu,
  Alert,
  BuildingIcon,
  DataTable,
  EyeIcon,
  PageHeader,
  Select,
  StatCard,
  UsersIcon,
} from "@pte/ui";
import { useApplicationsQuery } from "../api";
import type { TenantApplicationResponse } from "@pte/api-client";
import { ADMIN_APPLICATIONS_TEXT as T } from "../constants";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

const STATUS_OPTIONS = [
  { label: T.ALL_STATUSES, value: "ALL" },
  { label: T.PENDING, value: "PENDING" },
  { label: T.APPROVED, value: "APPROVED" },
  { label: T.REJECTED, value: "REJECTED" },
];

export const AdminApplicationsView = (): ReactElement => {
  const router = useRouter();
  const [status, setStatus] = useState("ALL");
  const { data: applications = [], isLoading, isError, refetch } = useApplicationsQuery();
  const visibleApplications = useMemo(
    () => applications.filter((application) => status === "ALL" || application.status === status),
    [applications, status],
  );
  const pendingCount = applications.filter((item) => item.status === "PENDING").length;
  const approvedCount = applications.filter((item) => item.status === "APPROVED").length;

  const columns = [
    {
      key: "organization",
      header: T.COLUMN_ORGANIZATION,
      cell: (row: TenantApplicationResponse) => (
        <div>
          <p className="font-medium text-slate-900">{row.orgName}</p>
          <p className="mt-1 text-xs text-slate-500">{row.requestedCode}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: T.COLUMN_CONTACT,
      cell: (row: TenantApplicationResponse) => (
        <div>
          <p>{row.contactEmail}</p>
          {row.contactPhone && <p className="mt-1 text-xs text-slate-500">{row.contactPhone}</p>}
        </div>
      ),
    },
    { key: "type", header: T.COLUMN_TYPE, cell: (row: TenantApplicationResponse) => row.orgType },
    {
      key: "taxCode",
      header: T.COLUMN_TAX_CODE,
      cell: (row: TenantApplicationResponse) => (
        <span className="font-mono text-xs">{row.taxCode ?? T.EMPTY_VALUE}</span>
      ),
    },
    {
      key: "status",
      header: T.COLUMN_STATUS,
      cell: (row: TenantApplicationResponse) => <CommercialStatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={T.TITLE}
        actions={
          <Select
            id="application-status"
            aria-label={T.FILTER_ARIA_LABEL}
            options={STATUS_OPTIONS}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-w-36"
          />
        }
      />
      {isError && (
        <Alert tone="error">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{T.LOAD_ERROR}</span>
            <button type="button" className="font-semibold underline" onClick={() => void refetch()}>
              {T.RETRY}
            </button>
          </div>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={T.TOTAL}
          value={isLoading || isError ? T.EMPTY_VALUE : String(applications.length)}
          icon={<BuildingIcon />}
          accent="blue"
        />
        <StatCard
          label={T.NEEDS_REVIEW}
          value={isLoading || isError ? T.EMPTY_VALUE : String(pendingCount)}
          icon={<UsersIcon />}
          accent="cream"
          highlight
        />
        <StatCard
          label={T.APPROVED_COUNT}
          value={isLoading || isError ? T.EMPTY_VALUE : String(approvedCount)}
          icon={<BuildingIcon />}
          accent="mint"
        />
      </div>
      <DataTable
        columns={columns}
        rows={visibleApplications}
        getRowKey={(row) => row.publicId}
        rowActions={(row) => (
          <ActionMenu
            items={[
              {
                label: T.VIEW_DETAILS,
                icon: EyeIcon,
                onSelect: () => router.push(`/admin/applications/${row.publicId}`),
              },
            ]}
          />
        )}
        rowActionsHeader=""
        emptyTitle={isLoading ? T.LOADING : T.EMPTY}
        emptyDescription={isLoading ? "" : T.FILTER_EMPTY}
      />
    </div>
  );
};
