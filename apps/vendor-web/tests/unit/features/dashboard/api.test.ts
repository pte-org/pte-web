import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queryOptions: undefined as unknown,
  getAdminDashboard: vi.fn(),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: { client: "test-client" } }));
vi.mock("@pte/api-client", () => ({
  getAdminDashboard: mocks.getAdminDashboard,
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => {
    mocks.queryOptions = options;
    return { data: undefined, isLoading: false };
  },
}));

import { useAdminDashboard } from "../../../../features/dashboard/api";
import { ADMIN_DASHBOARD_QUERY_KEY, ADMIN_DASHBOARD_STALE_TIME_MS } from "../../../../features/dashboard/constants";

describe("useAdminDashboard", () => {
  it("configures query with correct queryKey, staleTime, and no auto-retry", () => {
    useAdminDashboard();

    const options = mocks.queryOptions as {
      queryKey: readonly string[];
      staleTime: number;
      retry: boolean;
      queryFn: () => Promise<unknown>;
    };

    expect(options.queryKey).toEqual(ADMIN_DASHBOARD_QUERY_KEY);
    expect(options.staleTime).toBe(ADMIN_DASHBOARD_STALE_TIME_MS);
    expect(options.retry).toBe(false);

    options.queryFn();
    expect(mocks.getAdminDashboard).toHaveBeenCalledWith({ client: "test-client" });
  });
});
