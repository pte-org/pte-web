import type { ReactElement } from "react";
import { ActionMenu, Badge, DataTable } from "@pte/ui";
import { TENANT_PLAN_LABELS } from "../../tenancy/constants";
import {
  LICENSE_STATUS_LABELS,
  LICENSE_STATUS_VARIANT,
  LICENSE_TABLE_HEADERS,
  LICENSING_TEXT,
} from "../constants";
import type { License } from "../types";

interface LicenseTableProps {
  licenses: License[];
  onGrant: (license: License) => void;
  onViewHistory: (license: License) => void;
}

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.entries(LICENSE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
] as const;

export const LicenseTable = ({
  licenses,
  onGrant,
  onViewHistory,
}: LicenseTableProps): ReactElement => (
  <DataTable
    columns={[
      {
        key: "tenant",
        label: LICENSE_TABLE_HEADERS.TENANT,
        header: LICENSE_TABLE_HEADERS.TENANT,
        filterAccessor: (license: License) => license.tenantName,
        cell: (license: License) => <span className="font-medium">{license.tenantName}</span>,
      },
      {
        key: "plan",
        label: LICENSE_TABLE_HEADERS.PLAN,
        header: LICENSE_TABLE_HEADERS.PLAN,
        filterAccessor: (license: License) => TENANT_PLAN_LABELS[license.plan],
        cell: (license: License) => TENANT_PLAN_LABELS[license.plan],
      },
      {
        key: "status",
        label: LICENSE_TABLE_HEADERS.STATUS,
        header: LICENSE_TABLE_HEADERS.STATUS,
        filterOptions: STATUS_FILTER_OPTIONS,
        filterAccessor: (license: License) => license.status,
        cell: (license: License) => (
          <Badge variant={LICENSE_STATUS_VARIANT[license.status]}>
            {LICENSE_STATUS_LABELS[license.status]}
          </Badge>
        ),
      },
      {
        key: "seats",
        label: LICENSE_TABLE_HEADERS.SEATS,
        header: LICENSE_TABLE_HEADERS.SEATS,
        filterAccessor: (license: License) => license.seatsTotal,
        cell: (license: License) => license.seatsTotal,
      },
    ]}
    rows={licenses}
    getRowKey={(license) => license.tenantId}
    emptyTitle="No licenses found"
    tableClassName="min-w-[650px]"
    rowActionsHeader={LICENSE_TABLE_HEADERS.ACTIONS}
    rowActions={(license) => (
      <ActionMenu
        items={[
          {
            label: LICENSING_TEXT.ACTION_RENEW,
            onSelect: () => onGrant(license),
          },
          {
            label: LICENSING_TEXT.ACTION_HISTORY,
            onSelect: () => onViewHistory(license),
          },
          {
            label: LICENSING_TEXT.ACTION_EXPORT_PDF,
            onSelect: () => undefined,
          },
        ]}
      />
    )}
  />
);
