import type { ReactElement } from "react";
import Link from "next/link";
import { ActionMenu, Avatar, Badge, DataTable } from "@pte/ui";
import {
  TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
} from "../../tenancy/constants";
import {
  DASHBOARD_TEXT as RAW_DASHBOARD_TEXT,
  RECENT_TABLE_HEADERS as RAW_RECENT_TABLE_HEADERS,
  recentCountLabel,
} from "../constants";
import type { Tenant } from "../../tenancy/types";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface RecentTenantsTableProps {
  tenants: Tenant[];
  total: number;
  onViewTenant: (tenant: Tenant) => void;
}

export const RecentTenantsTable = ({
  tenants,
  total,
  onViewTenant,
}: RecentTenantsTableProps): ReactElement => {
  const T = useAdminCopy(RAW_DASHBOARD_TEXT);
  const H = useAdminCopy(RAW_RECENT_TABLE_HEADERS);
  const dateRangeLabel = useAdminCopy("Date range");
  const countLabel = useAdminCopy(recentCountLabel(tenants.length, total));
  const statusFilterOptions = useAdminCopy([
    { value: "", label: "All statuses" },
    ...Object.entries(TENANT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ]);
  const planLabels = useAdminCopy(TENANT_PLAN_LABELS);
  const statusLabels = useAdminCopy(TENANT_STATUS_LABELS);

  return (
    <div className="overflow-visible rounded-lg bg-white shadow-card transition-[box-shadow] duration-150 hover:shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">{T.RECENT_TITLE}</h2>
        <Link
          href="/admin/tenants"
          className="text-sm font-medium text-blue-700 hover:underline transition-colors"
        >
          {T.VIEW_ALL}
        </Link>
      </div>
      <DataTable
        columns={[
          {
            key: "name",
            label: H.NAME,
            header: H.NAME,
            filterAccessor: (tenant: Tenant) => tenant.name,
            cell: (tenant: Tenant) => (
              <div className="flex items-center gap-3 font-medium">
                <Avatar name={tenant.name} />
                {tenant.name}
              </div>
            ),
          },
          {
            key: "plan",
            label: H.PLAN,
            header: H.PLAN,
            filterAccessor: (tenant: Tenant) => planLabels[tenant.plan],
            cell: (tenant: Tenant) => planLabels[tenant.plan],
          },
          {
            key: "activatedAt",
            label: H.ACTIVATED,
            header: H.ACTIVATED,
            filterType: "date-range",
            filterAccessor: (tenant: Tenant) => tenant.activatedAt,
            filterPlaceholder: dateRangeLabel,
            cell: (tenant: Tenant) => tenant.activatedAt,
          },
          {
            key: "status",
            label: H.STATUS,
            header: H.STATUS,
            filterOptions: statusFilterOptions,
            filterAccessor: (tenant: Tenant) => tenant.status,
            cell: (tenant: Tenant) => (
              <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
                {statusLabels[tenant.status]}
              </Badge>
            ),
          },
        ]}
        rows={tenants}
        getRowKey={(tenant) => tenant.id}
        tableClassName="min-w-[680px]"
        rowActionsHeader={H.ACTIONS}
        rowActions={(tenant) => (
          <ActionMenu items={[{ label: T.ROW_DETAIL, onSelect: () => onViewTenant(tenant) }]} />
        )}
      />
      <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">{countLabel}</div>
    </div>
  );
};
