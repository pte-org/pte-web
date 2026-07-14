"use client";

import type { ReactElement } from "react";
import { Badge, Dropdown, ProgressBar } from "@aptis/ui";
import {
  TENANCY_TEXT,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_VARIANT,
  TENANT_TABLE_HEADERS,
  seatTone,
} from "../constants";
import type { Tenant } from "../types";

interface TenantTableProps {
  tenants: Tenant[];
  onSuspend: (tenant: Tenant) => void;
}

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

const TenantRow = ({
  tenant,
  onSuspend,
}: {
  tenant: Tenant;
  onSuspend: (tenant: Tenant) => void;
}): ReactElement => {
  return (
    <tr className="border-t border-gray-100 hover:bg-slate-50/70">
      <td className={`${CELL_CLASS} font-medium text-gray-900`}>
        {tenant.name}
      </td>
      <td className={`${CELL_CLASS} text-gray-500`}>{tenant.slug}</td>
      <td className={CELL_CLASS}>
        <Badge variant={TENANT_STATUS_VARIANT[tenant.status]}>
          {TENANT_STATUS_LABELS[tenant.status]}
        </Badge>
      </td>
      <td className={CELL_CLASS}>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">
            {tenant.seatsUsed} / {tenant.seatsTotal}
          </span>
          <ProgressBar
            value={tenant.seatsUsed}
            max={tenant.seatsTotal}
            tone={seatTone(tenant.seatsUsed, tenant.seatsTotal)}
            label={`${TENANCY_TEXT.SEATS_ARIA} — ${tenant.name}`}
            className="w-32"
          />
        </div>
      </td>
      <td className={CELL_CLASS}>{tenant.expiresAt}</td>
      <td className={`${CELL_CLASS} text-gray-500`}>{tenant.lastActiveLabel}</td>
      <td className={CELL_CLASS}>
        <Dropdown
          items={[
            {
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
}: TenantTableProps): ReactElement => (
  <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-md shadow-slate-200/70">
    <table className="w-full border-collapse">
      <thead className="bg-slate-50">
        <tr>
          <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.NAME}</th>
          <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.SLUG}</th>
          <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.STATUS}</th>
          <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.SEATS}</th>
          <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.EXPIRES}</th>
          <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.LAST_ACTIVE}</th>
          <th className={HEADER_CLASS}>{TENANT_TABLE_HEADERS.ACTIONS}</th>
        </tr>
      </thead>
      <tbody>
        {tenants.map((tenant) => (
          <TenantRow key={tenant.id} tenant={tenant} onSuspend={onSuspend} />
        ))}
      </tbody>
    </table>
  </div>
);
