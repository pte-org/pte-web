"use client";

import { type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ActionMenu,
  Alert,
  DataTable,
  EyeIcon,
  PageHeader,
} from "@pte/ui";
import { useApplicationsQuery } from "../api";
import type { TenantApplicationResponse } from "@pte/api-client";
import { ADMIN_APPLICATIONS_TEXT as T } from "../constants";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

const STATUS_OPTIONS = [
  { label: T.ALL_STATUSES, value: "" },
  { label: T.PENDING, value: "PENDING" },
  { label: T.APPROVED, value: "APPROVED" },
  { label: T.REJECTED, value: "REJECTED" },
];

export const AdminApplicationsView = (): ReactElement => {
  const router = useRouter();
  const { data: applications = [], isLoading, isError, refetch } = useApplicationsQuery();
  const columns = [
    {
      key: "organization",
      header: T.COLUMN_ORGANIZATION,
      filterAccessor: (row: TenantApplicationResponse) => `${row.orgName} ${row.requestedCode}`,
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
      filterAccessor: (row: TenantApplicationResponse) => `${row.contactEmail} ${row.contactPhone ?? ""}`,
      cell: (row: TenantApplicationResponse) => (
        <div>
          <p>{row.contactEmail}</p>
          {row.contactPhone && <p className="mt-1 text-xs text-slate-500">{row.contactPhone}</p>}
        </div>
      ),
    },
    {
      key: "type",
      header: T.COLUMN_TYPE,
      filterAccessor: (row: TenantApplicationResponse) => row.orgType,
      cell: (row: TenantApplicationResponse) => row.orgType,
    },
    {
      key: "taxCode",
      header: T.COLUMN_TAX_CODE,
      filterAccessor: (row: TenantApplicationResponse) => row.taxCode,
      cell: (row: TenantApplicationResponse) => (
        <span className="font-mono text-xs">{row.taxCode ?? T.EMPTY_VALUE}</span>
      ),
    },
    {
      key: "status",
      header: T.COLUMN_STATUS,
      filterOptions: STATUS_OPTIONS,
      filterAccessor: (row: TenantApplicationResponse) => row.status,
      cell: (row: TenantApplicationResponse) => <CommercialStatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={T.TITLE}
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
      <DataTable
        columns={columns}
        rows={applications}
        getRowKey={(row) => row.publicId}
        isLoading={isLoading}
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
