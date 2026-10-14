import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../client/apiError";
import { createApiClient } from "../../client/client";
import { ADMIN_DASHBOARD_OK } from "../../types/dashboard/fixtures";
import type { DashboardWindowDays } from "../../types/dashboard";
import { BASE_URL, clientWith, envelope, jsonResponse, requestInit, requestedUrl } from "./dashboardTestUtils";
import { DASHBOARD_ENDPOINTS, getAdminDashboard, getHostDashboard } from "./index";

/** Error and session paths of the dashboard requests through the real client; no network involved. */
describe("error propagation through the real client", () => {
  async function failure(call: () => Promise<unknown>): Promise<ApiError> {
    const error = await call().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError; // asserted by the line above
  }

  it("maps 400 INVALID_DASHBOARD_WINDOW (code in its own field) to a validation error", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({ success: false, data: null, message: "Invalid window", code: "INVALID_DASHBOARD_WINDOW" }, 400),
    );

    const error = await failure(() => getHostDashboard(clientWith(fetchFn), 14 as DashboardWindowDays));

    expect(error).toMatchObject({ kind: "validation", status: 400, code: "INVALID_DASHBOARD_WINDOW" });
  });

  it("reads the code from the message when the backend sends it there", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({ success: false, data: null, message: "INVALID_DASHBOARD_WINDOW" }, 400),
    );

    const error = await failure(() => getAdminDashboard(clientWith(fetchFn), 14 as DashboardWindowDays));

    expect(error).toMatchObject({ kind: "validation", status: 400, code: "INVALID_DASHBOARD_WINDOW" });
  });

  it("maps 403 on both dashboards (wrong role or a tenant-less host token) to forbidden", async () => {
    for (const call of [getHostDashboard, getAdminDashboard]) {
      const fetchFn = vi.fn().mockImplementation(async () =>
        jsonResponse({ success: false, data: null, message: "ACCESS_DENIED" }, 403),
      );

      const error = await failure(() => call(clientWith(fetchFn)));

      expect(error).toMatchObject({ kind: "forbidden", status: 403, code: "ACCESS_DENIED" });
    }
  });

  it("maps 401 without a refresh to unauthorized and signals the session owner exactly once", async () => {
    const onUnauthorized = vi.fn();
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ success: false, data: null, message: "expired" }, 401));
    const client = createApiClient({ baseUrl: BASE_URL, fetchFn, onUnauthorized });

    const error = await failure(() => getHostDashboard(client, 30));

    expect(error).toMatchObject({ kind: "unauthorized", status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("refreshes an expired token once and retries the same URL with the new Bearer token", async () => {
    let token = "stale-token";
    const refreshAccessToken = vi
      .fn()
      .mockResolvedValue({ accessToken: "fresh-token", refreshToken: "refresh-2", expiresInSeconds: 900 });
    const onUnauthorized = vi.fn();
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: false, data: null, message: "expired" }, 401))
      .mockResolvedValueOnce(envelope(ADMIN_DASHBOARD_OK));
    const client = createApiClient({
      baseUrl: BASE_URL,
      fetchFn,
      getToken: () => token,
      getRefreshToken: () => "refresh-1",
      refreshAccessToken,
      onTokenRefreshed: (tokens) => {
        token = tokens.accessToken;
      },
      onUnauthorized,
    });

    const result = await getAdminDashboard(client, 7);

    expect(result).toStrictEqual(ADMIN_DASHBOARD_OK);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(requestedUrl(fetchFn, 1)).toBe(requestedUrl(fetchFn, 0));
    expect(requestedUrl(fetchFn, 1)).toBe(`${BASE_URL}${DASHBOARD_ENDPOINTS.admin}?windowDays=7`);
    expect((requestInit(fetchFn, 0).headers as Headers).get("Authorization")).toBe("Bearer stale-token");
    expect((requestInit(fetchFn, 1).headers as Headers).get("Authorization")).toBe("Bearer fresh-token");
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("surfaces unauthorized when the refresh itself fails", async () => {
    const onUnauthorized = vi.fn();
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ success: false, data: null, message: "expired" }, 401));
    const client = createApiClient({
      baseUrl: BASE_URL,
      fetchFn,
      getRefreshToken: () => "refresh-1",
      refreshAccessToken: vi.fn().mockRejectedValue(new Error("refresh rejected")),
      onUnauthorized,
    });

    const error = await failure(() => getHostDashboard(client));

    expect(error).toMatchObject({ kind: "unauthorized", status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("maps 500 and a non-JSON gateway error to a server error with the default message", async () => {
    const serverError = clientWith(
      vi.fn().mockResolvedValue(jsonResponse({ success: false, data: null, message: "boom" }, 500)),
    );
    const gatewayError = clientWith(
      vi.fn().mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 })),
    );

    expect(await failure(() => getHostDashboard(serverError))).toMatchObject({ kind: "server", status: 500 });
    expect(await failure(() => getAdminDashboard(gatewayError))).toMatchObject({
      kind: "server",
      status: 502,
      message: "The server encountered a problem. Please try again later.",
    });
  });

  it("maps a rejected fetch to a network error with status 0 and keeps the cause", async () => {
    const cause = new TypeError("Failed to fetch");
    const client = clientWith(vi.fn().mockRejectedValue(cause));

    const error = await failure(() => getAdminDashboard(client, 90));

    expect(error).toMatchObject({ kind: "network", status: 0 });
    expect(error.details).toBe(cause);
  });

  it("sends the Bearer token of the signed-in caller on both dashboards", async () => {
    for (const call of [getHostDashboard, getAdminDashboard]) {
      const fetchFn = vi.fn().mockImplementation(async () => envelope({}));
      const client = createApiClient({ baseUrl: BASE_URL, fetchFn, getToken: () => "access-1" });

      await call(client, 30);

      expect((requestInit(fetchFn).headers as Headers).get("Authorization")).toBe("Bearer access-1");
    }
  });
});

