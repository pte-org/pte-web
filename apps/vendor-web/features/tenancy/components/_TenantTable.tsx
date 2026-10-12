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
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  ORGANIZATION_TYPE_OPTIONS as RAW_ORGANIZATION_TYPE_OPTIONS,
  TENANCY_TEXT as RAW_TENANCY_TEXT,
  TENANT_PLAN_LABELS as RAW_TENANT_PLAN_LABELS,
  TENANT_STATUS_LABELS as RAW_TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
  TENANT_TABLE_HEADERS as RAW_TENANT_TABLE_HEADERS,
} from "../constants";
import type { Tenant } from "../types";

interface TenantTableProps {
  tenants: Tenant[];
  onSuspend: (tenant: Tenant) => void;
  onReactivate: (tenant: Tenant) => void;
  onGrantQuota?: (tenant: Tenant) => void;
  onViewQuotaHistory?: (tenant: Tenant) => void;
}

export const TenantTable = ({
  tenants,
  onSuspend,
  onReactivate,
  onGrantQuota,
  onViewQuotaHistory,
}: TenantTableProps): ReactElement => {
  const H = useAdminCopy(RAW_TENANT_TABLE_HEADERS);
  const T = useAdminCopy(RAW_TENANCY_TEXT);
  const organizationTypeOptions = useAdminCopy(RAW_ORGANIZATION_TYPE_OPTIONS);
  const planLabels = useAdminCopy(RAW_TENANT_PLAN_LABELS);
  const statusLabels = useAdminCopy(RAW_TENANT_STATUS_LABELS);
  const organizationTypeFilterOptions = useAdminCopy([
    { value: "", label: "All organization types" },
    ...RAW_ORGANIZATION_TYPE_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  ]);
  const planFilterOptions = useAdminCopy([
    { value: "", label: "All plans" },
    ...Object.entries(RAW_TENANT_PLAN_LABELS).map(([value, label]) => ({ value, label })),
  ]);
  const statusFilterOptions = useAdminCopy([
    { value: "", label: "All statuses" },
    ...Object.entries(RAW_TENANT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ]);
  const organizationTypeLabel = (value: string): string =>
    organizationTypeOptions.find((option) => option.value === value)?.label ?? value;
  const router = useRouter();

  const columns: DataTableColumn<Tenant>[] = [
    {
      key: "name",
      header: H.NAME,
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
      header: H.TYPE,
      filterOptions: organizationTypeFilterOptions,
      filterAccessor: (tenant) => tenant.organizationType,
      cell: (tenant) => organizationTypeLabel(tenant.organizationType),
      className: "whitespace-nowrap text-slate-500",
    },
    {
      key: "taxCode",
      header: H.TAX_CODE,
      filterAccessor: (tenant) => tenant.taxCode,
      cell: (tenant) => tenant.taxCode ?? T.EMPTY_VALUE,
      className: "whitespace-nowrap font-mono text-xs text-slate-500",
    },
    {
      key: "plan",
      header: H.PLAN,
      filterOptions: planFilterOptions,
      filterAccessor: (tenant) => tenant.plan,
      cell: (tenant) => planLabels[tenant.plan],
      className: "whitespace-nowrap",
    },
    {
      key: "status",
      header: H.STATUS,
      filterOptions: statusFilterOptions,
      filterAccessor: (tenant) => tenant.status,
      cell: (tenant) => (
        <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>{statusLabels[tenant.status]}</Badge>
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
      rowActionsHeader={H.ACTIONS}
      rowActions={(tenant) => {
        const isSuspended = tenant.status === "suspended";

        return (
          <ActionMenu
            items={[
              {
                label: T.ACTION_VIEW_DETAILS,
                icon: EyeIcon,
                onSelect: () => router.push(`/admin/tenants/${tenant.id}`),
              },
              ...(onGrantQuota
                ? [
                    {
                      label: T.ACTION_GRANT_QUOTA,
                      icon: LicenseIcon,
                      onSelect: () => onGrantQuota(tenant),
                    },
                  ]
                : []),
              ...(onViewQuotaHistory
                ? [
                    {
                      label: T.ACTION_VIEW_QUOTA_HISTORY,
                      icon: LicenseIcon,
                      onSelect: () => onViewQuotaHistory(tenant),
                    },
                  ]
                : []),
              isSuspended
                ? {
                    label: T.ACTION_REACTIVATE,
                    icon: CheckCircleIcon,
                    onSelect: () => onReactivate(tenant),
                  }
                : {
                    label: T.ACTION_SUSPEND,
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
