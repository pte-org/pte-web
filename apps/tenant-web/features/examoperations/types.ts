export interface RosterRow {
  email?: string;
  username?: string;
  fullName?: string;
  studentCode?: string;
  /** For the Host's own reference; import does not place Students by it yet. */
  programName?: string;
  className?: string;
  phone?: string;
  dateOfBirth?: string;
  /** 1-based spreadsheet row the values came from; never sent to the API. */
  sourceRow?: number;
}

/** Fields a roster file can fill (everything except the parser's own `sourceRow`). */
export type RosterField = Exclude<keyof RosterRow, "sourceRow">;

/** One broken cell of an uploaded roster, shown before any account is created. */
export interface RosterRowIssue {
  /** Spreadsheet row number as the Host sees it in Excel. */
  row: number;
  field: RosterField;
  message: string;
}

export interface RosterTemplateColumn {
  field: RosterField;
  header: string;
  required: boolean;
  /** Pre-format this column's template cells as Text (Excel drops leading zeros of numbers). */
  forceText: boolean;
  format: string;
  example: string;
  /** Value written in the template's sample row (row 2), which the parser always skips. */
  sample: string;
}

export interface RosterFileResult {
  fileName: string;
  rows: RosterRow[];
  /** Header cells in the file that are not part of the system template. */
  ignoredColumns: string[];
  /** Required template columns the file does not have. */
  missingColumns: string[];
  /** Broken cells; while any remain no account may be created. */
  rowIssues: RosterRowIssue[];
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

/** What a roster import sends: the parsed rows plus whether to e-mail each created Student their account. */
export interface RosterCreateInput {
  rows: RosterRow[];
  sendCredentialsEmail: boolean;
}
