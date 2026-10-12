import type { ReactElement } from "react";
import { ActionMenu, Badge, DataTable } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { TENANT_PLAN_LABELS as RAW_TENANT_PLAN_LABELS } from "../../tenancy/constants";
import {
  LICENSE_STATUS_LABELS as RAW_LICENSE_STATUS_LABELS,
  LICENSE_STATUS_VARIANT,
  LICENSE_TABLE_HEADERS as RAW_LICENSE_TABLE_HEADERS,
  LICENSING_TEXT as RAW_LICENSING_TEXT,
} from "../constants";
import type { License } from "../types";

interface LicenseTableProps {
  licenses: License[];
  onGrant: (license: License) => void;
  onViewHistory: (license: License) => void;
}

export const LicenseTable = ({
  licenses,
  onGrant,
  onViewHistory,
}: LicenseTableProps): ReactElement => {
  const H = useAdminCopy(RAW_LICENSE_TABLE_HEADERS);
  const T = useAdminCopy(RAW_LICENSING_TEXT);
  const planLabels = useAdminCopy(RAW_TENANT_PLAN_LABELS);
  const statusLabels = useAdminCopy(RAW_LICENSE_STATUS_LABELS);
  const statusFilterOptions = useAdminCopy([
    { value: "", label: "All statuses" },
    ...Object.entries(RAW_LICENSE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ]);

  return (
    <DataTable
      columns={[
        {
          key: "tenant",
          label: H.TENANT,
          header: H.TENANT,
          filterAccessor: (license: License) => license.tenantName,
          cell: (license: License) => <span className="font-medium">{license.tenantName}</span>,
        },
        {
          key: "plan",
          label: H.PLAN,
          header: H.PLAN,
          filterAccessor: (license: License) => planLabels[license.plan],
          cell: (license: License) => planLabels[license.plan],
        },
        {
          key: "status",
          label: H.STATUS,
          header: H.STATUS,
          filterOptions: statusFilterOptions,
          filterAccessor: (license: License) => license.status,
          cell: (license: License) => (
            <Badge variant={LICENSE_STATUS_VARIANT[license.status]}>
              {statusLabels[license.status]}
            </Badge>
          ),
        },
        {
          key: "seats",
          label: H.SEATS,
          header: H.SEATS,
          filterAccessor: (license: License) => license.seatsTotal,
          cell: (license: License) => license.seatsTotal,
        },
      ]}
      rows={licenses}
      getRowKey={(license) => license.tenantId}
      emptyTitle={T.EMPTY_TITLE}
      tableClassName="min-w-[650px]"
      rowActionsHeader={H.ACTIONS}
      rowActions={(license) => (
        <ActionMenu
          items={[
            {
              label: T.ACTION_RENEW,
              onSelect: () => onGrant(license),
            },
            {
              label: T.ACTION_HISTORY,
              onSelect: () => onViewHistory(license),
            },
            {
              label: T.ACTION_EXPORT_PDF,
              onSelect: () => undefined,
            },
          ]}
        />
      )}
    />
  );
};
