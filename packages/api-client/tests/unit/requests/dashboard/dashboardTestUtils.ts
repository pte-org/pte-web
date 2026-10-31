import { vi } from "vitest";
import { createApiClient, type ApiClient } from "../../../../src/client/client";

/** Shared helpers of the dashboard request tests: a real client over a mocked `fetch`. */

export const BASE_URL = "https://api.example.test";

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** The backend's success envelope around `data`. */
export function envelope(data: unknown): Response {
  return jsonResponse({ success: true, data, message: null });
}

export function clientWith(fetchFn: typeof fetch): ApiClient {
  return createApiClient({ baseUrl: BASE_URL, fetchFn });
}

export function requestedUrl(fetchFn: ReturnType<typeof vi.fn>, call = 0): string {
  return String(fetchFn.mock.calls[call][0]);
}

export function requestInit(fetchFn: ReturnType<typeof vi.fn>, call = 0): RequestInit {
  return fetchFn.mock.calls[call][1] as RequestInit;
}
