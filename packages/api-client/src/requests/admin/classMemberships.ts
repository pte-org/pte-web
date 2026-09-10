import type { ApiClient } from "../../client/client";
import type { ClassMembershipResponse } from "../../types/admin/studentClass";

export const CLASS_MEMBERSHIP_ENDPOINTS = {
  classMemberships: "/api/admin/class-memberships",
} as const;

/**
 * Tenant-wide student roster, optionally filtered by Program — backs the
 * org-wide student search (Phase 7) and later reuse (Phase 10 bulk
 * exam-session roster resolution, Phase 13 dashboard). Always
 * `caller.tenantId()`-scoped server-side; `programPublicId` here is purely
 * a narrowing filter, never a substitute for that scoping.
 */
export function listClassMemberships(
  client: ApiClient,
  programPublicId?: string,
): Promise<ClassMembershipResponse[]> {
  const query = programPublicId ? `?programPublicId=${encodeURIComponent(programPublicId)}` : "";
  return client.request<ClassMembershipResponse[]>(`${CLASS_MEMBERSHIP_ENDPOINTS.classMemberships}${query}`);
}
