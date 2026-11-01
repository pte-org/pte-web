import type { StudentRosterRow } from "@pte/api-client";

export type SendPasswordEmailBlockReason = "NO_EMAIL";

export interface SendPasswordEmailState {
  enabled: boolean;
  reason: SendPasswordEmailBlockReason | null;
}

/** A temporary password can only be e-mailed to a student who has an address on file. */
export function getSendPasswordEmailState(
  student: Pick<StudentRosterRow, "email"> | { email: string | null },
): SendPasswordEmailState {
  const hasEmail = typeof student.email === "string" && student.email.trim().length > 0;
  return hasEmail ? { enabled: true, reason: null } : { enabled: false, reason: "NO_EMAIL" };
}

/** What the confirm dialog needs to mail a student; shared by the roster and the student detail screen. */
export interface SendPasswordEmailTarget {
  studentPublicId: string;
  fullName: string;
  email: string;
}

/** Null when there is no address to mail, so callers cannot open the dialog for such a student. */
export function buildSendPasswordEmailTarget(
  studentPublicId: string,
  fullName: string,
  email: string | null,
): SendPasswordEmailTarget | null {
  const address = email?.trim() ?? "";
  return address ? { studentPublicId, fullName, email: address } : null;
}
