import type { SessionRole } from "@pte/ui";

/**
 * Roles that have a workspace in this portal (see `resolveWorkspace`). Platform and academic
 * staff sign in to the vendor portal and STUDENT never signs in here, so none of them is listed:
 * a role without a workspace would be saved as a session and then bounced back to the login
 * page with no explanation.
 */
export const PORTAL_SESSION_ROLES: readonly SessionRole[] = ["HOST_ADMIN", "EXAMINER", "PROCTOR"];

export function toSessionRoles(rawRoles: readonly string[]): SessionRole[] {
  return rawRoles.filter((role): role is SessionRole =>
    (PORTAL_SESSION_ROLES as readonly string[]).includes(role),
  );
}

export type PortalLoginDecision =
  | { kind: "allowed"; roles: SessionRole[] }
  /** A student signs in to the exam and practice apps, so the shared login succeeds for them; this portal must refuse that session with a specific message. */
  | { kind: "student" }
  /** Valid credentials of an account that belongs to another portal. */
  | { kind: "denied" };

/** What to do with a successful login, given the roles in its token. */
export function decidePortalLogin(rawRoles: readonly string[]): PortalLoginDecision {
  const roles = toSessionRoles(rawRoles);
  if (roles.length > 0) return { kind: "allowed", roles };
  return rawRoles.includes("STUDENT") ? { kind: "student" } : { kind: "denied" };
}
