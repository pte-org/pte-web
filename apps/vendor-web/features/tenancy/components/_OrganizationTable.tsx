"use client";

import type { ReactElement } from "react";
import { Badge, Dropdown } from "@aptis/ui";
import {
  FACILITY_TYPE_LABELS,
  ORGANIZATION_STATUS_LABELS,
  ORGANIZATION_STATUS_VARIANT,
  ORGANIZATION_TABLE_HEADERS,
  TENANCY_TEXT,
} from "../constants";
import type { Organization } from "../types";

interface OrganizationTableProps {
  organizations: Organization[];
  onSuspend: (organization: Organization) => void;
  onReactivate: (organization: Organization) => void;
}

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

export const OrganizationTable = ({
  organizations,
  onSuspend,
  onReactivate,
}: OrganizationTableProps): ReactElement => (
  <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-md shadow-slate-200/70">
    <table className="w-full border-collapse">
      <thead className="bg-slate-50">
        <tr>
          <th className={HEADER_CLASS}>{ORGANIZATION_TABLE_HEADERS.NAME}</th>
          <th className={HEADER_CLASS}>{ORGANIZATION_TABLE_HEADERS.FACILITY_TYPE}</th>
          <th className={HEADER_CLASS}>{ORGANIZATION_TABLE_HEADERS.ADDRESS}</th>
          <th className={HEADER_CLASS}>{ORGANIZATION_TABLE_HEADERS.STATUS}</th>
          <th className={HEADER_CLASS}>{ORGANIZATION_TABLE_HEADERS.ACTIONS}</th>
        </tr>
      </thead>
      <tbody>
        {organizations.map((organization) => {
          const isSuspended = organization.status === "suspended";
          return (
            <tr key={organization.id} className="border-t border-gray-100 hover:bg-slate-50/70">
              <td className={`${CELL_CLASS} font-medium text-gray-900`}>{organization.name}</td>
              <td className={CELL_CLASS}>{FACILITY_TYPE_LABELS[organization.facilityType]}</td>
              <td className={`${CELL_CLASS} text-gray-500`}>{organization.address ?? "-"}</td>
              <td className={CELL_CLASS}>
                <Badge variant={ORGANIZATION_STATUS_VARIANT[organization.status]}>
                  {ORGANIZATION_STATUS_LABELS[organization.status]}
                </Badge>
              </td>
              <td className={CELL_CLASS}>
                <Dropdown
                  items={[
                    isSuspended
                      ? {
                          label: TENANCY_TEXT.ACTION_REACTIVATE,
                          onSelect: () => onReactivate(organization),
                        }
                      : {
                          label: TENANCY_TEXT.ACTION_SUSPEND,
                          danger: true,
                          onSelect: () => onSuspend(organization),
                        },
                  ]}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
