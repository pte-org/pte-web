import type { HostDashboardResponse } from "@pte/api-client";
import { QueryClient, QueryObserver, type UseQueryOptions } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  options: undefined as unknown,
  apiClient: { request: "stub-api-client" },
  getHostDashboard: vi.fn(),
  sentinel: { sentinel: true },
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/api-client")>()),
  getHostDashboard: hoisted.getHostDashboard,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQuery: (options: unknown) => {
    hoisted.options = options;
    return hoisted.sentinel;
  },
}));

import { ApiError } from "@pte/api-client";
import { useHostDashboard } from "./api";
import { HOST_DASHBOARD_QUERY_KEY, HOST_DASHBOARD_STALE_TIME_MS } from "./constants";
import { makeDashboard } from "./testing/fixtures";

type DashboardOptions = UseQueryOptions<HostDashboardResponse>;

/** The options object `useHostDashboard` hands to `useQuery`, captured without rendering React. */
const harness = {
  // Named like a hook because it calls one; `useQuery` is mocked, so no React renderer is involved.
  useCaptured(): DashboardOptions {
    useHostDashboard();
    return hoisted.options as DashboardOptions;
  },
};

const T0 = new Date("2026-10-13T03:00:00Z").getTime();
let client: QueryClient;

const observe = (): QueryObserver<HostDashboardResponse> =>
  new QueryObserver(client, harness.useCaptured() as ConstructorParameters<typeof QueryObserver<HostDashboardResponse>>[1]);

const settled = async (observer: QueryObserver<HostDashboardResponse>): Promise<void> => {
  await vi.waitFor(() => expect(observer.getCurrentResult().isFetching).toBe(false), { timeout: 800 });
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(T0);
  hoisted.getHostDashboard.mockReset();
  hoisted.getHostDashboard.mockResolvedValue(makeDashboard());
  client = new QueryClient();
});

afterEach(() => {
  client.clear();
  vi.useRealTimers();
});

describe("useHostDashboard query options", () => {
  it("passes the useQuery result straight through", () => {
    expect(useHostDashboard()).toBe(hoisted.sentinel);
  });

  it("uses the shared dashboard key so mutations elsewhere can invalidate it", () => {
    const options = harness.useCaptured();
    expect(options.queryKey).toEqual(["hostDashboard"]);
    expect(options.queryKey).toBe(HOST_DASHBOARD_QUERY_KEY);
  });

  it("keeps data fresh for 30 seconds, and does not retry a failure", () => {
    const options = harness.useCaptured();
    expect(HOST_DASHBOARD_STALE_TIME_MS).toBe(30_000);
    expect(options.staleTime).toBe(30_000);
    expect(options.retry).toBe(false);
  });

  it("fetches the aggregate with the shared client and no window argument", async () => {
    const options = harness.useCaptured();
    const queryFn = options.queryFn as () => Promise<HostDashboardResponse>;
    await queryFn();
    expect(hoisted.getHostDashboard).toHaveBeenCalledTimes(1);
    expect(hoisted.getHostDashboard).toHaveBeenCalledWith(hoisted.apiClient);
    expect(hoisted.getHostDashboard.mock.calls[0]).toHaveLength(1);
  });
});

describe("useHostDashboard request count", () => {
  it("sends exactly one request when the page mounts", async () => {
    const observer = observe();
    const unsubscribe = observer.subscribe(() => undefined);
    await settled(observer);
    expect(hoisted.getHostDashboard).toHaveBeenCalledTimes(1);
    expect(observer.getCurrentResult().data).toEqual(makeDashboard());
    unsubscribe();
  });

  it("shares one request between observers mounted together (strict-mode double mount)", async () => {
    const first = observe();
    const second = observe();
    const stops = [first.subscribe(() => undefined), second.subscribe(() => undefined)];
    await settled(first);
    await settled(second);
    expect(hoisted.getHostDashboard).toHaveBeenCalledTimes(1);
    stops.forEach((stop) => stop());
  });

  it("does not refetch on a remount inside the 30 second fresh window", async () => {
    const first = observe();
    const stopFirst = first.subscribe(() => undefined);
    await settled(first);
    stopFirst();

    vi.setSystemTime(T0 + 29_000);
    const second = observe();
    const stopSecond = second.subscribe(() => undefined);
    await settled(second);
    expect(hoisted.getHostDashboard).toHaveBeenCalledTimes(1);
    stopSecond();
  });

  it("refetches on a remount after the fresh window has passed", async () => {
    const first = observe();
    const stopFirst = first.subscribe(() => undefined);
    await settled(first);
    stopFirst();

    vi.setSystemTime(T0 + 31_000);
    const second = observe();
    const stopSecond = second.subscribe(() => undefined);
    await vi.waitFor(() => expect(hoisted.getHostDashboard).toHaveBeenCalledTimes(2), { timeout: 800 });
    stopSecond();
  });

  it("is refreshed by invalidating the shared key (what the mutations do), within the fresh window", async () => {
    const observer = observe();
    const stop = observer.subscribe(() => undefined);
    await settled(observer);
    expect(hoisted.getHostDashboard).toHaveBeenCalledTimes(1);
    await client.invalidateQueries({ queryKey: HOST_DASHBOARD_QUERY_KEY });
    expect(hoisted.getHostDashboard).toHaveBeenCalledTimes(2);
    stop();
  });

  it("surfaces a failure after a single attempt (no automatic retry delay)", async () => {
    hoisted.getHostDashboard.mockRejectedValue(new ApiError("server", 500, "boom"));
    const observer = observe();
    const stop = observer.subscribe(() => undefined);
    await vi.waitFor(() => expect(observer.getCurrentResult().isError).toBe(true), { timeout: 500 });
    expect(hoisted.getHostDashboard).toHaveBeenCalledTimes(1);
    expect(observer.getCurrentResult().error).toBeInstanceOf(ApiError);
    stop();
  });

  it("keeps the previous data when a refetch fails, so the grid stays visible", async () => {
    const observer = observe();
    const stop = observer.subscribe(() => undefined);
    await settled(observer);
    hoisted.getHostDashboard.mockRejectedValue(new ApiError("network", 0, "offline"));
    await client.invalidateQueries({ queryKey: HOST_DASHBOARD_QUERY_KEY });
    const result = observer.getCurrentResult();
    expect(result.isError).toBe(true);
    expect(result.data).toEqual(makeDashboard());
    stop();
  });
});
