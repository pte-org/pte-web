import { createApiClient, type ApiClient, type RefreshedTokens } from "@aptis/api-client";
import { sessionStorage } from "./sessionStorage";

/**
 * `vendor-web` and `tenant-web` each wired an identical `createApiClient`
 * call (getToken/getRefreshToken/refreshAccessToken/onTokenRefreshed/
 * onUnauthorized, all closing over `sessionStorage`) — factored here so a
 * future change to the refresh contract is made once, not drifted across
 * both apps. Each app still supplies its own `baseUrl`.
 */
export function createSessionApiClient(baseUrl: string): ApiClient {
  return createApiClient({
    baseUrl,
    getToken: () => sessionStorage.getAccessToken(),
    getRefreshToken: () => sessionStorage.retrieve()?.refreshToken ?? null,
    refreshAccessToken: (refreshToken) => refreshAccessToken(baseUrl, refreshToken),
    onTokenRefreshed: (tokens) => {
      const current = sessionStorage.retrieve();
      if (!current) return;
      sessionStorage.save({
        ...current,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + tokens.expiresInSeconds * 1000,
      });
    },
    onUnauthorized: () => sessionStorage.clear(),
  });
}

/**
 * Raw `fetch` (not routed through the `apiClient` instance being
 * constructed by `createSessionApiClient` above, which doesn't exist yet
 * at that point — and would recurse back into its own 401 handling anyway)
 * hitting iam's real `/auth/refresh` endpoint directly. Mirrors
 * `@aptis/api-client`'s `requests/auth/refreshAuth` request shape but
 * stays independent of it to avoid a circular import between that module
 * and `client.ts`.
 */
async function refreshAccessToken(baseUrl: string, refreshToken: string): Promise<RefreshedTokens> {
  const response = await fetch(`${baseUrl}/api/iam/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) throw new Error(`Token refresh failed (${response.status})`);
  const envelope = (await response.json()) as { data?: RefreshedTokens } & Partial<RefreshedTokens>;
  const data = envelope.data ?? envelope;
  if (!data.accessToken || !data.refreshToken) throw new Error("Malformed refresh response");
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresInSeconds: data.expiresInSeconds ?? 0,
  };
}
