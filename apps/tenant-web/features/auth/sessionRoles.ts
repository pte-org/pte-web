import type { SessionRole } from "@pte/ui";

/** Roles that have a workspace in this portal. STUDENT is deliberately absent: students never sign in here. */
export const PORTAL_SESSION_ROLES: readonly SessionRole[] = [
  "PLATFORM_ADMIN",
  "PLATFORM_AUTHOR",
  "HOST_ADMIN",
  "EXAMINER",
  "PROCTOR",
];

export function toSessionRoles(rawRoles: readonly string[]): SessionRole[] {
  return rawRoles.filter((role): role is SessionRole =>
    (PORTAL_SESSION_ROLES as readonly string[]).includes(role),
  );
}

/**
 * A student signs in to the exam app and the practice app, so the shared login still succeeds for them; this
 * portal must refuse that session instead of treating it as an unknown account.
 */
export function isStudentOnlyAccount(rawRoles: readonly string[]): boolean {
  return rawRoles.includes("STUDENT") && toSessionRoles(rawRoles).length === 0;
}
