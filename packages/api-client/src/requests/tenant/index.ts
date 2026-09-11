import type { ApiClient } from "../../client/client";
import type { OnboardTenantRequest, TenantResponse, UpdateBrandingRequest } from "../../types/tenant";

export const TENANT_ENDPOINTS = {
  tenants: "/api/admin/tenants",
  tenant: (publicId: string) => `/api/admin/tenants/${publicId}`,
  suspend: (publicId: string) => `/api/admin/tenants/${publicId}/suspend`,
  reactivate: (publicId: string) => `/api/admin/tenants/${publicId}/reactivate`,
  branding: (publicId: string) => `/api/admin/tenants/${publicId}/branding`,
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

export function getTenant(
  client: ApiClient,
  publicId: string,
): Promise<TenantResponse> {
  return client.request<TenantResponse>(TENANT_ENDPOINTS.tenant(publicId));
}

export function suspendTenant(
  client: ApiClient,
  publicId: string,
): Promise<TenantResponse> {
  return client.request<TenantResponse>(TENANT_ENDPOINTS.suspend(publicId), {
    method: "POST",
  });
}

export function reactivateTenant(
  client: ApiClient,
  publicId: string,
): Promise<TenantResponse> {
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
