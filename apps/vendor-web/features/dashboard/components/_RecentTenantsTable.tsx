import type { ReactElement } from "react";
import { Avatar, Badge, Dropdown } from "@aptis/ui";
import {
  TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
} from "../../tenancy/constants";
import {
  DASHBOARD_TEXT,
  RECENT_TABLE_HEADERS,
  recentCountLabel,
} from "../constants";
import type { Tenant } from "../../tenancy/types";

interface RecentTenantsTableProps {
  tenants: Tenant[];
  total: number;
  onViewTenant: (tenant: Tenant) => void;
}

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700";

export const RecentTenantsTable = ({
  tenants,
  total,
  onViewTenant,
}: RecentTenantsTableProps): ReactElement => (
  <div className="overflow-visible rounded-lg border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
      <h2 className="text-base font-semibold text-gray-900">
        {DASHBOARD_TEXT.RECENT_TITLE}
      </h2>
      <button
        type="button"
        className="text-sm font-medium text-blue-700 hover:underline transition-colors"
      >
        {DASHBOARD_TEXT.VIEW_ALL}
      </button>
    </div>
    <table className="w-full border-collapse">
      <thead className="bg-slate-50">
        <tr>
          <th className={HEADER_CLASS}>{RECENT_TABLE_HEADERS.NAME}</th>
          <th className={HEADER_CLASS}>{RECENT_TABLE_HEADERS.PLAN}</th>
          <th className={HEADER_CLASS}>{RECENT_TABLE_HEADERS.ACTIVATED}</th>
          <th className={HEADER_CLASS}>{RECENT_TABLE_HEADERS.STATUS}</th>
          <th className={HEADER_CLASS} aria-label={RECENT_TABLE_HEADERS.ACTIONS} />
        </tr>
      </thead>
      <tbody>
        {tenants.map((tenant) => (
          <tr key={tenant.id} className="border-t border-gray-100 hover:bg-slate-50/70 transition-colors">
            <td className={`${CELL_CLASS} font-medium text-gray-900`}>
              <div className="flex items-center gap-3">
                <Avatar name={tenant.name} />
                {tenant.name}
              </div>
            </td>
            <td className={CELL_CLASS}>{TENANT_PLAN_LABELS[tenant.plan]}</td>
            <td className={CELL_CLASS}>{tenant.activatedAt}</td>
            <td className={CELL_CLASS}>
              <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
                {TENANT_STATUS_LABELS[tenant.status]}
              </Badge>
            </td>
            <td className={CELL_CLASS}>
              <Dropdown
                items={[
                  {
                    label: DASHBOARD_TEXT.ROW_DETAIL,
                    onSelect: () => onViewTenant(tenant),
                  },
                ]}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
      {recentCountLabel(tenants.length, total)}
    </div>
  </div>
);
