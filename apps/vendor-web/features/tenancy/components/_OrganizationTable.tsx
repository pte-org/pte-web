"use client";

import type { ReactElement } from "react";
import { ActionMenu, Badge, DataTable } from "@pte/ui";
import {
  FACILITY_TYPE_LABELS,
  ORGANIZATION_STATUS_LABELS,
  ORGANIZATION_STATUS_VARIANT,
  ORGANIZATION_TABLE_HEADERS,
  TENANCY_TEXT,
} from "../constants";
import type { Organization } from "../types";

interface OrganizationTableProps {
  organizations: Organization[];
  onSuspend: (organization: Organization) => void;
  onReactivate: (organization: Organization) => void;
}

const FACILITY_FILTER_OPTIONS = [
  { value: "", label: "All facility types" },
  ...Object.entries(FACILITY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
] as const;

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.entries(ORGANIZATION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
] as const;

export const OrganizationTable = ({
  organizations,
  onSuspend,
  onReactivate,
}: OrganizationTableProps): ReactElement => (
  <DataTable
    columns={[
      {
        key: "name",
        label: ORGANIZATION_TABLE_HEADERS.NAME,
        header: ORGANIZATION_TABLE_HEADERS.NAME,
        filterAccessor: (organization: Organization) => organization.name,
        cell: (organization: Organization) => (
          <span className="font-medium">{organization.name}</span>
        ),
      },
      {
        key: "facilityType",
        label: ORGANIZATION_TABLE_HEADERS.FACILITY_TYPE,
        header: ORGANIZATION_TABLE_HEADERS.FACILITY_TYPE,
        filterOptions: FACILITY_FILTER_OPTIONS,
        filterAccessor: (organization: Organization) => organization.facilityType,
        cell: (organization: Organization) => FACILITY_TYPE_LABELS[organization.facilityType],
      },
      {
        key: "address",
        label: ORGANIZATION_TABLE_HEADERS.ADDRESS,
        header: ORGANIZATION_TABLE_HEADERS.ADDRESS,
        filterAccessor: (organization: Organization) => organization.address,
        cell: (organization: Organization) => (
          <span className="text-[var(--ink-secondary)]">
            {organization.address ?? TENANCY_TEXT.EMPTY_VALUE}
          </span>
        ),
      },
      {
        key: "status",
        label: ORGANIZATION_TABLE_HEADERS.STATUS,
        header: ORGANIZATION_TABLE_HEADERS.STATUS,
        filterOptions: STATUS_FILTER_OPTIONS,
        filterAccessor: (organization: Organization) => organization.status,
        cell: (organization: Organization) => (
          <Badge variant={ORGANIZATION_STATUS_VARIANT[organization.status]}>
            {ORGANIZATION_STATUS_LABELS[organization.status]}
          </Badge>
        ),
      },
    ]}
    rows={organizations}
    getRowKey={(organization) => organization.id}
    emptyTitle="No organizations found"
    tableClassName="min-w-[680px]"
    rowActionsHeader={ORGANIZATION_TABLE_HEADERS.ACTIONS}
    rowActions={(organization) => (
      <ActionMenu
        items={[
          organization.status === "suspended"
            ? {
                label: TENANCY_TEXT.ACTION_REACTIVATE,
                onSelect: () => onReactivate(organization),
              }
            : {
                label: TENANCY_TEXT.ACTION_SUSPEND,
                danger: true,
                onSelect: () => onSuspend(organization),
              },
        ]}
      />
    )}
  />
);
