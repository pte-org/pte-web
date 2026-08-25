import type { ApiClient } from "../../client/client";
import type { GrantQuotaRequest, QuotaTransactionResponse } from "../../types/quota";

export const QUOTA_ENDPOINTS = {
  transactions: (tenantPublicId: string) => `/api/admin/tenants/${tenantPublicId}/quota-transactions`,
} as const;

export function grantQuota(
  client: ApiClient,
  tenantPublicId: string,
  payload: GrantQuotaRequest,
): Promise<QuotaTransactionResponse> {
  return client.request<QuotaTransactionResponse>(QUOTA_ENDPOINTS.transactions(tenantPublicId), {
    method: "POST",
    body: payload,
  });
}

export function listQuotaHistory(
  client: ApiClient,
  tenantPublicId: string,
): Promise<QuotaTransactionResponse[]> {
  return client.request<QuotaTransactionResponse[]>(QUOTA_ENDPOINTS.transactions(tenantPublicId));
}
