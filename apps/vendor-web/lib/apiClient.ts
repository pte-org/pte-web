import { createSessionApiClient } from "@aptis/ui";
import { API_BASE_URL } from "@/features/auth/constants";

/**
 * App-wide API client — session wiring (token/refresh-token getters, 401
 * handling) lives in `@aptis/ui`'s `createSessionApiClient` so it isn't
 * duplicated between this app and `tenant-web`. Safe to import on the
 * server: no storage access happens until a request actually runs on the
 * client.
 */
export const apiClient = createSessionApiClient(API_BASE_URL);
