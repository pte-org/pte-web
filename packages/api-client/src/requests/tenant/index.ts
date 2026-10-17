import type { ApiClient } from "../../client/client";
import type {
  OnboardTenantRequest,
  TenantSuspensionImpactResponse,
  TenantResponse,
  UpdateBrandingRequest,
} from "../../types/tenant";

export const TENANT_ENDPOINTS = {
  tenants: "/api/v1/tenants",
  tenant: (publicId: string) => `/api/v1/tenants/${publicId}`,
  suspend: (publicId: string, days?: number) =>
    `/api/v1/tenants/${publicId}/suspend${days === undefined ? "" : `?days=${days}`}`,
  suspensionImpact: (publicId: string, days?: number) =>
    `/api/v1/tenants/${publicId}/suspension-impact${days === undefined ? "" : `?days=${days}`}`,
  reactivate: (publicId: string) => `/api/v1/tenants/${publicId}/reactivate`,
  branding: (publicId: string) => `/api/v1/tenants/${publicId}/branding`,
} as const;

export function onboardTenant(
  client: ApiClient,
  payload: OnboardTenantRequest,
): Promise<TenantResponse> {
  return client.request<TenantResponse>(TENANT_ENDPOINTS.tenants, {
    method: "POST",
    body: payload,
  });
}

export function listTenants(client: ApiClient): Promise<TenantResponse[]> {
  return client.request<TenantResponse[]>(TENANT_ENDPOINTS.tenants);
}

export function getTenant(client: ApiClient, publicId: string): Promise<TenantResponse> {
  return client.request<TenantResponse>(TENANT_ENDPOINTS.tenant(publicId));
}

export function suspendTenant(
  client: ApiClient,
  publicId: string,
  days?: number,
): Promise<TenantResponse> {
  return client.request<TenantResponse>(TENANT_ENDPOINTS.suspend(publicId, days), {
    method: "POST",
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
  return client.request<TenantResponse>(TENANT_ENDPOINTS.reactivate(publicId), {
    method: "POST",
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
