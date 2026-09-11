import type { ApiClient } from "../../client/client";
import type { CreateOrganizationRequest, OrganizationResponse } from "../../types/organization";

export const ORGANIZATION_ENDPOINTS = {
  organizations: (tenantPublicId: string) => `/api/admin/tenants/${tenantPublicId}/organizations`,
  organization: (tenantPublicId: string, publicId: string) =>
    `/api/admin/tenants/${tenantPublicId}/organizations/${publicId}`,
  suspend: (tenantPublicId: string, publicId: string) =>
    `/api/admin/tenants/${tenantPublicId}/organizations/${publicId}/suspend`,
  reactivate: (tenantPublicId: string, publicId: string) =>
    `/api/admin/tenants/${tenantPublicId}/organizations/${publicId}/reactivate`,
} as const;

export function createOrganization(
  client: ApiClient,
  tenantPublicId: string,
  payload: CreateOrganizationRequest,
): Promise<OrganizationResponse> {
  return client.request<OrganizationResponse>(ORGANIZATION_ENDPOINTS.organizations(tenantPublicId), {
    method: "POST",
    body: payload,
  });
}

export function listOrganizations(
  client: ApiClient,
  tenantPublicId: string,
): Promise<OrganizationResponse[]> {
  return client.request<OrganizationResponse[]>(ORGANIZATION_ENDPOINTS.organizations(tenantPublicId));
}

export function suspendOrganization(
  client: ApiClient,
  tenantPublicId: string,
  publicId: string,
): Promise<OrganizationResponse> {
  return client.request<OrganizationResponse>(ORGANIZATION_ENDPOINTS.suspend(tenantPublicId, publicId), {
    method: "POST",
  });
}

export function reactivateOrganization(
  client: ApiClient,
  tenantPublicId: string,
  publicId: string,
): Promise<OrganizationResponse> {
  return client.request<OrganizationResponse>(ORGANIZATION_ENDPOINTS.reactivate(tenantPublicId, publicId), {
    method: "POST",
  });
}
