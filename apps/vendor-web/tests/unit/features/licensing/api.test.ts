import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  options: undefined as unknown,
  invalidate: vi.fn(),
  grantQuota: vi.fn(),
  listQuotaHistory: vi.fn(),
  listTenants: vi.fn(),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/api-client")>()),
  grantQuota: hoisted.grantQuota,
  listQuotaHistory: hoisted.listQuotaHistory,
  listTenants: hoisted.listTenants,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQuery: (options: unknown) => {
    hoisted.options = options;
    return {};
  },
  useMutation: (options: unknown) => {
    hoisted.options = options;
    return {};
  },
  useQueryClient: () => ({ invalidateQueries: hoisted.invalidate }),
}));

import { licenseStats, useGrantQuota, useLicenses, useQuotaHistory } from "../../../../features/licensing/api";
import { LICENSES_QUERY_KEY, QUOTA_HISTORY_QUERY_KEY } from "../../../../features/licensing/constants";
import { TENANT_QUERY_KEY, TENANTS_QUERY_KEY } from "../../../../features/tenancy/constants";
import type { License } from "../../../../features/licensing/types";

const opts = () => hoisted.options as Options;

beforeEach(() => {
  hoisted.invalidate.mockReset();
  hoisted.grantQuota.mockReset();
  hoisted.listQuotaHistory.mockReset();
  hoisted.listTenants.mockReset();
});

const license = (over: Partial<License>): License => ({
  tenantId: "t", tenantName: "T", plan: "starter", status: "active", seatsTotal: 10, ...over,
});

describe("licenseStats", () => {
  it("counts totals, active, suspended and sums seats as strings", () => {
    const stats = licenseStats([
      license({ status: "active", seatsTotal: 10 }),
      license({ status: "active", seatsTotal: 25 }),
      license({ status: "suspended", seatsTotal: 5 }),
    ]);

    expect(stats).toEqual({ total: "3", active: "2", suspended: "1", totalSeats: "40" });
  });

  it("reports zeros for an empty list", () => {
    expect(licenseStats([])).toEqual({ total: "0", active: "0", suspended: "0", totalSeats: "0" });
  });
});

describe("useLicenses", () => {
  it("turns each tenant into a license: suspended tenants are suspended, everything else is active", async () => {
    hoisted.listTenants.mockResolvedValue([
      { publicId: "t1", name: "Alpha", packageName: "professional", status: "ACTIVE", studentLimit: 50 },
      { publicId: "t2", name: "Beta", packageName: "enterprise", status: "SUSPENDED", studentLimit: 500 },
      { publicId: "t3", name: "Gamma", packageName: "pilot-2025", status: "ONBOARDING", studentLimit: 5 },
    ]);
    useLicenses();

    const licenses = (await opts().queryFn?.()) as License[];

    expect(opts().queryKey).toEqual(LICENSES_QUERY_KEY);
    expect(licenses).toEqual([
      { tenantId: "t1", tenantName: "Alpha", plan: "professional", status: "active", seatsTotal: 50 },
      { tenantId: "t2", tenantName: "Beta", plan: "enterprise", status: "suspended", seatsTotal: 500 },
      { tenantId: "t3", tenantName: "Gamma", plan: "starter", status: "active", seatsTotal: 5 },
    ]);
  });

  it("returns an empty list when there are no tenants", async () => {
    hoisted.listTenants.mockResolvedValue([]);
    useLicenses();

    await expect(opts().queryFn?.()).resolves.toEqual([]);
  });
});

describe("useGrantQuota", () => {
  it("converts the amount to a number, trims the note and keeps the chosen package", async () => {
    hoisted.grantQuota.mockResolvedValue({});
    useGrantQuota("t1");

    await opts().mutationFn?.({ packageName: "professional", amount: "30", note: "  Contract 7  " } as never);

    expect(hoisted.grantQuota).toHaveBeenCalledWith(hoisted.apiClient, "t1", {
      packageName: "professional", amount: 30, note: "Contract 7",
    });
  });

  it("defaults the package to starter and a blank note to null", async () => {
    hoisted.grantQuota.mockResolvedValue({});
    useGrantQuota("t1");

    await opts().mutationFn?.({ packageName: "", amount: "5", note: "   " } as never);

    expect(hoisted.grantQuota).toHaveBeenCalledWith(hoisted.apiClient, "t1", {
      packageName: "starter", amount: 5, note: null,
    });
  });

  it("refreshes licenses, tenants, this tenant and its quota history after success", () => {
    useGrantQuota("t1");

    opts().onSuccess?.();

    const keys = hoisted.invalidate.mock.calls.map(([arg]) => (arg as { queryKey: unknown[] }).queryKey);
    expect(keys).toEqual([
      [...LICENSES_QUERY_KEY],
      [...TENANTS_QUERY_KEY],
      [...TENANT_QUERY_KEY, "t1"],
      [...QUOTA_HISTORY_QUERY_KEY, "t1"],
    ]);
  });

  it("refreshes nothing when the grant is refused", async () => {
    hoisted.grantQuota.mockRejectedValue(new Error("409"));
    useGrantQuota("t1");

    await expect(opts().mutationFn?.({ packageName: "starter", amount: "1", note: "" } as never)).rejects.toThrow("409");
    expect(hoisted.invalidate).not.toHaveBeenCalled();
  });
});

describe("useQuotaHistory", () => {
  it("loads history of one tenant", async () => {
    hoisted.listQuotaHistory.mockResolvedValue([]);
    useQuotaHistory("t1");

    await opts().queryFn?.();

    expect(opts().queryKey).toEqual([...QUOTA_HISTORY_QUERY_KEY, "t1"]);
    expect(opts().enabled).toBe(true);
    expect(hoisted.listQuotaHistory).toHaveBeenCalledWith(hoisted.apiClient, "t1");
  });

  it("stays disabled for an empty tenant id", () => {
    useQuotaHistory("");

    expect(opts().enabled).toBe(false);
  });
});
