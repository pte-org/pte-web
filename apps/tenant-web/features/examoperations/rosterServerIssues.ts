import { ApiError, ROSTER_VALIDATION_FAILED, type RosterRowError } from "@pte/api-client";
import { ROSTER_ROW_MESSAGES, ROSTER_ROW_UNKNOWN_MESSAGE } from "./constants";
import type { RosterField, RosterRow, RosterRowIssue } from "./types";

const ROSTER_FIELDS: ReadonlySet<string> = new Set<RosterField>([
  "email",
  "fullName",
  "studentCode",
  "programName",
  "className",
  "phone",
  "dateOfBirth",
]);

function isRosterRowError(value: unknown): value is RosterRowError {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.rowIndex === "number" &&
    typeof candidate.field === "string" &&
    typeof candidate.code === "string"
  );
}

function isRosterField(field: string): field is RosterField {
  return ROSTER_FIELDS.has(field);
}

/**
 * Turns a backend roster rejection (`ROSTER_VALIDATION_FAILED`, `details` = row errors) into the same issues the
 * browser check produces, pointing at the spreadsheet row of each sent row. Any other error gives an empty list.
 */
export function rosterServerIssues(error: unknown, sentRows: readonly RosterRow[]): RosterRowIssue[] {
  if (!(error instanceof ApiError) || error.code !== ROSTER_VALIDATION_FAILED) return [];
  if (!Array.isArray(error.details)) return [];
  return error.details.filter(isRosterRowError).flatMap((rowError) => {
    if (!isRosterField(rowError.field)) return [];
    return [
      {
        row: sentRows[rowError.rowIndex]?.sourceRow ?? rowError.rowIndex + 1,
        field: rowError.field,
        message: ROSTER_ROW_MESSAGES[rowError.code] ?? ROSTER_ROW_UNKNOWN_MESSAGE,
      },
    ];
  });
}
