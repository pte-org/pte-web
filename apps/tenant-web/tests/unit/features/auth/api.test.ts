import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  queryOptions: undefined as QueryOptions | undefined,
  mutations: [] as MutationOptions[],
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", () => new Proxy({}, {
  has: () => true,
  get: (_target, name: string) => {
    if (name === "__esModule") return false;
    if (name === "then") return undefined;
    return hoisted.api[name];
  },
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
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
  useChangePassword,
  useConfirmPasswordReset,
  useCurrentUser,
  useLoginHost,
  useLoginOrganizationOptions,
  useRequestPasswordReset,
  useValidatePasswordResetToken,
} from "../../../../features/auth/api";
import { CURRENT_USER_QUERY_KEY } from "../../../../features/auth/constants";

const query = () => hoisted.queryOptions!;
const lastMutation = () => hoisted.mutations[hoisted.mutations.length - 1];
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutations = [];
});

describe("Auth Queries", () => {
  it("useCurrentUser queries current authenticated user", async () => {
    api.getCurrentUser.mockResolvedValue({ publicId: "u1", roles: ["HOST_ADMIN"] });
    useCurrentUser();

    expect(query().queryKey).toEqual(CURRENT_USER_QUERY_KEY);
    await query().queryFn?.();
    expect(api.getCurrentUser).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("useValidatePasswordResetToken validates token", async () => {
    api.validatePasswordResetToken.mockResolvedValue({ valid: true });
    useValidatePasswordResetToken("tok-123");

    expect(query().queryKey).toEqual(["passwordResetToken", "tok-123"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.validatePasswordResetToken).toHaveBeenCalledWith(hoisted.apiClient, {
      token: "tok-123",
    });
  });

  it("useValidatePasswordResetToken is disabled for empty token", () => {
    useValidatePasswordResetToken("");
    expect(query().enabled).toBe(false);
  });
});

describe("Auth Mutations", () => {
  it("useLoginHost executes host login", async () => {
    api.loginHost.mockResolvedValue({ token: "jwt-token" });
    useLoginHost();

    const payload = { username: "admin", password: "pwd" };
    await lastMutation().mutationFn?.(payload as never);
    expect(api.loginHost).toHaveBeenCalledWith(hoisted.apiClient, payload);
  });

  it("useLoginOrganizationOptions lists organizations for username", async () => {
    api.listLoginOrganizations.mockResolvedValue([]);
    useLoginOrganizationOptions();

    const payload = { username: "admin" };
    await lastMutation().mutationFn?.(payload as never);
    expect(api.listLoginOrganizations).toHaveBeenCalledWith(hoisted.apiClient, payload);
  });

  it("useChangePassword changes password", async () => {
    api.changePassword.mockResolvedValue(undefined);
    useChangePassword();

    const payload = { oldPassword: "old", newPassword: "new" };
    await lastMutation().mutationFn?.(payload as never);
    expect(api.changePassword).toHaveBeenCalledWith(hoisted.apiClient, payload);
  });

  it("useRequestPasswordReset and useConfirmPasswordReset execute reset flow", async () => {
    api.requestPasswordReset.mockResolvedValue(undefined);
    useRequestPasswordReset();
    await lastMutation().mutationFn?.({ email: "user@test.com" } as never);
    expect(api.requestPasswordReset).toHaveBeenCalledWith(hoisted.apiClient, {
      email: "user@test.com",
    });

    api.confirmPasswordReset.mockResolvedValue(undefined);
    useConfirmPasswordReset();
    await lastMutation().mutationFn?.({ token: "tok", newPassword: "pass" } as never);
    expect(api.confirmPasswordReset).toHaveBeenCalledWith(hoisted.apiClient, {
      token: "tok",
      newPassword: "pass",
    });
  });
});

