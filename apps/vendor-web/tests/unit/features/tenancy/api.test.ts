import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: (result: never) => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  options: undefined as unknown,
  invalidate: vi.fn(),
  setQueryData: vi.fn(),
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", () => new Proxy({}, {
  has: () => true,
  get: (_target, name: string) => (name === "__esModule" ? false : name === "then" ? undefined : hoisted.api[name]),
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
  useQueryClient: () => ({ invalidateQueries: hoisted.invalidate, setQueryData: hoisted.setQueryData }),
}));

import * as tenancyApi from "../../../../features/tenancy/api";
import {
  LOGIN_ACCOUNT_QUERY_KEY,
  SYSTEM_HEALTH_QUERY_KEY,
  TENANT_QUERY_KEY,
  TENANT_SUSPENSION_IMPACT_QUERY_KEY,
  TENANTS_QUERY_KEY,
} from "../../../../features/tenancy/constants";

const opts = () => hoisted.options as Options;
const { api } = hoisted;

beforeEach(() => {
  hoisted.invalidate.mockReset();
  hoisted.setQueryData.mockReset();
  Object.keys(api).forEach((name) => api[name].mockReset());
});

const tenantResponse = (over: Record<string, unknown> = {}) => ({
  publicId: "t1", code: "greenfield", name: "Trường Hoa Sen Cơ sở", organizationType: "School", taxCode: "0312345678",
  status: "ACTIVE", suspendedUntil: null, studentLimit: 50, packageName: "professional", logoUrl: null, primaryColor: null, ...over,
});

describe("tenant list and mapping", () => {
  it("maps a tenant response to the display model with a slug without accents", async () => {
    api.listTenants.mockResolvedValue([tenantResponse()]);
    tenancyApi.useTenants();

    const [tenant] = (await opts().queryFn?.()) as Array<Record<string, unknown>>;

    expect(opts().queryKey).toEqual(TENANTS_QUERY_KEY);
    expect(tenant).toMatchObject({ id: "t1", code: "greenfield", slug: "truong-hoa-sen-co-so", status: "active", seatsTotal: 50, plan: "professional", seatsUsed: 0 });
  });

  it("falls back to the public id as the slug when the name has no usable characters", async () => {
    api.listTenants.mockResolvedValue([tenantResponse({ name: "###" })]);
    tenancyApi.useTenants();

    const [tenant] = (await opts().queryFn?.()) as Array<Record<string, unknown>>;

    expect(tenant.slug).toBe("t1");
  });

  it("shows a suspended tenant as suspended and keeps the end of the suspension", async () => {
    api.listTenants.mockResolvedValue([tenantResponse({ status: "SUSPENDED", suspendedUntil: "2026-12-01T00:00:00Z" })]);
    tenancyApi.useTenants();

    const [tenant] = (await opts().queryFn?.()) as Array<Record<string, unknown>>;

    expect(tenant).toMatchObject({ status: "suspended", suspendedUntil: "2026-12-01T00:00:00Z" });
  });

  it("treats unknown or missing packages as starter and keeps enterprise", async () => {
    api.listTenants.mockResolvedValue([tenantResponse({ packageName: null }), tenantResponse({ packageName: "pilot" }), tenantResponse({ packageName: "enterprise" })]);
    tenancyApi.useTenants();

    const tenants = (await opts().queryFn?.()) as Array<{ plan: string }>;

    expect(tenants.map((t) => t.plan)).toEqual(["starter", "starter", "enterprise"]);
  });

  it("system health starts as operational with no errors", async () => {
    tenancyApi.useSystemHealth();

    await expect(opts().queryFn?.()).resolves.toEqual({ apiErrorRate: "0%", aiQueueDepth: 0, deliveryErrors: 0, operational: true });
    expect(opts().queryKey).toEqual(SYSTEM_HEALTH_QUERY_KEY);
  });
});

describe("create tenant", () => {
  it("trims the input, onboards and reads the organization back", async () => {
    api.onboardOrganization.mockResolvedValue({ publicId: "t9" });
    api.getTenant.mockResolvedValue(tenantResponse({ publicId: "t9" }));
    tenancyApi.useCreateTenant();

    const tenant = await opts().mutationFn?.({ code: " code ", name: " Name ", organizationType: "School", taxCode: " 123 ", hostEmail: " a@b.vn " } as never);

    expect(api.onboardOrganization).toHaveBeenCalledWith(hoisted.apiClient, { code: "code", name: "Name", organizationType: "School", taxCode: "123", hostEmail: "a@b.vn" });
    expect(api.getTenant).toHaveBeenCalledWith(hoisted.apiClient, "t9");
    expect(tenant).toMatchObject({ id: "t9" });
  });

  it("puts the new tenant first in the cached list without duplicates, then refreshes", () => {
    tenancyApi.useCreateTenant();

    opts().onSuccess?.({ id: "t2" } as never);

    const update = hoisted.setQueryData.mock.calls[0][1] as (prev?: Array<{ id: string }>) => Array<{ id: string }>;
    expect(hoisted.setQueryData.mock.calls[0][0]).toEqual(TENANTS_QUERY_KEY);
    expect(update([{ id: "t1" }, { id: "t2" }])).toEqual([{ id: "t2" }, { id: "t1" }]);
    expect(update(undefined)).toEqual([{ id: "t2" }]);
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: TENANTS_QUERY_KEY });
  });
});

describe("suspend, reactivate and impact", () => {
  it("suspends for a number of days with the impact digest the Admin confirmed", async () => {
    api.suspendTenant.mockResolvedValue(tenantResponse({ status: "SUSPENDED" }));
    tenancyApi.useSuspendTenant();

    const tenant = await opts().mutationFn?.({ publicId: "t1", days: 7, impactDigest: "digest" } as never);

    expect(api.suspendTenant).toHaveBeenCalledWith(hoisted.apiClient, "t1", { days: 7, impactDigest: "digest" });
    expect(tenant).toMatchObject({ status: "suspended" });
  });

  it("sends days as null for an open-ended suspension", async () => {
    api.suspendTenant.mockResolvedValue(tenantResponse());
    tenancyApi.useSuspendTenant();

    await opts().mutationFn?.({ publicId: "t1", impactDigest: "d" } as never);

    expect(api.suspendTenant).toHaveBeenCalledWith(hoisted.apiClient, "t1", { days: null, impactDigest: "d" });
  });

  it("replaces only the changed tenant in the cached list after suspend and reactivate", async () => {
    api.reactivateTenant.mockResolvedValue(tenantResponse());
    for (const hook of [tenancyApi.useSuspendTenant, tenancyApi.useReactivateTenant]) {
      hoisted.setQueryData.mockReset();
      hoisted.invalidate.mockReset();
      hook();
      opts().onSuccess?.({ id: "t2", name: "new" } as never);
      const update = hoisted.setQueryData.mock.calls[0][1] as (prev?: Array<{ id: string; name: string }>) => unknown;
      expect(update([{ id: "t1", name: "a" }, { id: "t2", name: "old" }])).toEqual([{ id: "t1", name: "a" }, { id: "t2", name: "new" }]);
      expect(update(undefined)).toEqual([]);
      expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: TENANTS_QUERY_KEY });
    }
    tenancyApi.useReactivateTenant();
    await opts().mutationFn?.("t1" as never);
    expect(api.reactivateTenant).toHaveBeenCalledWith(hoisted.apiClient, "t1");
  });

  it("suspension impact is keyed by tenant and number of days and is disabled without an id", async () => {
    api.getTenantSuspensionImpact.mockResolvedValue({});
    tenancyApi.useTenantSuspensionImpact("t1", 3);
    await opts().queryFn?.();
    expect(opts().queryKey).toEqual([...TENANT_SUSPENSION_IMPACT_QUERY_KEY, "t1", 3]);
    expect(api.getTenantSuspensionImpact).toHaveBeenCalledWith(hoisted.apiClient, "t1", 3);

    tenancyApi.useTenantSuspensionImpact("t1");
    expect(opts().queryKey).toEqual([...TENANT_SUSPENSION_IMPACT_QUERY_KEY, "t1", "default"]);

    tenancyApi.useTenantSuspensionImpact("", undefined, true);
    expect(opts().enabled).toBe(false);
    tenancyApi.useTenantSuspensionImpact("t1", undefined, false);
    expect(opts().enabled).toBe(false);
  });
});

describe("single tenant and branding", () => {
  it("loads one tenant and is disabled for an empty id", async () => {
    api.getTenant.mockResolvedValue(tenantResponse());
    tenancyApi.useTenant("t1");
    await expect(opts().queryFn?.()).resolves.toMatchObject({ id: "t1" });
    expect(opts().queryKey).toEqual([...TENANT_QUERY_KEY, "t1"]);

    tenancyApi.useTenant("");
    expect(opts().enabled).toBe(false);
  });

  it("branding sends null for blank values and trims the others", async () => {
    api.updateTenantBranding.mockResolvedValue(tenantResponse({ logoUrl: "u" }));
    tenancyApi.useUpdateBranding("t1");

    await opts().mutationFn?.({ logoUrl: "  ", primaryColor: " #112233 " } as never);

    expect(api.updateTenantBranding).toHaveBeenCalledWith(hoisted.apiClient, "t1", { logoUrl: null, primaryColor: "#112233" });
  });

  it("branding refreshes the single tenant cache and the list", () => {
    tenancyApi.useUpdateBranding("t1");

    opts().onSuccess?.({ id: "t1" } as never);

    expect(hoisted.setQueryData.mock.calls[0]).toEqual([[...TENANT_QUERY_KEY, "t1"], { id: "t1" }]);
    expect(hoisted.setQueryData.mock.calls[1][0]).toEqual(TENANTS_QUERY_KEY);
  });
});

describe("login account of an organization", () => {
  const user = (id: string, roles: string[]) => ({
    publicId: id, username: id, email: `${id}@x.vn`, fullName: id, tenantId: "t1", status: "ACTIVE", roles, studentCode: null,
    className: null, phone: null, dateOfBirth: null, mustChangePassword: true,
  });

  it("returns the only Host account", async () => {
    api.listUsersByTenant.mockResolvedValue([user("host", ["HOST_ADMIN"]), user("stu", ["STUDENT"])]);
    tenancyApi.useLoginAccount("t1");

    const lookup = (await opts().queryFn?.()) as { account: { id: string; mustChangePassword: boolean } | null; ambiguous: boolean; candidateCount: number };

    expect(opts().queryKey).toEqual([...LOGIN_ACCOUNT_QUERY_KEY, "t1"]);
    expect(lookup.account).toMatchObject({ id: "host", mustChangePassword: true });
    expect(lookup).toMatchObject({ ambiguous: false, candidateCount: 1 });
  });

  it("returns no account and flags ambiguity when there are several Hosts", async () => {
    api.listUsersByTenant.mockResolvedValue([user("h1", ["HOST_ADMIN"]), user("h2", ["HOST_ADMIN"])]);
    tenancyApi.useLoginAccount("t1");

    await expect(opts().queryFn?.()).resolves.toEqual({ account: null, ambiguous: true, candidateCount: 2 });
  });

  it("returns no account for an organization without a Host and a suspended Host is shown as suspended", async () => {
    api.listUsersByTenant.mockResolvedValue([user("stu", ["STUDENT"])]);
    tenancyApi.useLoginAccount("t1");
    await expect(opts().queryFn?.()).resolves.toEqual({ account: null, ambiguous: false, candidateCount: 0 });

    api.listUsersByTenant.mockResolvedValue([{ ...user("host", ["HOST_ADMIN"]), status: "SUSPENDED" }]);
    const lookup = (await opts().queryFn?.()) as { account: { status: string } };
    expect(lookup.account.status).toBe("suspended");
  });

  it("is disabled for an empty tenant id or when the caller disables it", () => {
    tenancyApi.useLoginAccount("");
    expect(opts().enabled).toBe(false);
    tenancyApi.useLoginAccount("t1", false);
    expect(opts().enabled).toBe(false);
  });

  it("creates the Host account with the HOST_ADMIN role in that organization and caches it", async () => {
    api.createUser.mockResolvedValue(user("new", ["HOST_ADMIN"]));
    tenancyApi.useCreateLoginAccount("t1");

    const account = await opts().mutationFn?.({ email: " a@b.vn ", fullName: " An ", password: "Secret-123" } as never);

    expect(api.createUser).toHaveBeenCalledWith(hoisted.apiClient, { email: "a@b.vn", fullName: "An", password: "Secret-123", roles: ["HOST_ADMIN"], tenantId: "t1" });
    expect(account).toMatchObject({ id: "new" });

    opts().onSuccess?.({ id: "new" } as never);
    expect(hoisted.setQueryData).toHaveBeenCalledWith([...LOGIN_ACCOUNT_QUERY_KEY, "t1"], { account: { id: "new" }, ambiguous: false, candidateCount: 1 });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: [...LOGIN_ACCOUNT_QUERY_KEY, "t1"] });
  });

  it("resets the password of the given user and returns the account", async () => {
    api.resetPassword.mockResolvedValue(user("host", ["HOST_ADMIN"]));
    tenancyApi.useResetPassword("host");

    const account = await opts().mutationFn?.({ newPassword: "New-Pass-1" } as never);

    expect(api.resetPassword).toHaveBeenCalledWith(hoisted.apiClient, "host", { newPassword: "New-Pass-1" });
    expect(account).toMatchObject({ id: "host" });
  });
});
