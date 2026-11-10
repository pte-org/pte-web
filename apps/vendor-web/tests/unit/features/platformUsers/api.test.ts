import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  placeholderData?: (previous: unknown) => unknown;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  options: undefined as unknown,
  invalidate: vi.fn(),
  api: {
    createPlatformUser: vi.fn(), archivePlatformUser: vi.fn(), listPlatformUsers: vi.fn(),
    resetPlatformUserPassword: vi.fn(), reactivatePlatformUser: vi.fn(), restorePlatformUser: vi.fn(),
    suspendPlatformUser: vi.fn(), updatePlatformUserProfile: vi.fn(), updatePlatformUserRoles: vi.fn(),
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

import * as platformUsersApi from "../../../../features/platformUsers/api";

const opts = () => hoisted.options as Options;
const { api } = hoisted;

beforeEach(() => {
  hoisted.invalidate.mockReset();
  Object.values(api).forEach((fn) => fn.mockReset());
});

describe("usePlatformUsers", () => {
  it("keys the list by every filter and uses neutral defaults for the unset ones", () => {
    platformUsersApi.usePlatformUsers(0, 20);

    expect(opts().queryKey).toEqual([...platformUsersApi.PLATFORM_USERS_QUERY_KEY, 0, 20, "", "ALL", "ALL", false]);
  });

  it("includes role, status, search and the archived flag in the key", () => {
    platformUsersApi.usePlatformUsers(1, 10, "ACADEMIC_STAFF", "ACTIVE", "an", true);

    expect(opts().queryKey).toEqual([...platformUsersApi.PLATFORM_USERS_QUERY_KEY, 1, 10, "an", "ACADEMIC_STAFF", "ACTIVE", true]);
  });

  it("sends the filters to the api as one object", async () => {
    api.listPlatformUsers.mockResolvedValue({ content: [] });
    platformUsersApi.usePlatformUsers(2, 5, "PLATFORM_MANAGER", "SUSPENDED", "x", true);

    await opts().queryFn?.();

    expect(api.listPlatformUsers).toHaveBeenCalledWith(hoisted.apiClient, {
      page: 2, size: 5, search: "x", role: "PLATFORM_MANAGER", status: "SUSPENDED", includeArchived: true,
    });
  });

  it("shows the previous page while the next one loads", () => {
    platformUsersApi.usePlatformUsers(0, 20);

    expect(opts().placeholderData?.("previous-page")).toBe("previous-page");
  });
});

describe("mutations", () => {
  const cases: Array<[string, () => unknown, keyof typeof hoisted.api, unknown, unknown[]]> = [
    ["create", () => platformUsersApi.useCreatePlatformUser(), "createPlatformUser", { email: "a@b.vn" }, [{ email: "a@b.vn" }]],
    ["suspend", () => platformUsersApi.useSuspendPlatformUser(), "suspendPlatformUser", "u1", ["u1"]],
    ["reactivate", () => platformUsersApi.useReactivatePlatformUser(), "reactivatePlatformUser", "u1", ["u1"]],
    ["reset password", () => platformUsersApi.useResetPlatformUserPassword(), "resetPlatformUserPassword", "u1", ["u1"]],
    ["archive", () => platformUsersApi.useArchivePlatformUser(), "archivePlatformUser", "u1", ["u1"]],
    ["restore", () => platformUsersApi.useRestorePlatformUser(), "restorePlatformUser", "u1", ["u1"]],
    ["update roles", () => platformUsersApi.useUpdatePlatformUserRoles(), "updatePlatformUserRoles",
      { publicId: "u1", payload: { roles: ["PLATFORM_MANAGER"] } }, ["u1", { roles: ["PLATFORM_MANAGER"] }]],
    ["update profile", () => platformUsersApi.useUpdatePlatformUserProfile(), "updatePlatformUserProfile",
      { publicId: "u1", payload: { fullName: "An" } }, ["u1", { fullName: "An" }]],
  ];

  it.each(cases)("%s calls its api with the right arguments", async (_name, hook, apiName, input, args) => {
    api[apiName].mockResolvedValue({});
    hook();

    await opts().mutationFn?.(input as never);

    expect(api[apiName]).toHaveBeenCalledWith(hoisted.apiClient, ...args);
  });

  it.each(cases)("%s refreshes the platform user list after success", (_name, hook) => {
    hook();

    opts().onSuccess?.();

    expect(hoisted.invalidate).toHaveBeenCalledTimes(1);
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: platformUsersApi.PLATFORM_USERS_QUERY_KEY });
  });

  it("does not refresh the list when the api call fails", async () => {
    api.suspendPlatformUser.mockRejectedValue(new Error("403"));
    platformUsersApi.useSuspendPlatformUser();

    await expect(opts().mutationFn?.("u1" as never)).rejects.toThrow("403");
    expect(hoisted.invalidate).not.toHaveBeenCalled();
  });
});
