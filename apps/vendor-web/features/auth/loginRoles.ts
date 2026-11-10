import { ADMIN_ROLES, AUTH_ROUTES, HOST_ROLES } from "./constants";
import { hasAnyRole } from "./permissions";

/**
 * Where an account lands after signing in to this portal, or `null` when none of its roles
 * belongs here (customer staff such as examiners and proctors, and students). The caller
 * must not save a session for `null`.
 */
export function resolveVendorLoginDestination(roles: readonly string[]): string | null {
  if (hasAnyRole(roles, ADMIN_ROLES)) return AUTH_ROUTES.adminDashboard;
  if (hasAnyRole(roles, HOST_ROLES)) return AUTH_ROUTES.hostDashboard;
  return null;
}
