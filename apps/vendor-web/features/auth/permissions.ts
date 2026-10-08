import type { SessionRole } from "@pte/ui";

export const PLATFORM_ADMIN_ROLES: SessionRole[] = ["PLATFORM_ADMIN"];
export const PLATFORM_OPERATION_ROLES: SessionRole[] = ["PLATFORM_ADMIN", "PLATFORM_MANAGER"];
export const ACADEMIC_AUTHOR_ROLES: SessionRole[] = [
  "PLATFORM_ADMIN",
  "ACADEMIC_MANAGER",
  "ACADEMIC_STAFF",
];
export const ACADEMIC_REVIEW_ROLES: SessionRole[] = ["PLATFORM_ADMIN", "ACADEMIC_MANAGER"];

export const ROLE_LABELS: Record<SessionRole, string> = {
  PLATFORM_ADMIN: "Platform admin",
  PLATFORM_MANAGER: "Platform manager",
  ACADEMIC_MANAGER: "Academic manager",
  ACADEMIC_STAFF: "Academic staff",
  PLATFORM_AUTHOR: "Academic staff (legacy)",
  HOST_ADMIN: "Host admin",
  PROCTOR: "Proctor",
  EXAMINER: "Examiner",
  STUDENT: "Student",
};

export function hasAnyRole(
  roles: readonly string[] | null | undefined,
  allowedRoles: readonly SessionRole[],
): boolean {
  return Boolean(roles?.some((role) => allowedRoles.includes(role as SessionRole)));
}

export function isPlatformAdmin(roles: readonly string[] | null | undefined): boolean {
  return hasAnyRole(roles, PLATFORM_ADMIN_ROLES);
}

export function canManagePlatformOperations(
  roles: readonly string[] | null | undefined,
): boolean {
  return hasAnyRole(roles, PLATFORM_OPERATION_ROLES);
}

export function canAuthorAcademic(roles: readonly string[] | null | undefined): boolean {
  return hasAnyRole(roles, ACADEMIC_AUTHOR_ROLES);
}

export function canReviewAcademic(roles: readonly string[] | null | undefined): boolean {
  return hasAnyRole(roles, ACADEMIC_REVIEW_ROLES);
}

export function roleLabel(role: string): string {
  return ROLE_LABELS[role as SessionRole] ?? role.replaceAll("_", " ");
}
