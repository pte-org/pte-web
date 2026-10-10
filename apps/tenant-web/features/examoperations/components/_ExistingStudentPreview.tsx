import type { ReactElement } from "react";
import type { UserResponse } from "@pte/api-client";
import { Alert } from "@pte/ui";
import type { RosterRow } from "../types";
import { EXISTING_STUDENT_IMPORT_TEXT as T } from "./constants";

export interface MatchedStudent {
  row: RosterRow;
  student: UserResponse;
}

export interface SkippedStudent {
  row: RosterRow;
  reason: string;
}

export interface ImportPreview {
  rows: number;
  matched: MatchedStudent[];
  skipped: SkippedStudent[];
}

const MAX_SKIPPED_ROWS_SHOWN = 10;

function rowIdentifier(row: RosterRow): string {
  return row.email || row.username || row.studentCode || row.fullName || "Unknown row";
}

interface ExistingStudentPreviewProps {
  preview: ImportPreview;
}

export const ExistingStudentPreview = ({ preview }: ExistingStudentPreviewProps): ReactElement => (
  <div className="flex flex-col gap-3 text-sm">
    <div className="rounded-md bg-blue-50 px-3 py-2 text-blue-900">
      <p>{T.ROWS_FOUND(preview.rows)}</p>
      <p className="font-medium">{T.MATCHED(preview.matched.length)}</p>
      {preview.skipped.length > 0 && <p>{T.SKIPPED(preview.skipped.length)}</p>}
    </div>

    {preview.matched.length > 0 && (
      <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
        <div className="divide-y divide-gray-100">
          {preview.matched.map(({ row, student }) => (
            <div key={student.publicId} className="px-3 py-2">
              <p className="font-medium text-gray-900">{student.fullName}</p>
              <p className="text-xs text-gray-500">
                {student.email} · {rowIdentifier(row)}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}

    {preview.skipped.length > 0 && (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
        <p className="font-medium">{T.SKIPPED_TITLE}</p>
        <ul className="mt-1 list-disc pl-5">
          {preview.skipped.slice(0, MAX_SKIPPED_ROWS_SHOWN).map(({ row, reason }, index) => (
            <li key={`${rowIdentifier(row)}-${index}`}>
              {rowIdentifier(row)} — {reason}
            </li>
          ))}
        </ul>
      </div>
    )}

    {preview.matched.length === 0 && <Alert tone="warning">{T.NO_MATCHES}</Alert>}
  </div>
);
