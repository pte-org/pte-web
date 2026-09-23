export interface RosterRow {
  email?: string;
  username?: string;
  fullName?: string;
  studentCode?: string;
  className?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface RosterFileResult {
  fileName: string;
  rows: RosterRow[];
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
