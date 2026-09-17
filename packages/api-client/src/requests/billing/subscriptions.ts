import type { ApiClient } from "../../client/client";
import type { SubscriptionResponse } from "../../types/billing";

export const SUBSCRIPTION_ENDPOINTS = {
  subscriptions: "/api/v1/subscriptions",
} as const;

export function listSubscriptions(client: ApiClient): Promise<SubscriptionResponse[]> {
  return client.request(SUBSCRIPTION_ENDPOINTS.subscriptions);
}
