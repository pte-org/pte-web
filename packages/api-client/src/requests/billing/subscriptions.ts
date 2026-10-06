import type { ApiClient } from "../../client/client";
import type {
  LicenseKeyResponse,
  RevealLicenseKeyRequest,
  SubscriptionResponse,
} from "../../types/billing";

export const SUBSCRIPTION_ENDPOINTS = {
  subscriptions: "/api/v1/subscriptions",
  subscription: (publicId: string) => `/api/v1/subscriptions/${publicId}`,
  revealLicenseKey: (publicId: string) => `/api/v1/subscriptions/${publicId}/license-key/reveal`,
} as const;

export function getSubscription(
  client: ApiClient,
  publicId: string,
): Promise<SubscriptionResponse> {
  return client.request<SubscriptionResponse>(SUBSCRIPTION_ENDPOINTS.subscription(publicId));
}

export function listSubscriptions(client: ApiClient): Promise<SubscriptionResponse[]> {
  return client.request(SUBSCRIPTION_ENDPOINTS.subscriptions);
}

/** Step-up re-authentication: returns the full license key only if `password` matches. */
export function revealLicenseKey(
  client: ApiClient,
  publicId: string,
  payload: RevealLicenseKeyRequest,
): Promise<LicenseKeyResponse> {
  return client.request<LicenseKeyResponse>(SUBSCRIPTION_ENDPOINTS.revealLicenseKey(publicId), {
    method: "POST",
    body: payload,
  });
}
