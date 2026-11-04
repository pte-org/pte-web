import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  refetchInterval?: unknown;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  options: undefined as unknown,
  invalidate: vi.fn(),
  api: {
    createOrder: vi.fn(), getOrder: vi.fn(), getSubscription: vi.fn(), getStudentQuota: vi.fn(),
    listOrders: vi.fn(), listPlans: vi.fn(), listSubscriptions: vi.fn(), previewStudentImport: vi.fn(),
    redeemLicenseCode: vi.fn(), submitApplication: vi.fn(),
  },
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/api-client")>()),
  ...hoisted.api,
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

import {
  useCreateOrder,
  useOrderQuery,
  useOrdersPage,
  useOrdersQuery,
  useRedeemLicense,
  useStudentImportPreview,
  useStudentQuotaQuery,
  useSubmitApplication,
  useSubscriptionQuery,
  useSubscriptionsQuery,
  useTenantPlansQuery,
} from "../../../../features/commercialization/api";
import {
  ORDERS_QUERY_KEY,
  STUDENT_QUOTA_QUERY_KEY,
  SUBSCRIPTIONS_QUERY_KEY,
  TENANT_PLANS_QUERY_KEY,
} from "../../../../features/commercialization/constants";

const opts = () => hoisted.options as Options;

beforeEach(() => {
  hoisted.invalidate.mockReset();
  Object.values(hoisted.api).forEach((fn) => fn.mockReset());
});

describe("plans, subscriptions and quota queries", () => {
  it("lists plans through the api client under the plans key", async () => {
    hoisted.api.listPlans.mockResolvedValue([{ publicId: "p1" }]);
    useTenantPlansQuery();

    await expect(opts().queryFn?.()).resolves.toEqual([{ publicId: "p1" }]);
    expect(opts().queryKey).toEqual(TENANT_PLANS_QUERY_KEY);
  });

  it("lists subscriptions and honours the enabled flag", async () => {
    hoisted.api.listSubscriptions.mockResolvedValue([]);
    useSubscriptionsQuery(false);

    await opts().queryFn?.();

    expect(opts().queryKey).toEqual(SUBSCRIPTIONS_QUERY_KEY);
    expect(opts().enabled).toBe(false);
    expect(hoisted.api.listSubscriptions).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("loads one subscription only when an id is present", async () => {
    hoisted.api.getSubscription.mockResolvedValue({});
    useSubscriptionQuery("sub-1");

    await opts().queryFn?.();

    expect(opts().queryKey).toEqual([...SUBSCRIPTIONS_QUERY_KEY, "detail", "sub-1"]);
    expect(opts().enabled).toBe(true);
    expect(hoisted.api.getSubscription).toHaveBeenCalledWith(hoisted.apiClient, "sub-1");

    useSubscriptionQuery(null);
    expect(opts().enabled).toBe(false);
  });

  it("reads the student quota", async () => {
    hoisted.api.getStudentQuota.mockResolvedValue({ used: 3 });
    useStudentQuotaQuery();

    await expect(opts().queryFn?.()).resolves.toEqual({ used: 3 });
    expect(opts().queryKey).toEqual(STUDENT_QUOTA_QUERY_KEY);
  });
});

describe("order queries", () => {
  it("useOrdersQuery returns the first 100 orders as a plain list", async () => {
    hoisted.api.listOrders.mockResolvedValue({ data: [{ publicId: "o1" }], total: 1 });
    useOrdersQuery();

    await expect(opts().queryFn?.()).resolves.toEqual([{ publicId: "o1" }]);
    expect(hoisted.api.listOrders).toHaveBeenCalledWith(hoisted.apiClient, 0, 100);
    expect(opts().enabled).toBe(true);
  });

  it("useOrdersQuery passes the caller polling interval through", () => {
    useOrdersQuery(true, 5_000);

    expect(opts().refetchInterval).toBe(5_000);
  });

  it("useOrdersPage keys by search, filters and paging with empty defaults", () => {
    useOrdersPage(2, 20);

    expect(opts().queryKey).toEqual([...ORDERS_QUERY_KEY, "", "", "", "", 2, 20]);
  });

  it("useOrdersPage sends only the filters that are set", async () => {
    hoisted.api.listOrders.mockResolvedValue({ data: [] });
    useOrdersPage(0, 10, "inv", { status: "PAID", createdFrom: "2026-01-01" });

    await opts().queryFn?.();

    expect(hoisted.api.listOrders).toHaveBeenCalledWith(hoisted.apiClient, 0, 10, "inv", {
      status: "PAID", createdFrom: "2026-01-01",
    });
  });

  it("useOrdersPage sends an empty filter object when none are set", async () => {
    hoisted.api.listOrders.mockResolvedValue({ data: [] });
    useOrdersPage(0, 10);

    await opts().queryFn?.();

    expect(hoisted.api.listOrders).toHaveBeenCalledWith(hoisted.apiClient, 0, 10, "", {});
  });

  it("useOrderQuery is disabled without an id", () => {
    useOrderQuery(null);

    expect(opts().enabled).toBe(false);
  });

  it("useOrderQuery polls every 10 seconds only while the order is PENDING", () => {
    useOrderQuery("o1");
    const interval = opts().refetchInterval as (query: { state: { data?: { status: string } } }) => unknown;

    expect(interval({ state: { data: { status: "PENDING" } } })).toBe(10_000);
    expect(interval({ state: { data: { status: "PAID" } } })).toBe(false);
    expect(interval({ state: {} })).toBe(false);
  });
});

describe("mutations", () => {
  it("useCreateOrder posts the payload and refreshes orders", async () => {
    hoisted.api.createOrder.mockResolvedValue({ publicId: "o1" });
    useCreateOrder();

    await opts().mutationFn?.({ planId: "p1" } as never);
    opts().onSuccess?.();

    expect(hoisted.api.createOrder).toHaveBeenCalledWith(hoisted.apiClient, { planId: "p1" });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ORDERS_QUERY_KEY });
  });

  it("useRedeemLicense sends only the code and refreshes subscriptions and quota", async () => {
    hoisted.api.redeemLicenseCode.mockResolvedValue({});
    useRedeemLicense();

    await opts().mutationFn?.({ code: "ABCD-EFGH" } as never);
    opts().onSuccess?.();

    expect(hoisted.api.redeemLicenseCode).toHaveBeenCalledWith(hoisted.apiClient, { code: "ABCD-EFGH" });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: STUDENT_QUOTA_QUERY_KEY });
  });

  it("useRedeemLicense refreshes nothing when the code is refused", async () => {
    hoisted.api.redeemLicenseCode.mockRejectedValue(new Error("invalid"));
    useRedeemLicense();

    await expect(opts().mutationFn?.({ code: "bad" } as never)).rejects.toThrow("invalid");
    expect(hoisted.invalidate).not.toHaveBeenCalled();
  });

  it("useStudentImportPreview asks for the quota after adding the given number", async () => {
    hoisted.api.previewStudentImport.mockResolvedValue({});
    useStudentImportPreview();

    await opts().mutationFn?.({ adding: 12 } as never);

    expect(hoisted.api.previewStudentImport).toHaveBeenCalledWith(hoisted.apiClient, { adding: 12 });
  });

  it("useSubmitApplication forwards the application unchanged", async () => {
    hoisted.api.submitApplication.mockResolvedValue(undefined);
    useSubmitApplication();

    await opts().mutationFn?.({ orgName: "Greenfield" } as never);

    expect(hoisted.api.submitApplication).toHaveBeenCalledWith(hoisted.apiClient, { orgName: "Greenfield" });
  });
});
