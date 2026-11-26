"use client";

import type { ReactElement } from "react";
import { DataTable } from "@pte/ui";
import { useRosterImportText } from "../hooks/useRosterImportText";
import type { SkippedRow } from "../types";
import { ROSTER_TEXT } from "./constants";

interface SkippedRowsReportProps {
  rows: SkippedRow[];
}

export const SkippedRowsReport = ({ rows }: SkippedRowsReportProps): ReactElement | null => {
  const text = useRosterImportText();
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-gray-700">{text.skippedHeading(rows.length)}</h4>
      <DataTable
        columns={[
          {
            key: "row",
            label: text.skippedRow,
            header: text.skippedRow,
            filterAccessor: (row: SkippedRow) => row.rowIndex + 1,
            cell: (row: SkippedRow) => <span className="font-mono">{row.rowIndex + 1}</span>,
          },
          {
            key: "email",
            label: text.skippedEmail,
            header: text.skippedEmail,
            filterAccessor: (row: SkippedRow) => row.email,
            cell: (row: SkippedRow) => row.email ?? ROSTER_TEXT.EMPTY_VALUE,
          },
          {
            key: "reason",
            label: text.skippedReason,
            header: text.skippedReason,
            filterAccessor: (row: SkippedRow) => row.reason,
            cell: (row: SkippedRow) => (
              <span className="text-amber-700">{text.skippedReasonMessage(row.reason)}</span>
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
