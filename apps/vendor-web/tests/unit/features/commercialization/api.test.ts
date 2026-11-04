import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: (data: unknown, variables: never) => unknown;
  onSettled?: () => unknown;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  options: undefined as unknown,
  invalidate: vi.fn(),
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
  useQueryClient: () => ({ invalidateQueries: hoisted.invalidate }),
}));

import * as commercialApi from "../../../../features/commercialization/api";
import {
  APPLICATIONS_QUERY_KEY,
  APPLICATION_QUERY_KEY,
  LICENSE_CODES_PAGE_QUERY_KEY,
  LICENSE_CODES_QUERY_KEY,
  PLANS_QUERY_KEY,
  SETTINGS_QUERY_KEY,
} from "../../../../features/commercialization/constants";

const opts = () => hoisted.options as Options;
const { api } = hoisted;
const invalidated = () => hoisted.invalidate.mock.calls.map(([arg]) => (arg as { queryKey: unknown[] }).queryKey);

beforeEach(() => {
  hoisted.invalidate.mockReset();
  Object.keys(api).forEach((name) => api[name].mockReset());
});

describe("applications", () => {
  it("lists applications and loads one only when an id is given", async () => {
    api.listApplications.mockResolvedValue([]);
    commercialApi.useApplicationsQuery();
    await opts().queryFn?.();
    expect(opts().queryKey).toEqual(APPLICATIONS_QUERY_KEY);
    expect(api.listApplications).toHaveBeenCalledWith(hoisted.apiClient);

    api.getApplication.mockResolvedValue({});
    commercialApi.useApplicationQuery("a1");
    await opts().queryFn?.();
    expect(opts().queryKey).toEqual(APPLICATION_QUERY_KEY("a1"));
    expect(opts().enabled).toBe(true);
    expect(api.getApplication).toHaveBeenCalledWith(hoisted.apiClient, "a1");

    commercialApi.useApplicationQuery("");
    expect(opts().enabled).toBe(false);
  });

  it("approving refreshes the list and that application", async () => {
    api.approveApplication.mockResolvedValue(undefined);
    commercialApi.useApproveApplication();

    await opts().mutationFn?.("a1" as never);
    await opts().onSuccess?.(undefined, "a1" as never);

    expect(api.approveApplication).toHaveBeenCalledWith(hoisted.apiClient, "a1");
    expect(invalidated()).toEqual([[...APPLICATIONS_QUERY_KEY], [...APPLICATION_QUERY_KEY("a1")]]);
  });

  it("rejecting sends the reason and refreshes the list and that application", async () => {
    api.rejectApplication.mockResolvedValue({});
    commercialApi.useRejectApplication();

    await opts().mutationFn?.({ publicId: "a2", payload: { reason: "Duplicate" } } as never);
    await opts().onSuccess?.({}, { publicId: "a2" } as never);

    expect(api.rejectApplication).toHaveBeenCalledWith(hoisted.apiClient, "a2", { reason: "Duplicate" });
    expect(invalidated()).toEqual([[...APPLICATIONS_QUERY_KEY], [...APPLICATION_QUERY_KEY("a2")]]);
  });
});

describe("plans", () => {
  it("lists plans", async () => {
    api.listPlans.mockResolvedValue([]);
    commercialApi.usePlansQuery();

    await opts().queryFn?.();

    expect(opts().queryKey).toEqual(PLANS_QUERY_KEY);
  });

  it.each([
    ["create", () => commercialApi.useCreatePlan(), "createPlan", { name: "P" }, [{ name: "P" }]],
    ["update", () => commercialApi.useUpdatePlan(), "updatePlan", { publicId: "p1", payload: { name: "N" } }, ["p1", { name: "N" }]],
    ["activate", () => commercialApi.useActivatePlan(), "activatePlan", { publicId: "p1", payload: { expectedVersion: 2 } }, ["p1", { expectedVersion: 2 }]],
    ["archive", () => commercialApi.useArchivePlan(), "archivePlan", { publicId: "p1", payload: { expectedVersion: 3 } }, ["p1", { expectedVersion: 3 }]],
    ["delete", () => commercialApi.useDeletePlan(), "deletePlan", "p1", ["p1"]],
  ])("%s calls its api and refreshes the plan list even when the call fails", async (_name, hook, apiName, input, args) => {
    api[apiName].mockResolvedValue({});
    hook();

    await opts().mutationFn?.(input as never);
    await opts().onSettled?.();

    expect(api[apiName]).toHaveBeenCalledWith(hoisted.apiClient, ...args);
    expect(invalidated()).toEqual([[...PLANS_QUERY_KEY]]);
    expect(opts().onSuccess).toBeUndefined();
  });
});

describe("platform settings", () => {
  it("reads the settings and refreshes them after an update", async () => {
    api.listPlatformSettings.mockResolvedValue([]);
    commercialApi.usePlatformSettingsQuery();
    await opts().queryFn?.();
    expect(opts().queryKey).toEqual(SETTINGS_QUERY_KEY);

    api.updatePlatformSettings.mockResolvedValue([]);
    commercialApi.useUpdatePlatformSettings();
    await opts().mutationFn?.({ settings: [] } as never);
    await opts().onSuccess?.([], {} as never);
    expect(api.updatePlatformSettings).toHaveBeenCalledWith(hoisted.apiClient, { settings: [] });
    expect(invalidated()).toEqual([[...SETTINGS_QUERY_KEY]]);
  });
});

describe("license code list", () => {
  const UUID = "0f8fad5b-d9cb-469f-a165-70867728950e";
  const listed = (params: Record<string, unknown>) => {
    api.listAdminLicenseCodes.mockResolvedValue({ data: [], meta: {} });
    commercialApi.useAdminLicenseCodesQuery(params as never);
  };

  it("fills the defaults of the page, the size and the filters", () => {
    listed({});

    expect(opts().queryKey).toEqual(LICENSE_CODES_PAGE_QUERY_KEY({ page: 0, size: 25, status: "", planId: "", tenantId: "", search: "" }));
  });

  it("passes a search that is a UUID to the server", async () => {
    listed({ page: 1, size: 10, search: `  ${UUID}  ` });

    await opts().queryFn?.();

    expect(api.listAdminLicenseCodes).toHaveBeenCalledWith(hoisted.apiClient, { page: 1, size: 10, search: UUID });
  });

  it("answers an empty page without calling the server when the search is not a UUID", async () => {
    listed({ page: 2, size: 10, search: "ABCD-1234" });

    const result = (await opts().queryFn?.()) as { data: unknown[]; meta: Record<string, unknown> };

    expect(api.listAdminLicenseCodes).not.toHaveBeenCalled();
    expect(result.data).toEqual([]);
    expect(result.meta).toMatchObject({ page: 2, size: 10, totalElements: 0, totalPages: 0, first: false, last: true, hasNext: false, hasPrevious: true });
    expect(opts().queryKey).toEqual(LICENSE_CODES_PAGE_QUERY_KEY({ page: 2, size: 10, status: "", planId: "", tenantId: "", search: "UNSUPPORTED" }));
  });

  it("an empty or blank search is not an unsupported search", async () => {
    listed({ search: "   " });

    await opts().queryFn?.();

    expect(api.listAdminLicenseCodes).toHaveBeenCalledWith(hoisted.apiClient, { search: undefined });
  });

  it("the first page of an unsupported search is marked as first", async () => {
    listed({ search: "xyz" });

    const result = (await opts().queryFn?.()) as { meta: { first: boolean; hasPrevious: boolean } };

    expect(result.meta).toMatchObject({ first: true, hasPrevious: false });
  });
});

describe("license codes", () => {
  it("look up and reveal go straight to the api, without a cache entry", async () => {
    api.lookupLicenseCode.mockResolvedValue({ publicId: "c1" });
    api.revealLicenseCode.mockResolvedValue({ code: "ABCD" });

    await expect(commercialApi.lookupAdminLicenseCode("ABCD-1234")).resolves.toEqual({ publicId: "c1" });
    await expect(commercialApi.revealAdminLicenseCode("c1")).resolves.toEqual({ code: "ABCD" });

    expect(api.lookupLicenseCode).toHaveBeenCalledWith(hoisted.apiClient, "ABCD-1234");
    expect(api.revealLicenseCode).toHaveBeenCalledWith(hoisted.apiClient, "c1");
  });

  it("issuing sends the idempotency key and refreshes the code list after success or failure", async () => {
    api.issueLicenseCode.mockResolvedValue({});
    commercialApi.useIssueLicenseCode();

    await opts().mutationFn?.({ payload: { planId: "p1" }, idempotencyKey: "key-1" } as never);
    await opts().onSettled?.();

    expect(api.issueLicenseCode).toHaveBeenCalledWith(hoisted.apiClient, { planId: "p1" }, "key-1");
    expect(invalidated()).toEqual([[...LICENSE_CODES_QUERY_KEY]]);
  });

  it("the revoke preview is a mutation that only reads", async () => {
    api.previewLicenseCodeRevoke.mockResolvedValue({});
    commercialApi.useLicenseCodeRevokePreview();

    await opts().mutationFn?.("c1" as never);

    expect(api.previewLicenseCodeRevoke).toHaveBeenCalledWith(hoisted.apiClient, "c1");
    expect(opts().onSuccess).toBeUndefined();
  });

  it("revoking sends the confirmation and refreshes the code list", async () => {
    api.revokeLicenseCode.mockResolvedValue({});
    commercialApi.useRevokeLicenseCode();

    await opts().mutationFn?.({ publicId: "c1", payload: { reason: "Mistake", digest: "d" } } as never);
    await opts().onSuccess?.({}, {} as never);

    expect(api.revokeLicenseCode).toHaveBeenCalledWith(hoisted.apiClient, "c1", { reason: "Mistake", digest: "d" });
    expect(invalidated()).toEqual([[...LICENSE_CODES_QUERY_KEY]]);
  });
});
