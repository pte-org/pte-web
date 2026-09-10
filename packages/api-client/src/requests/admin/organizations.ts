import type { ApiClient } from "../../client/client";
import type { OrganizationResponse } from "../../types/organization";

/**
 * Host self-service read of its own Organizations (branches) —
 * `caller.tenantId()`-scoped server-side, no `tenantPublicId` path param.
 * Separate from `requests/organization` (which is `PLATFORM_ADMIN`-only
 * and trusts an explicit `tenantPublicId`) — same response shape, different
 * auth/routing, so left untouched per this phase's Design Constraints.
 */
export const HOST_ORGANIZATION_ENDPOINTS = {
  organizations: "/api/admin/organizations",
  organization: (publicId: string) => `/api/admin/organizations/${publicId}`,
} as const;

export function listMyOrganizations(client: ApiClient): Promise<OrganizationResponse[]> {
  return client.request<OrganizationResponse[]>(HOST_ORGANIZATION_ENDPOINTS.organizations);
}

export function getMyOrganization(client: ApiClient, publicId: string): Promise<OrganizationResponse> {
  return client.request<OrganizationResponse>(HOST_ORGANIZATION_ENDPOINTS.organization(publicId));
}
