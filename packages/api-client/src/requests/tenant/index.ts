import type { ApiClient } from "../../client/client";
import type {
  OnboardTenantRequest,
  SuspendTenantRequest,
  TenantSuspensionImpactResponse,
  TenantResponse,
  UpdateBrandingRequest,
} from "../../types/tenant";

export const TENANT_ENDPOINTS = {
  tenants: "/api/v1/organizations",
  tenant: (publicId: string) => `/api/v1/organizations/${publicId}`,
  suspensionImpact: (publicId: string, days?: number) =>
    `/api/v1/organizations/${publicId}/suspension-impact${days === undefined ? "" : `?days=${days}`}`,
  branding: (publicId: string) => `/api/v1/organizations/${publicId}/branding`,
  status: (publicId: string) => `/api/v1/organizations/${publicId}/status`,
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
