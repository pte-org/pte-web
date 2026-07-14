import type { ReactElement } from "react";
import { ROSTER_TEXT } from "./constants";
import type { RosterValidationRow } from "../types";

interface ValidationReportProps {
  rows: RosterValidationRow[];
}

export const ValidationReport = ({
  rows,
}: ValidationReportProps): ReactElement => {
  if (rows.length === 0) {
    return <p className="text-sm text-green-700">{ROSTER_TEXT.REPORT_EMPTY}</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-gray-500">
          <th className="py-2 pr-4">{ROSTER_TEXT.COL_ROW}</th>
          <th className="py-2">{ROSTER_TEXT.COL_REASON}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.row} className="border-b border-gray-100">
            <td className="py-2 pr-4 font-mono text-gray-700">{row.row}</td>
            <td className="py-2 text-red-600">{row.reason}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
