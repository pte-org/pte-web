import { createSessionApiClient } from "@pte/ui";
import { API_BASE_URL } from "@/features/auth/constants";

/**
 * Session wiring (token/refresh-token getters, 401 handling) lives in
 * `@pte/ui`'s `createSessionApiClient` so it isn't duplicated with
 * `vendor-web`. Safe to import on the server — no storage access until a
 * request actually runs client-side.
 */
export const apiClient = createSessionApiClient(API_BASE_URL);
