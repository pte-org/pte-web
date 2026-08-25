import type { ReactElement } from "react";
import { Badge, Dropdown } from "@aptis/ui";
import { TENANT_PLAN_LABELS } from "../../tenancy/constants";
import {
  LICENSE_STATUS_LABELS,
  LICENSE_STATUS_VARIANT,
  LICENSE_TABLE_HEADERS,
  LICENSING_TEXT,
} from "../constants";
import type { License } from "../types";

interface LicenseTableProps {
  licenses: License[];
  onGrant: (license: License) => void;
  onViewHistory: (license: License) => void;
}

const HEADER_CLASS =
  "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const CELL_CLASS = "px-5 py-4 text-sm text-gray-700 align-middle";

export const LicenseTable = ({
  licenses,
  onGrant,
  onViewHistory,
}: LicenseTableProps): ReactElement => (
  <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-md shadow-slate-200/70">
    <table className="w-full border-collapse">
      <thead className="bg-slate-50">
        <tr>
          <th className={HEADER_CLASS}>{LICENSE_TABLE_HEADERS.TENANT}</th>
          <th className={HEADER_CLASS}>{LICENSE_TABLE_HEADERS.PLAN}</th>
          <th className={HEADER_CLASS}>{LICENSE_TABLE_HEADERS.STATUS}</th>
          <th className={HEADER_CLASS}>{LICENSE_TABLE_HEADERS.SEATS}</th>
          <th className={HEADER_CLASS}>{LICENSE_TABLE_HEADERS.ACTIONS}</th>
        </tr>
      </thead>
      <tbody>
        {licenses.map((license) => (
          <tr key={license.tenantId} className="border-t border-gray-100 hover:bg-slate-50/70">
            <td className={`${CELL_CLASS} font-medium text-gray-900`}>
              {license.tenantName}
            </td>
            <td className={CELL_CLASS}>{TENANT_PLAN_LABELS[license.plan]}</td>
            <td className={CELL_CLASS}>
              <Badge variant={LICENSE_STATUS_VARIANT[license.status]}>
                {LICENSE_STATUS_LABELS[license.status]}
              </Badge>
            </td>
            <td className={`${CELL_CLASS} text-gray-500`}>{license.seatsTotal}</td>
            <td className={CELL_CLASS}>
              <Dropdown
                items={[
                  {
                    label: LICENSING_TEXT.ACTION_RENEW,
                    onSelect: () => onGrant(license),
                  },
                  {
                    label: LICENSING_TEXT.ACTION_HISTORY,
                    onSelect: () => onViewHistory(license),
                  },
                  {
                    label: LICENSING_TEXT.ACTION_EXPORT_PDF,
                    onSelect: () => undefined,
                  },
                ]}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
