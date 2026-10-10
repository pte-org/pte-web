export interface RosterRow {
  email?: string;
  username?: string;
  fullName?: string;
  studentCode?: string;
  className?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface RosterTemplateColumn {
  field: keyof RosterRow;
  header: string;
  required: boolean;
  /** Pre-format this column's template cells as Text (Excel drops leading zeros of numbers). */
  forceText: boolean;
  format: string;
  example: string;
}

export interface RosterFileResult {
  fileName: string;
  rows: RosterRow[];
  /** Header cells in the file that are not part of the system template. */
  ignoredColumns: string[];
  /** Required template columns the file does not have. */
  missingColumns: string[];
}

export interface RosterColumnIssues {
  ignoredColumns: string[];
  missingColumns: string[];
}

export interface CreatedAccount {
  publicId: string;
  username: string;
  email: string | null;
  fullName: string | null;
  generatedPassword: string;
}

export interface SkippedRow {
  rowIndex: number;
  email: string | null;
  reason: string;
}

export type ImportStep = "idle" | "created" | "enrolled";

/** Persisted to sessionStorage between the create and enroll steps, so an interrupted import never strands a generated password. */
export interface PendingImport {
  sessionPublicId: string;
  created: CreatedAccount[];
}
