"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  ActionMenu,
  Badge,
  BanIcon,
  CheckCircleIcon,
  DataTable,
  EyeIcon,
  LicenseIcon,
  type DataTableColumn,
} from "@pte/ui";
import {
  ORGANIZATION_TYPE_OPTIONS,
  TENANCY_TEXT,
  TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
  TENANT_TABLE_HEADERS,
} from "../constants";
import type { Tenant } from "../types";

interface TenantTableProps {
  tenants: Tenant[];
  onSuspend: (tenant: Tenant) => void;
  onReactivate: (tenant: Tenant) => void;
  onGrantQuota?: (tenant: Tenant) => void;
  onViewQuotaHistory?: (tenant: Tenant) => void;
}

const organizationTypeLabel = (value: string): string =>
  ORGANIZATION_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;

const ORGANIZATION_TYPE_FILTER_OPTIONS = [
  { value: "", label: "All organization types" },
  ...ORGANIZATION_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
] as const;

const PLAN_FILTER_OPTIONS = [
  { value: "", label: "All plans" },
  ...Object.entries(TENANT_PLAN_LABELS).map(([value, label]) => ({ value, label })),
] as const;

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  ...Object.entries(TENANT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
] as const;

export const TenantTable = ({
  tenants,
  onSuspend,
  onReactivate,
  onGrantQuota,
  onViewQuotaHistory,
}: TenantTableProps): ReactElement => {
  const router = useRouter();

  const columns: DataTableColumn<Tenant>[] = [
    {
      key: "name",
      header: TENANT_TABLE_HEADERS.NAME,
      filterAccessor: (tenant) => `${tenant.name} ${tenant.code}`,
      cell: (tenant) => (
        <div className="min-w-48">
          <div className="font-medium text-slate-900">{tenant.name}</div>
          <div className="font-mono text-xs text-slate-500">{tenant.code}</div>
        </div>
      ),
    },
    {
      key: "organizationType",
      header: TENANT_TABLE_HEADERS.TYPE,
      filterOptions: ORGANIZATION_TYPE_FILTER_OPTIONS,
      filterAccessor: (tenant) => tenant.organizationType,
      cell: (tenant) => organizationTypeLabel(tenant.organizationType),
      className: "whitespace-nowrap text-slate-500",
    },
    {
      key: "taxCode",
      header: TENANT_TABLE_HEADERS.TAX_CODE,
      filterAccessor: (tenant) => tenant.taxCode,
      cell: (tenant) => tenant.taxCode ?? TENANCY_TEXT.EMPTY_VALUE,
      className: "whitespace-nowrap font-mono text-xs text-slate-500",
    },
    {
      key: "plan",
      header: TENANT_TABLE_HEADERS.PLAN,
      filterOptions: PLAN_FILTER_OPTIONS,
      filterAccessor: (tenant) => tenant.plan,
      cell: (tenant) => TENANT_PLAN_LABELS[tenant.plan],
      className: "whitespace-nowrap",
    },
    {
      key: "status",
      header: TENANT_TABLE_HEADERS.STATUS,
      filterOptions: STATUS_FILTER_OPTIONS,
      filterAccessor: (tenant) => tenant.status,
      cell: (tenant) => (
        <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
          {TENANT_STATUS_LABELS[tenant.status]}
        </Badge>
      ),
      className: "whitespace-nowrap",
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={tenants}
      getRowKey={(tenant) => tenant.id}
      tableClassName="min-w-[860px]"
      rowActionsHeader={TENANT_TABLE_HEADERS.ACTIONS}
      rowActions={(tenant) => {
        const isSuspended = tenant.status === "suspended";

        return (
          <ActionMenu
            items={[
              {
                label: TENANCY_TEXT.ACTION_VIEW_DETAILS,
                icon: EyeIcon,
                onSelect: () => router.push(`/admin/tenants/${tenant.id}`),
              },
              ...(onGrantQuota
                ? [{
                    label: TENANCY_TEXT.ACTION_GRANT_QUOTA,
                    icon: LicenseIcon,
                    onSelect: () => onGrantQuota(tenant),
                  }]
                : []),
              ...(onViewQuotaHistory
                ? [{
                    label: TENANCY_TEXT.ACTION_VIEW_QUOTA_HISTORY,
                    icon: LicenseIcon,
                    onSelect: () => onViewQuotaHistory(tenant),
                  }]
                : []),
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
        );
      }}
    />
  );
};
