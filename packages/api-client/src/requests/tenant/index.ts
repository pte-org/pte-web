import type { ApiClient } from "../../client/client";
import type {
  DirectOnboardRequest,
  DirectOnboardResponse,
  SuspendTenantRequest,
  TenantSuspensionImpactResponse,
  TenantResponse,
  UpdateBrandingRequest,
} from "../../types/tenant";
import type { OrganizationResponse } from "../../types/organization";

export const TENANT_ENDPOINTS = {
  tenants: "/api/v1/organizations",
  directOnboard: "/api/v1/admin/organizations",
  tenant: (publicId: string) => `/api/v1/organizations/${publicId}`,
  suspensionImpact: (publicId: string, days?: number) =>
    `/api/v1/organizations/${publicId}/suspension-impact${days === undefined ? "" : `?days=${days}`}`,
  branding: (publicId: string) => `/api/v1/organizations/${publicId}/branding`,
  status: (publicId: string) => `/api/v1/organizations/${publicId}/status`,
} as const;

/** Creates and approves an organization with its first host; the platform-only replacement of direct onboarding. */
export function onboardOrganization(
  client: ApiClient,
  payload: DirectOnboardRequest,
): Promise<DirectOnboardResponse> {
  return client.request<DirectOnboardResponse>(TENANT_ENDPOINTS.directOnboard, {
    method: "POST",
    body: payload,
  });
}

export function listTenants(client: ApiClient): Promise<TenantResponse[]> {
  return client.request<TenantResponse[]>(TENANT_ENDPOINTS.tenants);
}

/**
 * Platform lookup by organization code or tax-code prefix, or exact contact email; at most 20 rows.
 * Returns the full organization so a caller can show its address and facility type.
 */
export function searchTenants(client: ApiClient, q: string): Promise<OrganizationResponse[]> {
  const query = new URLSearchParams({ q: q.trim() });
  return client.request<OrganizationResponse[]>(`${TENANT_ENDPOINTS.tenants}?${query.toString()}`);
}

export function getTenant(client: ApiClient, publicId: string): Promise<TenantResponse> {
  return client.request<TenantResponse>(TENANT_ENDPOINTS.tenant(publicId));
}

export function suspendTenant(
  client: ApiClient,
  publicId: string,
  payload: SuspendTenantRequest,
): Promise<TenantResponse> {
  return client.request<TenantResponse>(TENANT_ENDPOINTS.status(publicId), {
    method: "PATCH", body: { action: "SUSPEND", ...payload },
  });
}

export function getTenantSuspensionImpact(
  client: ApiClient,
  publicId: string,
  days?: number,
): Promise<TenantSuspensionImpactResponse> {
  return client.request<TenantSuspensionImpactResponse>(
    TENANT_ENDPOINTS.suspensionImpact(publicId, days),
  );
}

export function reactivateTenant(client: ApiClient, publicId: string): Promise<TenantResponse> {
  return client.request<TenantResponse>(TENANT_ENDPOINTS.status(publicId), {
    method: "PATCH", body: { action: "REACTIVATE" },
  });
}

export function updateTenantBranding(
  client: ApiClient,
  publicId: string,
  payload: UpdateBrandingRequest,
): Promise<TenantResponse> {
  return client.request<TenantResponse>(TENANT_ENDPOINTS.branding(publicId), {
    method: "POST",
    body: payload,
  });
}
