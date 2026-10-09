import type { ReactElement } from "react";
import { DataTable } from "@pte/ui";
import type { SkippedRow } from "../types";
import {
  SKIPPED_ROW_REASON_MESSAGES,
  SKIPPED_ROW_UNKNOWN_REASON,
  SKIPPED_ROWS_REPORT_TEXT,
  ROSTER_TEXT,
} from "./constants";

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
      <DataTable
        columns={[
          {
            key: "row",
            label: SKIPPED_ROWS_REPORT_TEXT.ROW_HEADER,
            header: SKIPPED_ROWS_REPORT_TEXT.ROW_HEADER,
            filterAccessor: (row: SkippedRow) => row.rowIndex + 1,
            cell: (row: SkippedRow) => <span className="font-mono">{row.rowIndex + 1}</span>,
          },
          {
            key: "email",
            label: SKIPPED_ROWS_REPORT_TEXT.EMAIL_HEADER,
            header: SKIPPED_ROWS_REPORT_TEXT.EMAIL_HEADER,
            filterAccessor: (row: SkippedRow) => row.email,
            cell: (row: SkippedRow) => row.email ?? ROSTER_TEXT.EMPTY_VALUE,
          },
          {
            key: "reason",
            label: SKIPPED_ROWS_REPORT_TEXT.REASON_HEADER,
            header: SKIPPED_ROWS_REPORT_TEXT.REASON_HEADER,
            filterAccessor: (row: SkippedRow) => row.reason,
            cell: (row: SkippedRow) => (
              <span className="text-amber-700">
                {SKIPPED_ROW_REASON_MESSAGES[row.reason] ?? SKIPPED_ROW_UNKNOWN_REASON}
              </span>
            ),
          },
        ]}
        rows={rows}
        getRowKey={(row) => row.rowIndex}
        showSearch={false}
        tableClassName="min-w-[600px]"
      />
    </div>
  );
};
