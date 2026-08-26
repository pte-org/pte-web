import type { ReactElement } from "react";
import type { SkippedRow } from "../types";

interface SkippedRowsReportProps {
  rows: SkippedRow[];
}

export const SkippedRowsReport = ({ rows }: SkippedRowsReportProps): ReactElement | null => {
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-gray-700">
        {rows.length} row(s) skipped
      </h4>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-4">Row</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rowIndex} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-mono text-gray-700">{row.rowIndex + 1}</td>
              <td className="py-2 pr-4 text-gray-700">{row.email}</td>
              <td className="py-2 text-amber-700">{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
