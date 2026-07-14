import { createApiClient } from "@aptis/api-client";
import { sessionStorage } from "@aptis/ui";
import { API_BASE_URL } from "@/features/auth/constants";

/**
 * App-wide API client. `getToken`/`onUnauthorized` are closures evaluated per
 * request, so importing this module on the server is safe (no storage access
 * happens until a request runs on the client).
 */
export const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  getToken: () => sessionStorage.getAccessToken(),
  onUnauthorized: () => sessionStorage.clear(),
});
