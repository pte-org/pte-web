"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Badge, Dropdown } from "@pte/ui";
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
}

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

const organizationTypeLabel = (value: string): string =>
  ORGANIZATION_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
  value;

const TenantRow = ({
  tenant,
  onSuspend,
  onReactivate,
}: {
  tenant: Tenant;
  onSuspend: (tenant: Tenant) => void;
  onReactivate: (tenant: Tenant) => void;
}): ReactElement => {
  const isSuspended = tenant.status === "suspended";

  return (
    <tr className="border-t border-gray-100 hover:bg-slate-50/70">
      <td className={`${CELL_CLASS} font-medium text-gray-900`}>
        <Link href={`/admin/tenants/${tenant.id}`} className="hover:underline">
          {tenant.name}
        </Link>
      </td>
      <td className={`${CELL_CLASS} text-gray-500`}>
        {organizationTypeLabel(tenant.organizationType)}
      </td>
      <td className={CELL_CLASS}>{TENANT_PLAN_LABELS[tenant.plan]}</td>
      <td className={CELL_CLASS}>{tenant.seatsTotal}</td>
      <td className={CELL_CLASS}>
        <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
          {TENANT_STATUS_LABELS[tenant.status]}
        </Badge>
      </td>
      <td className={CELL_CLASS}>
        <Dropdown
          items={[
            isSuspended
              ? {
                  label: TENANCY_TEXT.ACTION_REACTIVATE,
                  onSelect: () => onReactivate(tenant),
                }
              : {
                  label: TENANCY_TEXT.ACTION_SUSPEND,
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
}: TenantTableProps): ReactElement => (
  <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-md shadow-slate-200/70">
    <table className="w-full border-collapse">
      <thead className="bg-slate-50">
        <tr>
          <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.NAME}</th>
          <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.TYPE}</th>
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
          />
        ))}
      </tbody>
    </table>
  </div>
);
