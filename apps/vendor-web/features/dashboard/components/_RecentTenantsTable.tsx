import type { ReactElement } from "react";
import Link from "next/link";
import { ActionMenu, Avatar, Badge, DataTable } from "@pte/ui";
import {
  TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
} from "../../tenancy/constants";
import { DASHBOARD_TEXT, RECENT_TABLE_HEADERS, recentCountLabel } from "../constants";
import type { Tenant } from "../../tenancy/types";

interface RecentTenantsTableProps {
  tenants: Tenant[];
  total: number;
  onViewTenant: (tenant: Tenant) => void;
}

export const RecentTenantsTable = ({
  tenants,
  total,
  onViewTenant,
}: RecentTenantsTableProps): ReactElement => (
  <div className="overflow-visible rounded-lg bg-white shadow-card transition-[box-shadow] duration-150 hover:shadow-lg">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <h2 className="text-base font-semibold text-gray-900">{DASHBOARD_TEXT.RECENT_TITLE}</h2>
      <Link
        href="/admin/tenants"
        className="text-sm font-medium text-blue-700 hover:underline transition-colors"
      >
        {DASHBOARD_TEXT.VIEW_ALL}
      </Link>
    </div>
    <DataTable
      columns={[
        {
          key: "name",
          label: RECENT_TABLE_HEADERS.NAME,
          header: RECENT_TABLE_HEADERS.NAME,
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
          label: RECENT_TABLE_HEADERS.PLAN,
          header: RECENT_TABLE_HEADERS.PLAN,
          filterAccessor: (tenant: Tenant) => TENANT_PLAN_LABELS[tenant.plan],
          cell: (tenant: Tenant) => TENANT_PLAN_LABELS[tenant.plan],
        },
        {
          key: "activatedAt",
          label: RECENT_TABLE_HEADERS.ACTIVATED,
          header: RECENT_TABLE_HEADERS.ACTIVATED,
          filterType: "date-range",
          filterAccessor: (tenant: Tenant) => tenant.activatedAt,
          filterPlaceholder: "Date range",
          cell: (tenant: Tenant) => tenant.activatedAt,
        },
        {
          key: "status",
          label: RECENT_TABLE_HEADERS.STATUS,
          header: RECENT_TABLE_HEADERS.STATUS,
          filterOptions: [
            { value: "", label: "All statuses" },
            ...Object.entries(TENANT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
          ],
          filterAccessor: (tenant: Tenant) => tenant.status,
          cell: (tenant: Tenant) => (
            <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
              {TENANT_STATUS_LABELS[tenant.status]}
            </Badge>
          ),
        },
      ]}
      rows={tenants}
      getRowKey={(tenant) => tenant.id}
      tableClassName="min-w-[680px]"
      rowActionsHeader={RECENT_TABLE_HEADERS.ACTIONS}
      rowActions={(tenant) => (
        <ActionMenu
          items={[{ label: DASHBOARD_TEXT.ROW_DETAIL, onSelect: () => onViewTenant(tenant) }]}
        />
      )}
    />
    <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
      {recentCountLabel(tenants.length, total)}
    </div>
  </div>
);
