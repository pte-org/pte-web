import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  staleTime?: number;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: (result: unknown) => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  queryOptions: undefined as QueryOptions | undefined,
  mutations: [] as MutationOptions[],
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
  getQueryData: vi.fn(),
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock(
  "@pte/api-client",
  () =>
    new Proxy(
      {},
      {
        has: () => true,
        get: (_target, name: string) => {
          if (name === "__esModule") return false;
          if (name === "then") return undefined;
          return hoisted.api[name];
        },
      },
    ),
);
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => ({
    invalidateQueries: hoisted.invalidateQueries,
    setQueryData: hoisted.setQueryData,
    getQueryData: hoisted.getQueryData,
  }),
  useQuery: (options: QueryOptions) => {
    hoisted.queryOptions = options;
    return {};
  },
  useMutation: (options: MutationOptions) => {
    hoisted.mutations.push(options);
    return options;
  },
}));

import {
  useUpdateMyOrganization,
  useUpdateOwnProfile,
  useVietnamProvinces,
  useVietnamWards,
  VIETNAM_PROVINCES_QUERY_KEY,
} from "../../../../features/profile/api";
import { CURRENT_USER_QUERY_KEY } from "@/features/auth/constants";
import { MY_ORGANIZATIONS_QUERY_KEY } from "@/features/programs/constants";

const query = () => hoisted.queryOptions!;
const lastMutation = () => hoisted.mutations[hoisted.mutations.length - 1];
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutations = [];
});

describe("Location Queries", () => {
  it("useVietnamProvinces queries province list", async () => {
    api.listVietnamProvinces.mockResolvedValue([]);
    useVietnamProvinces();

    expect(query().queryKey).toEqual(VIETNAM_PROVINCES_QUERY_KEY);
    await query().queryFn?.();
    expect(api.listVietnamProvinces).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("useVietnamWards queries wards when province code is provided", async () => {
    api.listVietnamWards.mockResolvedValue([]);
    useVietnamWards("HN");

    expect(query().queryKey).toEqual([...VIETNAM_PROVINCES_QUERY_KEY, "HN", "wards"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.listVietnamWards).toHaveBeenCalledWith(hoisted.apiClient, "HN");
  });

  it("useVietnamWards stays disabled when province code is null", () => {
    useVietnamWards(null);
    expect(query().enabled).toBe(false);
  });
});

describe("Profile Mutations", () => {
  it("useUpdateOwnProfile mutates profile and sets current user query data", async () => {
    const updatedUser = { publicId: "u1", fullName: "Updated Name" };
    api.updateOwnProfile.mockResolvedValue(updatedUser);
    useUpdateOwnProfile();

    const payload = { fullName: "Updated Name" };
    await lastMutation().mutationFn?.(payload as never);
    expect(api.updateOwnProfile).toHaveBeenCalledWith(hoisted.apiClient, payload);

    lastMutation().onSuccess?.(updatedUser);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(CURRENT_USER_QUERY_KEY, updatedUser);
  });

  it("useUpdateMyOrganization mutates organization profile and invalidates queries", async () => {
    const org = { publicId: "org-1" };
    api.updateMyOrganization.mockResolvedValue(org);
    useUpdateMyOrganization();

    const payload = { name: "Updated Org" };
    await lastMutation().mutationFn?.({ publicId: "org-1", payload } as never);
    expect(api.updateMyOrganization).toHaveBeenCalledWith(hoisted.apiClient, "org-1", payload);

    lastMutation().onSuccess?.(org);
  });
});
