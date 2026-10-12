"use client";

import type { ReactElement } from "react";
import { ActionMenu, Badge, DataTable } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  FACILITY_TYPE_LABELS as RAW_FACILITY_TYPE_LABELS,
  ORGANIZATION_STATUS_LABELS as RAW_ORGANIZATION_STATUS_LABELS,
  ORGANIZATION_STATUS_VARIANT,
  ORGANIZATION_TABLE_HEADERS as RAW_ORGANIZATION_TABLE_HEADERS,
  TENANCY_TEXT as RAW_TENANCY_TEXT,
} from "../constants";
import type { Organization } from "../types";

interface OrganizationTableProps {
  organizations: Organization[];
  onSuspend: (organization: Organization) => void;
  onReactivate: (organization: Organization) => void;
}

export const OrganizationTable = ({
  organizations,
  onSuspend,
  onReactivate,
}: OrganizationTableProps): ReactElement => {
  const H = useAdminCopy(RAW_ORGANIZATION_TABLE_HEADERS);
  const T = useAdminCopy(RAW_TENANCY_TEXT);
  const emptyTitle = useAdminCopy("No organizations found");
  const facilityLabels = useAdminCopy(RAW_FACILITY_TYPE_LABELS);
  const statusLabels = useAdminCopy(RAW_ORGANIZATION_STATUS_LABELS);
  const facilityFilterOptions = useAdminCopy([
    { value: "", label: "All facility types" },
    ...Object.entries(RAW_FACILITY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ]);
  const statusFilterOptions = useAdminCopy([
    { value: "", label: "All statuses" },
    ...Object.entries(RAW_ORGANIZATION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ]);

  return (
    <DataTable
      columns={[
        {
          key: "name",
          label: H.NAME,
          header: H.NAME,
          filterAccessor: (organization: Organization) => organization.name,
          cell: (organization: Organization) => (
            <span className="font-medium">{organization.name}</span>
          ),
        },
        {
          key: "facilityType",
          label: H.FACILITY_TYPE,
          header: H.FACILITY_TYPE,
          filterOptions: facilityFilterOptions,
          filterAccessor: (organization: Organization) => organization.facilityType,
          cell: (organization: Organization) => facilityLabels[organization.facilityType],
        },
        {
          key: "address",
          label: H.ADDRESS,
          header: H.ADDRESS,
          filterAccessor: (organization: Organization) => organization.address,
          cell: (organization: Organization) => (
            <span className="text-[var(--ink-secondary)]">
              {organization.address ?? T.EMPTY_VALUE}
            </span>
          ),
        },
        {
          key: "status",
          label: H.STATUS,
          header: H.STATUS,
          filterOptions: statusFilterOptions,
          filterAccessor: (organization: Organization) => organization.status,
          cell: (organization: Organization) => (
            <Badge variant={ORGANIZATION_STATUS_VARIANT[organization.status]}>
              {statusLabels[organization.status]}
            </Badge>
          ),
        },
      ]}
      rows={organizations}
      getRowKey={(organization) => organization.id}
      emptyTitle={emptyTitle}
      tableClassName="min-w-[680px]"
      rowActionsHeader={H.ACTIONS}
      rowActions={(organization) => (
        <ActionMenu
          items={[
            organization.status === "suspended"
              ? {
                  label: T.ACTION_REACTIVATE,
                  onSelect: () => onReactivate(organization),
                }
              : {
                  label: T.ACTION_SUSPEND,
                  danger: true,
                  onSelect: () => onSuspend(organization),
                },
          ]}
        />
      )}
    />
  );
};
