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
  onGrantQuota: (tenant: Tenant) => void;
  onViewQuotaHistory: (tenant: Tenant) => void;
}

const organizationTypeLabel = (value: string): string =>
  ORGANIZATION_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;

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
      cell: (tenant) => organizationTypeLabel(tenant.organizationType),
      className: "whitespace-nowrap text-slate-500",
    },
    {
      key: "taxCode",
      header: TENANT_TABLE_HEADERS.TAX_CODE,
      cell: (tenant) => tenant.taxCode ?? TENANCY_TEXT.EMPTY_VALUE,
      className: "whitespace-nowrap font-mono text-xs text-slate-500",
    },
    {
      key: "plan",
      header: TENANT_TABLE_HEADERS.PLAN,
      cell: (tenant) => TENANT_PLAN_LABELS[tenant.plan],
      className: "whitespace-nowrap",
    },
    {
      key: "status",
      header: TENANT_TABLE_HEADERS.STATUS,
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
        );
      }}
    />
  );
};
