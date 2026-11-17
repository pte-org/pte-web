import {
  createApiClient,
  noteTokenRefreshed,
  type ApiClient,
  type RefreshedTokens,
} from "@pte/api-client";
import { sessionStorage } from "./sessionStorage";
import { getSessionGeneration } from "./sessionLifecycle";

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
        ...(typeof tokens.mustChangePassword === "boolean"
          ? { mustChangePassword: tokens.mustChangePassword }
          : {}),
      });
      noteTokenRefreshed(tokens.accessToken);
    },
    onUnauthorized: () => sessionStorage.clear(),
    getSessionGeneration,
  });
}

const HTTP_REQUEST_TIMEOUT = 408;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_CLIENT_ERROR_MIN = 400;
const HTTP_SERVER_ERROR_MIN = 500;

/**
 * A 4xx answer means the server looked at the refresh token and said no
 * (identity answers 401 INVALID_REFRESH_TOKEN for an expired or revoked
 * one). 408 and 429 are the exceptions: the token was never judged, so the
 * attempt simply did not complete.
 */
function isRefreshRefusal(status: number): boolean {
  if (status === HTTP_REQUEST_TIMEOUT || status === HTTP_TOO_MANY_REQUESTS) return false;
  return status >= HTTP_CLIENT_ERROR_MIN && status < HTTP_SERVER_ERROR_MIN;
}

/**
 * Raw `fetch` (not routed through the `apiClient` instance being
 * constructed by `createSessionApiClient` above, which doesn't exist yet
 * at that point — and would recurse back into its own 401 handling anyway)
 * hitting identity's real `/auth/refresh` endpoint directly. Mirrors
 * `@pte/api-client`'s `requests/auth/refreshAuth` request shape but
 * stays independent of it to avoid a circular import between that module
 * and `client.ts`.
 *
 * <p>The path is duplicated here rather than imported from
 * `AUTH_ENDPOINTS.refresh` for that same circular-import reason — so it
 * must be kept in sync by hand. It silently breaks every session at the
 * 15-minute access-token expiry, not at login, which is why it is easy to
 * miss when endpoints move.
 *
 * <p>Follows the `refreshAccessToken` contract of `@pte/api-client`:
 * `null` when the server refused the refresh token (the session is over),
 * a thrown error when the refresh could not be completed (the session is
 * kept, so a network blip or a server outage never signs the user out).
 */
async function refreshAccessToken(
  baseUrl: string,
  refreshToken: string,
): Promise<RefreshedTokens | null> {
  const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (isRefreshRefusal(response.status)) return null;
  if (!response.ok) throw new Error(`Token refresh failed (${response.status})`);
  // The body is untrusted JSON: typed loosely here, and the token fields are checked just below.
  const envelope = (await response.json()) as { data?: RefreshedTokens } & Partial<RefreshedTokens>;
  const data = envelope.data ?? envelope;
  if (!data.accessToken || !data.refreshToken) throw new Error("Malformed refresh response");
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresInSeconds: data.expiresInSeconds ?? 0,
    mustChangePassword: data.mustChangePassword === true,
  };
}
