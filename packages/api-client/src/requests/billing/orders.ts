import { DEFAULT_PAGE_SIZE, type ApiClient, type PagedResult } from "../../client/client";
import type { CreateOrderRequest, OrderResponse } from "../../types/billing";

export const ORDER_ENDPOINTS = {
  orders: "/api/v1/orders",
} as const;

export function listOrders(
  client: ApiClient,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
): Promise<PagedResult<OrderResponse>> {
  return client.request<PagedResult<OrderResponse>>(
    `${ORDER_ENDPOINTS.orders}?page=${page}&size=${size}`,
  );
}

export function createOrder(
  client: ApiClient,
  payload: CreateOrderRequest,
): Promise<OrderResponse> {
  return client.request(ORDER_ENDPOINTS.orders, { method: "POST", body: payload });
}
