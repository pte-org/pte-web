import type { ApiClient } from "../../client/client";
import type {
  OrganizationResponse,
  UpdateOrganizationProfileRequest,
} from "../../types/organization";

/**
 * Organization endpoints used by a Host: scoped server-side by the caller's token, no tenant path param. Platform
 * operators use the same paths through `requests/tenant`, which also covers governance actions.
 */
export const HOST_ORGANIZATION_ENDPOINTS = {
  organizations: "/api/v1/organizations",
  organization: (publicId: string) => `/api/v1/organizations/${publicId}`,
} as const;

export function listMyOrganizations(client: ApiClient): Promise<OrganizationResponse[]> {
  return client.request<OrganizationResponse[]>(HOST_ORGANIZATION_ENDPOINTS.organizations);
}

export function getMyOrganization(
  client: ApiClient,
  publicId: string,
): Promise<OrganizationResponse> {
  return client.request<OrganizationResponse>(HOST_ORGANIZATION_ENDPOINTS.organization(publicId));
}

export function updateMyOrganization(
  client: ApiClient,
  publicId: string,
  payload: UpdateOrganizationProfileRequest,
): Promise<OrganizationResponse> {
  return client.request<OrganizationResponse>(HOST_ORGANIZATION_ENDPOINTS.organization(publicId), {
    method: "PATCH",
    body: payload,
  });
}
