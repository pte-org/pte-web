import type { ApiClient } from "../../client/client";
import type { CurrentUser, UpdateOwnProfileRequest } from "../../types/account";

export const ACCOUNT_ENDPOINTS = {
  me: "/api/v1/auth/me",
  meProfile: "/api/v1/auth/me/profile",
} as const;

export function getCurrentUser(client: ApiClient): Promise<CurrentUser> {
  return client.request<CurrentUser>(ACCOUNT_ENDPOINTS.me);
}

export function updateOwnProfile(
  client: ApiClient,
  payload: UpdateOwnProfileRequest,
): Promise<CurrentUser> {
  return client.request<CurrentUser>(ACCOUNT_ENDPOINTS.meProfile, {
    method: "PATCH",
    body: payload,
  });
}
