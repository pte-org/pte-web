import type { ApiClient } from "../../client/client";
import type { TenantResponse } from "../../types/tenant";

export const TENANT_ENDPOINTS = {
  tenants: "/api/v1/tenants",
} as const;

export function listTenants(client: ApiClient): Promise<TenantResponse[]> {
  return client.request<TenantResponse[]>(TENANT_ENDPOINTS.tenants);
}
