import type { ApiClient } from "../../client/client";
import type { GrantQuotaRequest, QuotaGrantResponse } from "../../types/quota";

export const QUOTA_ENDPOINTS = {
  grants: (tenantPublicId: string) =>
    `/api/v1/organizations/${tenantPublicId}/quota-grants`,
} as const;

export function grantQuota(
  client: ApiClient,
  tenantPublicId: string,
  payload: GrantQuotaRequest,
): Promise<QuotaGrantResponse> {
  return client.request<QuotaGrantResponse>(QUOTA_ENDPOINTS.grants(tenantPublicId), {
    method: "POST",
    body: payload,
  });
}

export function listQuotaHistory(
  client: ApiClient,
  tenantPublicId: string,
): Promise<QuotaGrantResponse[]> {
  return client.request<QuotaGrantResponse[]>(QUOTA_ENDPOINTS.grants(tenantPublicId));
}
