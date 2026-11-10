import {
  ROSTER_EMAIL_PATTERN,
  ROSTER_FIELD_LIMITS,
  ROSTER_ISO_DATE_PATTERN,
  ROSTER_PHONE_PATTERN,
  ROSTER_PHONE_SEPARATORS,
  ROSTER_ROW_MESSAGES,
} from "./constants";
import type { RosterField, RosterRow, RosterRowIssue } from "./types";

/** Matches the backend roster codes so a cell reads the same whether the browser or the server caught it. */
type RosterIssueCode = keyof typeof ROSTER_ROW_MESSAGES;

interface LengthRule {
  field: RosterField;
  max: number;
  code: RosterIssueCode;
}

const LENGTH_RULES: readonly LengthRule[] = [
  { field: "studentCode", max: ROSTER_FIELD_LIMITS.STUDENT_CODE_MAX_LENGTH, code: "STUDENT_CODE_TOO_LONG" },
  { field: "programName", max: ROSTER_FIELD_LIMITS.PROGRAM_NAME_MAX_LENGTH, code: "PROGRAM_NAME_TOO_LONG" },
  { field: "className", max: ROSTER_FIELD_LIMITS.CLASS_NAME_MAX_LENGTH, code: "CLASS_NAME_TOO_LONG" },
];

function emailCode(email: string | undefined, seenEmails: Set<string>): RosterIssueCode | undefined {
  if (!email) return "EMAIL_REQUIRED";
  if (email.length > ROSTER_FIELD_LIMITS.EMAIL_MAX_LENGTH) return "EMAIL_TOO_LONG";
  if (!ROSTER_EMAIL_PATTERN.test(email)) return "EMAIL_INVALID";
  const key = email.toLowerCase();
  if (seenEmails.has(key)) return "DUPLICATE_EMAIL_IN_BATCH";
  seenEmails.add(key);
  return undefined;
}

function fullNameCode(fullName: string | undefined): RosterIssueCode | undefined {
  if (!fullName) return "FULL_NAME_REQUIRED";
  return fullName.length > ROSTER_FIELD_LIMITS.FULL_NAME_MAX_LENGTH ? "FULL_NAME_TOO_LONG" : undefined;
}

function isPastIsoDate(value: string, today: Date): boolean {
  if (!ROSTER_ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  // A calendar-invalid date such as 2008-02-31 rolls over, so the formatted value no longer matches.
  const roundTrip = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
  return roundTrip === value && date < today;
}

/**
 * Checks every row against the Student import rules and returns all broken cells at once. The backend runs the
 * same rules again; this copy only lets the Host fix the file before anything is sent.
 */
export function validateRosterRows(rows: readonly RosterRow[], today: Date = new Date()): RosterRowIssue[] {
  const issues: RosterRowIssue[] = [];
  const seenEmails = new Set<string>();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  rows.forEach((row, index) => {
    const rowNumber = row.sourceRow ?? index + 1;
    const add = (field: RosterField, code: RosterIssueCode | undefined): void => {
      if (code) issues.push({ row: rowNumber, field, message: ROSTER_ROW_MESSAGES[code] });
    };

    add("email", emailCode(row.email, seenEmails));
    add("fullName", fullNameCode(row.fullName));
    LENGTH_RULES.forEach((rule) => {
      const value = row[rule.field];
      add(rule.field, value && value.length > rule.max ? rule.code : undefined);
    });
    if (row.phone && !ROSTER_PHONE_PATTERN.test(row.phone.replace(ROSTER_PHONE_SEPARATORS, ""))) {
      add("phone", "PHONE_INVALID");
    }
    if (row.dateOfBirth && !isPastIsoDate(row.dateOfBirth, startOfToday)) {
      add("dateOfBirth", "DATE_OF_BIRTH_INVALID");
    }
  });
  return issues;
}
