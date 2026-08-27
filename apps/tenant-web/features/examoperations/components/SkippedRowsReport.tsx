import type { ReactElement } from "react";
import type { SkippedRow } from "../types";
import { SKIPPED_ROWS_REPORT_TEXT } from "./constants";

interface SkippedRowsReportProps {
  rows: SkippedRow[];
}

export const SkippedRowsReport = ({ rows }: SkippedRowsReportProps): ReactElement | null => {
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-gray-700">
        {SKIPPED_ROWS_REPORT_TEXT.HEADING.replace("{count}", String(rows.length))}
      </h4>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-4">{SKIPPED_ROWS_REPORT_TEXT.ROW_HEADER}</th>
            <th className="py-2 pr-4">{SKIPPED_ROWS_REPORT_TEXT.EMAIL_HEADER}</th>
            <th className="py-2">{SKIPPED_ROWS_REPORT_TEXT.REASON_HEADER}</th>
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
