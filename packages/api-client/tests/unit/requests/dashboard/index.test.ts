import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../../src/client/apiError";
import { createApiClient, type ApiClient } from "../../../../src/client/client";
import type { AdminDashboardResponse, HostDashboardResponse } from "../../../../src/types/dashboard";
import {
  DASHBOARD_ENDPOINTS,
  DASHBOARD_WINDOW_OPTIONS,
  DEFAULT_DASHBOARD_WINDOW_DAYS,
  getAdminDashboard,
  getHostDashboard,
} from "../../../../src/requests/dashboard/index";

const BASE_URL = "https://api.example.test";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    uploadDownload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const META = {
  generatedAt: "2026-10-13T03:00:00Z",
  windowDays: 30,
  windowStart: "2026-09-13T03:00:00Z",
  windowEnd: "2026-10-13T03:00:00Z",
  zone: "Asia/Ho_Chi_Minh",
} as const;

const TREND = { current: 12, previous: 0, changePct: null } as const;

describe("dashboard endpoint constants", () => {
  it("targets the versioned dashboard routes", () => {
    expect(DASHBOARD_ENDPOINTS.host).toBe("/api/v1/dashboard/host");
    expect(DASHBOARD_ENDPOINTS.admin).toBe("/api/v1/dashboard/admin");
  });

  it("exposes exactly the windows the backend accepts, with 30 as the default", () => {
    expect([...DASHBOARD_WINDOW_OPTIONS]).toEqual([7, 30, 90]);
    expect(DEFAULT_DASHBOARD_WINDOW_DAYS).toBe(30);
    expect(DASHBOARD_WINDOW_OPTIONS).toContain(DEFAULT_DASHBOARD_WINDOW_DAYS);
  });
});

describe("dashboard request paths", () => {
  it("omits the query string when no window is given", async () => {
    const client = fakeClient();

    await getHostDashboard(client);
    await getAdminDashboard(client);

    expect(client.request).toHaveBeenNthCalledWith(1, DASHBOARD_ENDPOINTS.host);
    expect(client.request).toHaveBeenNthCalledWith(2, DASHBOARD_ENDPOINTS.admin);
  });

  it.each([7, 30, 90] as const)("appends windowDays=%i for the host dashboard", async (windowDays) => {
    const client = fakeClient();

    await getHostDashboard(client, windowDays);

    expect(client.request).toHaveBeenCalledWith(
      `${DASHBOARD_ENDPOINTS.host}?windowDays=${windowDays}`,
    );
  });

  it.each([7, 30, 90] as const)("appends windowDays=%i for the admin dashboard", async (windowDays) => {
    const client = fakeClient();

    await getAdminDashboard(client, windowDays);

    expect(client.request).toHaveBeenCalledWith(
      `${DASHBOARD_ENDPOINTS.admin}?windowDays=${windowDays}`,
    );
  });

  it("issues a plain GET with no request body", async () => {
    const client = fakeClient();

    await getHostDashboard(client, 7);

    expect(client.request.mock.calls[0]).toHaveLength(1);
  });
});

describe("dashboard requests through the real client", () => {
  it("unwraps the ApiResponse envelope of the host dashboard and keeps section states intact", async () => {
    const payload: HostDashboardResponse = {
      meta: META,
      learners: {
        status: "OK",
        data: {
          total: 120,
          active: 110,
          suspended: 10,
          newInWindow: TREND,
          activeLearners: { current: 40, previous: 20, changePct: 100 },
          unassigned: 3,
        },
      },
      quota: { status: "OK", data: { used: 120, limit: 200, remaining: 80 } },
      academics: { status: "ERROR", data: null },
      staff: { status: "OK", data: { proctors: 4, examiners: 6 } },
      exams: {
        status: "OK",
        data: {
          byStatus: {
            DRAFT: 1,
            READY: 0,
            SCHEDULED: 2,
            OPEN: 1,
            CLOSED: 5,
            CANCELLED: 0,
          },
          created: TREND,
          upcoming: [
            {
              publicId: "11111111-1111-1111-1111-111111111111",
              name: "Mock test 1",
              status: "SCHEDULED",
              opensAt: "2026-10-20T01:00:00Z",
              closesAt: "2026-10-20T03:00:00Z",
              enrolled: 30,
              capacity: null,
            },
          ],
        },
      },
      attempts: {
        status: "OK",
        data: {
          submitted: TREND,
          inProgressNow: 2,
          monthlySubmitted: [{ month: "2026-10", count: 7, partial: true }],
        },
      },
      grading: {
        status: "OK",
        data: {
          pendingAnswers: 5,
          aiScoringAnswers: 1,
          failedAnswers: 0,
          closedSessionsAwaitingFinalisation: 1,
          reportsAwaitingPublication: 2,
        },
      },
      subscription: {
        status: "OK",
        data: { current: [], nearestExpiryAt: null, daysToExpiry: null, expiringSoon: false },
      },
      billing: { status: "OK", data: { pendingOrders: 0 } },
      support: { status: "OK", data: { open: 1, inProgress: 0, resolvedAwaitingClose: 0 } },
      recentActivity: { status: "FORBIDDEN", data: null },
    };
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({ success: true, data: payload, message: null }),
    );
    const client = createApiClient({ baseUrl: BASE_URL, fetchFn });

    const result = await getHostDashboard(client, 30);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE_URL}/api/v1/dashboard/host?windowDays=30`);
    expect(result).toEqual(payload);
    expect(result.academics).toEqual({ status: "ERROR", data: null });
    expect(result.recentActivity.status).toBe("FORBIDDEN");
    expect(result.learners.data?.newInWindow.changePct).toBeNull();
  });

  it("unwraps the admin dashboard and keeps whole-VND amounts and forbidden sections as sent", async () => {
    const payload: AdminDashboardResponse = {
      meta: META,
      tenants: { status: "FORBIDDEN", data: null },
      learners: { status: "FORBIDDEN", data: null },
      recentTenants: { status: "FORBIDDEN", data: null },
      applications: { status: "FORBIDDEN", data: null },
      licenses: { status: "FORBIDDEN", data: null },
      subscriptions: { status: "FORBIDDEN", data: null },
      plans: { status: "FORBIDDEN", data: null },
      support: { status: "FORBIDDEN", data: null },
      revenue: {
        status: "OK",
        data: {
          source: "ONLINE_ORDERS",
          paidOrders: { current: 3, previous: 2, changePct: 50 },
          currencies: [
            {
              currency: "VND",
              current: 1500000,
              previous: 0,
              changePct: null,
              paidOrders: { current: 3, previous: 2, changePct: 50 },
              monthly: [{ month: "2026-10", amount: 1500000, partial: true }],
            },
          ],
        },
      },
      questionBank: {
        status: "OK",
        data: {
          total: 10,
          byStatus: { DRAFT: 1, PENDING_APPROVAL: 2, APPROVED: 6, ARCHIVED: 1 },
          bySection: { LISTENING: 2, SPEAKING: 3, READING: 4, WRITING: 1 },
          byPool: { EXAM: 8, PRACTICE: 2 },
          approvedByPool: { EXAM: 5, PRACTICE: 1 },
          createdInWindow: TREND,
        },
      },
    };
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: payload }));
    const client = createApiClient({ baseUrl: BASE_URL, fetchFn });

    const result = await getAdminDashboard(client);

    expect(fetchFn.mock.calls[0][0]).toBe(`${BASE_URL}/api/v1/dashboard/admin`);
    expect(result).toEqual(payload);
    expect(result.tenants.data).toBeNull();
    expect(result.revenue.data?.currencies[0].current).toBe(1500000);
  });

  it("rejects an unsupported window with a validation ApiError carrying the backend code", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse(
        { success: false, data: null, message: "Invalid window", code: "INVALID_DASHBOARD_WINDOW" },
        400,
      ),
    );
    const client = createApiClient({ baseUrl: BASE_URL, fetchFn });

    const error = await getHostDashboard(client, 14 as unknown as 30).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "validation", status: 400, code: "INVALID_DASHBOARD_WINDOW" });
  });

  it("surfaces a 403 for the wrong role as a forbidden ApiError", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({ success: false, data: null, message: "Access denied" }, 403),
    );
    const client = createApiClient({ baseUrl: BASE_URL, fetchFn });

    const error = await getAdminDashboard(client).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "forbidden", status: 403 });
  });

  it("surfaces a network failure as a network ApiError", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const client = createApiClient({ baseUrl: BASE_URL, fetchFn });

    const error = await getHostDashboard(client).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "network", status: 0 });
  });

  it("propagates the rejection of the underlying client unchanged", async () => {
    const client = fakeClient();
    const failure = new Error("boom");
    client.request.mockRejectedValue(failure);

    await expect(getAdminDashboard(client, 90)).rejects.toBe(failure);
  });
});
