"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { ActionMenu, Badge, BanIcon, CheckCircleIcon, EyeIcon, LicenseIcon } from "@pte/ui";
import {
  ORGANIZATION_TYPE_OPTIONS,
  TENANCY_TEXT,
  TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
  TENANT_TABLE_HEADERS,
} from "../constants";
import type { Tenant } from "../types";

const ViewDetailsIcon = ({ className }: { className?: string }): ReactElement => (
  <EyeIcon className={className} />
);

interface TenantTableProps {
  tenants: Tenant[];
  onSuspend: (tenant: Tenant) => void;
  onReactivate: (tenant: Tenant) => void;
  onGrantQuota: (tenant: Tenant) => void;
  onViewQuotaHistory: (tenant: Tenant) => void;
}

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

const organizationTypeLabel = (value: string): string =>
  ORGANIZATION_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;

const TenantRow = ({
  tenant,
  onSuspend,
  onReactivate,
  onGrantQuota,
  onViewQuotaHistory,
}: {
  tenant: Tenant;
  onSuspend: (tenant: Tenant) => void;
  onReactivate: (tenant: Tenant) => void;
  onGrantQuota: (tenant: Tenant) => void;
  onViewQuotaHistory: (tenant: Tenant) => void;
}): ReactElement => {
  const isSuspended = tenant.status === "suspended";
  const router = useRouter();

  return (
    <tr className="border-t border-gray-100 hover:bg-slate-50/70">
      <td className={`${CELL_CLASS} font-mono text-xs text-gray-500`}>{tenant.code}</td>
      <td className={`${CELL_CLASS} font-medium text-gray-900`}>{tenant.name}</td>
      <td className={`${CELL_CLASS} text-gray-500`}>
        {organizationTypeLabel(tenant.organizationType)}
      </td>
      <td className={`${CELL_CLASS} font-mono text-xs text-gray-500`}>
        {tenant.taxCode ?? TENANCY_TEXT.EMPTY_VALUE}
      </td>
      <td className={CELL_CLASS}>{TENANT_PLAN_LABELS[tenant.plan]}</td>
      <td className={CELL_CLASS}>{tenant.seatsTotal}</td>
      <td className={CELL_CLASS}>
        <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
          {TENANT_STATUS_LABELS[tenant.status]}
        </Badge>
      </td>
      <td className={CELL_CLASS}>
        <ActionMenu
          items={[
            {
              label: TENANCY_TEXT.ACTION_VIEW_DETAILS,
              icon: ViewDetailsIcon,
              onSelect: () => router.push(`/admin/tenants/${tenant.id}`),
            },
            {
              label: TENANCY_TEXT.ACTION_GRANT_QUOTA,
              icon: LicenseIcon,
              onSelect: () => onGrantQuota(tenant),
            },
            {
              label: TENANCY_TEXT.ACTION_VIEW_QUOTA_HISTORY,
              icon: LicenseIcon,
              onSelect: () => onViewQuotaHistory(tenant),
            },
            isSuspended
              ? {
                  label: TENANCY_TEXT.ACTION_REACTIVATE,
                  icon: CheckCircleIcon,
                  onSelect: () => onReactivate(tenant),
                }
              : {
                  label: TENANCY_TEXT.ACTION_SUSPEND,
                  icon: BanIcon,
                  danger: true,
                  onSelect: () => onSuspend(tenant),
                },
          ]}
        />
      </td>
    </tr>
  );
};

export const TenantTable = ({
  tenants,
  onSuspend,
  onReactivate,
  onGrantQuota,
  onViewQuotaHistory,
}: TenantTableProps): ReactElement => (
  <div className="overflow-hidden rounded-lg bg-white shadow-card">
    <div className="overflow-x-auto">
      <table className="min-w-[1180px] w-full border-collapse">
        <thead className="bg-slate-50">
          <tr>
            <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.CODE}</th>
            <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.NAME}</th>
            <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.TYPE}</th>
            <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.TAX_CODE}</th>
            <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.PLAN}</th>
            <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.STUDENT_LIMIT}</th>
            <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.STATUS}</th>
            <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.ACTIONS}</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <TenantRow
              key={tenant.id}
              tenant={tenant}
              onSuspend={onSuspend}
              onReactivate={onReactivate}
              onGrantQuota={onGrantQuota}
              onViewQuotaHistory={onViewQuotaHistory}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
