import { DEFAULT_PAGE_SIZE, type ApiClient, type PagedResult } from "../../client/client";
import type { CreateOrderRequest, OrderResponse } from "../../types/billing";

export const ORDER_ENDPOINTS = {
  orders: "/api/v1/orders",
  order: (publicId: string) => `/api/v1/orders/${publicId}`,
} as const;

export function getOrder(client: ApiClient, publicId: string): Promise<OrderResponse> {
  return client.request<OrderResponse>(ORDER_ENDPOINTS.order(publicId));
}

export function listOrders(
  client: ApiClient,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  search?: string,
): Promise<PagedResult<OrderResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const normalizedSearch = search?.trim();
  if (normalizedSearch) params.set("search", normalizedSearch);
  return client.request<PagedResult<OrderResponse>>(
    `${ORDER_ENDPOINTS.orders}?${params.toString()}`,
  );
}

export function createOrder(
  client: ApiClient,
  payload: CreateOrderRequest,
): Promise<OrderResponse> {
  return client.request(ORDER_ENDPOINTS.orders, { method: "POST", body: payload });
}
