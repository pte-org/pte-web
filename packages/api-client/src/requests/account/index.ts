import type { ApiClient } from "../../client/client";
import type { CurrentUser } from "../../types/account";

export const ACCOUNT_ENDPOINTS = {
  me: "/api/v1/auth/me",
} as const;

export function getCurrentUser(client: ApiClient): Promise<CurrentUser> {
  return client.request<CurrentUser>(ACCOUNT_ENDPOINTS.me);
}
