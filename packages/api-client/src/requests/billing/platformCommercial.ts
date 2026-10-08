import { DEFAULT_PAGE_SIZE, type ApiClient, type PagedResult } from "../../client/client";
import type {
  PlatformOrderResponse,
  PlatformSubscriptionResponse,
} from "../../types/billing";

export const PLATFORM_COMMERCIAL_ENDPOINTS = {
  orders: "/api/v1/platform/commercial/orders",
  subscriptions: "/api/v1/platform/commercial/subscriptions",
} as const;

function pageQuery(page: number, size: number, tenantId?: string): string {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  if (tenantId?.trim()) query.set("tenantId", tenantId.trim());
  return query.toString();
}

export function listPlatformOrders(
  client: ApiClient,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  tenantId?: string,
): Promise<PagedResult<PlatformOrderResponse>> {
  return client.request<PagedResult<PlatformOrderResponse>>(
    `${PLATFORM_COMMERCIAL_ENDPOINTS.orders}?${pageQuery(page, size, tenantId)}`,
  );
}

export function listPlatformSubscriptions(
  client: ApiClient,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  tenantId?: string,
): Promise<PagedResult<PlatformSubscriptionResponse>> {
  return client.request<PagedResult<PlatformSubscriptionResponse>>(
    `${PLATFORM_COMMERCIAL_ENDPOINTS.subscriptions}?${pageQuery(page, size, tenantId)}`,
  );
}
