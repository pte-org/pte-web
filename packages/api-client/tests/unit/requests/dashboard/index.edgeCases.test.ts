import { describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  ADMIN_DASHBOARD_ERROR,
  ADMIN_DASHBOARD_FORBIDDEN,
  ADMIN_DASHBOARD_OK,
  HOST_DASHBOARD_ERROR,
  HOST_DASHBOARD_FORBIDDEN,
  HOST_DASHBOARD_MIXED,
  HOST_DASHBOARD_OK,
} from "../../types/dashboard/fixtures";
import type {
  AdminDashboardResponse,
  DashboardWindowDays,
  HostDashboardResponse,
} from "../../../../src/types/dashboard";
import * as requestsBarrel from "../../../../src/requests/index";
import * as packageRoot from "../../../../src/index";
import { BASE_URL, clientWith, envelope, jsonResponse, requestInit, requestedUrl } from "./dashboardTestUtils";
import {
  DASHBOARD_ENDPOINTS,
  DASHBOARD_WINDOW_OPTIONS,
  DEFAULT_DASHBOARD_WINDOW_DAYS,
  getAdminDashboard,
  getHostDashboard,
} from "../../../../src/requests/dashboard/index";

/**
 * Edge cases of the dashboard requests that `index.test.ts` does not cover: every window on both
 * endpoints, values the types forbid and the envelope with section states. Error and session paths
 * are in `index.errors.test.ts`. No backend and no network are involved.
 */

const WINDOWS = [7, 30, 90] as const;

const RETIRED_SERVICE_SEGMENTS = [
  "iam",
  "authoring",
  "scheduling",
  "exam-delivery",
  "proctor",
  "notification",
  "media",
];
describe("dashboard endpoint constants follow the endpoints.test.ts rules", () => {
  const paths = Object.entries(DASHBOARD_ENDPOINTS);

  it.each(paths)("%s is a versioned absolute path", (_name, path) => {
    expect(path.startsWith("/api/v1/")).toBe(true);
    expect(path.endsWith("/")).toBe(false);
    expect(path).not.toMatch(/[?#\s]/);
  });

  it.each(paths)("%s carries no retired service segment", (_name, path) => {
    const [, , , firstSegment] = path.split("/");
    expect(RETIRED_SERVICE_SEGMENTS).not.toContain(firstSegment);
  });

  it("keeps the host and admin routes distinct", () => {
    expect(DASHBOARD_ENDPOINTS.host).not.toBe(DASHBOARD_ENDPOINTS.admin);
  });

  it("is reachable through the requests barrel and the package root with the same identity", () => {
    expect(requestsBarrel.DASHBOARD_ENDPOINTS).toBe(DASHBOARD_ENDPOINTS);
    expect(packageRoot.DASHBOARD_ENDPOINTS).toBe(DASHBOARD_ENDPOINTS);
    expect(requestsBarrel.getHostDashboard).toBe(getHostDashboard);
    expect(packageRoot.getAdminDashboard).toBe(getAdminDashboard);
    expect(packageRoot.DASHBOARD_WINDOW_OPTIONS).toBe(DASHBOARD_WINDOW_OPTIONS);
  });

  it("uses a default window that is one of the offered windows", () => {
    expect(DASHBOARD_WINDOW_OPTIONS).toContain(DEFAULT_DASHBOARD_WINDOW_DAYS);
  });
});

describe("window parameter", () => {
  const CALLS = [
    ["host", getHostDashboard, DASHBOARD_ENDPOINTS.host],
    ["admin", getAdminDashboard, DASHBOARD_ENDPOINTS.admin],
  ] as const;

  describe.each(CALLS)("%s dashboard through the real client", (_name, call, path) => {
    it.each(WINDOWS)("requests windowDays=%i as a plain GET without a body", async (windowDays) => {
      const fetchFn = vi.fn().mockResolvedValue(envelope({}));

      await call(clientWith(fetchFn), windowDays);

      expect(requestedUrl(fetchFn)).toBe(`${BASE_URL}${path}?windowDays=${windowDays}`);
      expect(requestInit(fetchFn).method ?? "GET").toBe("GET");
      expect(requestInit(fetchFn).body).toBeUndefined();
    });

    it("omits the query entirely when the window is undefined", async () => {
      const fetchFn = vi.fn().mockResolvedValue(envelope({}));

      await call(clientWith(fetchFn), undefined);

      expect(requestedUrl(fetchFn)).toBe(`${BASE_URL}${path}`);
      expect(requestedUrl(fetchFn)).not.toContain("?");
    });

    it("never repeats the /api/v1 prefix when joined to the origin-only base URL", async () => {
      const fetchFn = vi.fn().mockResolvedValue(envelope({}));

      await call(clientWith(fetchFn), 90);

      const url = requestedUrl(fetchFn);
      expect(url.startsWith(`${BASE_URL}/api/v1/dashboard/`)).toBe(true);
      expect(url.split("/api/v1")).toHaveLength(2);
    });

    it("does not leak a previous call's window into the next call", async () => {
      const fetchFn = vi.fn().mockImplementation(async () => envelope({}));
      const client = clientWith(fetchFn);

      await call(client, 7);
      await call(client);
      await call(client, 90);

      expect(fetchFn.mock.calls.map(([url]) => String(url).replace(BASE_URL, ""))).toEqual([
        `${path}?windowDays=7`,
        path,
        `${path}?windowDays=90`,
      ]);
    });
  });

  it("forwards values the types forbid verbatim instead of coercing, defaulting or dropping them", async () => {
    // Runtime values reach the function only through a cast; the backend answers 400 for them, so
    // the client must neither fix them up (14 -> 30) nor hide them (0/null -> omitted).
    const invalid: [unknown, string][] = [
      [14, "14"],
      [0, "0"],
      [-7, "-7"],
      [Number.NaN, "NaN"],
      [null, "null"],
      ["30", "30"],
    ];
    for (const [value, serialised] of invalid) {
      const fetchFn = vi.fn().mockResolvedValue(envelope({}));

      await getHostDashboard(clientWith(fetchFn), value as DashboardWindowDays);

      expect(requestedUrl(fetchFn)).toBe(`${BASE_URL}${DASHBOARD_ENDPOINTS.host}?windowDays=${serialised}`);
    }
  });

  it("only offers the supported windows in the exported options", () => {
    expect([...DASHBOARD_WINDOW_OPTIONS]).toEqual([...WINDOWS]);
  });
});

describe("compile-time guarantees of the request functions", () => {
  // Enforced by `tsc` (this package's typecheck includes test files); no-ops at runtime.
  it("accepts only 7, 30, 90 or no window and returns the typed payload", () => {
    expectTypeOf(getHostDashboard).parameter(1).toEqualTypeOf<DashboardWindowDays | undefined>();
    expectTypeOf(getAdminDashboard).parameter(1).toEqualTypeOf<DashboardWindowDays | undefined>();
    expectTypeOf(getHostDashboard).returns.resolves.toEqualTypeOf<HostDashboardResponse>();
    expectTypeOf(getAdminDashboard).returns.resolves.toEqualTypeOf<AdminDashboardResponse>();
    expectTypeOf(DASHBOARD_WINDOW_OPTIONS).toEqualTypeOf<readonly [7, 30, 90]>();
    expectTypeOf(DEFAULT_DASHBOARD_WINDOW_DAYS).toEqualTypeOf<DashboardWindowDays>();
  });

  it("rejects an unsupported or non-numeric window at compile time", () => {
    const client = clientWith(vi.fn().mockResolvedValue(envelope({})));
    const neverAwaited: Promise<unknown>[] = [
      // @ts-expect-error 14 is not a supported window (the backend rejects it with 400)
      getHostDashboard(client, 14),
      // @ts-expect-error 0 is not a supported window
      getAdminDashboard(client, 0),
      // @ts-expect-error a window is a number, not a numeric string
      getHostDashboard(client, "30"),
      // @ts-expect-error null is not "no window"; omit the argument instead
      getAdminDashboard(client, null),
      // @ts-expect-error the window parameter is not an options bag
      getHostDashboard(client, { windowDays: 30 }),
    ];

    expect(neverAwaited).toHaveLength(5);
  });
});

describe("envelope unwrap keeps section states untouched", () => {
  const CASES: [string, "host" | "admin", HostDashboardResponse | AdminDashboardResponse][] = [
    ["host, all sections OK", "host", HOST_DASHBOARD_OK],
    ["host, every section FORBIDDEN", "host", HOST_DASHBOARD_FORBIDDEN],
    ["host, every section ERROR", "host", HOST_DASHBOARD_ERROR],
    ["host, mixed OK/ERROR/FORBIDDEN", "host", HOST_DASHBOARD_MIXED],
    ["admin, all sections OK", "admin", ADMIN_DASHBOARD_OK],
    ["admin, academic role (only questionBank visible)", "admin", ADMIN_DASHBOARD_FORBIDDEN],
    ["admin, every section ERROR", "admin", ADMIN_DASHBOARD_ERROR],
  ];

  it.each(CASES)("returns %s exactly as sent, with HTTP 200 and no throw", async (_label, which, payload) => {
    const fetchFn = vi.fn().mockResolvedValue(envelope(payload));
    const client = clientWith(fetchFn);

    const result = which === "host" ? await getHostDashboard(client) : await getAdminDashboard(client);

    expect(result).toStrictEqual(payload);
  });

  it("does not treat a data.meta object as the envelope's pagination meta", async () => {
    const fetchFn = vi.fn().mockResolvedValue(envelope(HOST_DASHBOARD_OK));

    const result = await getHostDashboard(clientWith(fetchFn));

    expect(result.meta).toStrictEqual(HOST_DASHBOARD_OK.meta);
    expect(result).not.toHaveProperty("data");
  });

  it("ignores extra envelope fields (requestId, timestamp, userMessage)", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      jsonResponse({
        success: true,
        data: ADMIN_DASHBOARD_OK,
        message: null,
        requestId: "req-1",
        timestamp: "2026-10-13T03:00:00Z",
        userMessage: null,
      }),
    );

    expect(await getAdminDashboard(clientWith(fetchFn))).toStrictEqual(ADMIN_DASHBOARD_OK);
  });

  it("tolerates a backend that adds a section later (additive evolution)", async () => {
    const withNewSection = { ...HOST_DASHBOARD_OK, mapSection: { status: "OK", data: { provinces: [] } } };
    const fetchFn = vi.fn().mockResolvedValue(envelope(withNewSection));

    const result = await getHostDashboard(clientWith(fetchFn));

    expect(result.learners).toStrictEqual(HOST_DASHBOARD_OK.learners);
    expect(result).toHaveProperty("mapSection");
  });
});


