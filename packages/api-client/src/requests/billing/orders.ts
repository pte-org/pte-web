import type { ApiClient } from "../../client/client";
import type { CreateOrderRequest, OrderResponse } from "../../types/billing";

export const ORDER_ENDPOINTS = {
  orders: "/api/v1/orders",
} as const;

export function listOrders(client: ApiClient): Promise<OrderResponse[]> {
  return client.request(ORDER_ENDPOINTS.orders);
}

export function createOrder(client: ApiClient, payload: CreateOrderRequest): Promise<OrderResponse> {
  return client.request(ORDER_ENDPOINTS.orders, { method: "POST", body: payload });
}
