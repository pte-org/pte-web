import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  retry?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  select?: (user: { roles: string[]; email: string }) => { roles: string[]; email: string };
  mutationFn?: (input: never) => Promise<unknown>;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  options: undefined as unknown,
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/ui", () => ({ normalizeSessionRoles: (roles: string[]) => roles.map((role) => role.toUpperCase()) }));
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
}));

import * as authApi from "../../../../features/auth/api";
import { CURRENT_USER_QUERY_KEY } from "../../../../features/auth/constants";

const opts = () => hoisted.options as Options;
const { api } = hoisted;

beforeEach(() => {
  Object.keys(api).forEach((name) => api[name].mockReset());
});

describe("auth mutations", () => {
  it.each([
    ["admin login", () => authApi.useLoginAdmin(), "loginAdmin"],
    ["host login", () => authApi.useLoginHost(), "loginHost"],
    ["organization options", () => authApi.useLoginOrganizationOptions(), "listLoginOrganizations"],
    ["change password", () => authApi.useChangePassword(), "changePassword"],
    ["request password reset", () => authApi.useRequestPasswordReset(), "requestPasswordReset"],
    ["confirm password reset", () => authApi.useConfirmPasswordReset(), "confirmPasswordReset"],
  ])("%s forwards the payload unchanged to its api", async (_name, hook, apiName) => {
    api[apiName].mockResolvedValue({});
    const payload = { marker: "payload" };
    hook();

    await opts().mutationFn?.(payload as never);

    expect(api[apiName]).toHaveBeenCalledWith(hoisted.apiClient, payload);
  });

  it("a failed login reaches the caller as a rejection", async () => {
    api.loginAdmin.mockRejectedValue(new Error("401"));
    authApi.useLoginAdmin();

    await expect(opts().mutationFn?.({ email: "a" } as never)).rejects.toThrow("401");
  });
});

describe("useCurrentUser", () => {
  it("loads the current user once without retrying a refused session", async () => {
    api.getCurrentUser.mockResolvedValue({ email: "a@b.vn", roles: [] });
    authApi.useCurrentUser();

    await opts().queryFn?.();

    expect(opts().queryKey).toEqual(CURRENT_USER_QUERY_KEY);
    expect(opts().retry).toBe(false);
    expect(api.getCurrentUser).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("normalizes the roles and keeps the other fields", () => {
    authApi.useCurrentUser();

    expect(opts().select?.({ email: "a@b.vn", roles: ["platform_admin"] })).toEqual({
      email: "a@b.vn", roles: ["PLATFORM_ADMIN"],
    });
  });
});

describe("useValidatePasswordResetToken", () => {
  it("checks the token it was given without spending it", async () => {
    api.validatePasswordResetToken.mockResolvedValue({ valid: true });
    authApi.useValidatePasswordResetToken("tok-1");

    await opts().queryFn?.();

    expect(opts().queryKey).toEqual(["passwordResetToken", "tok-1"]);
    expect(api.validatePasswordResetToken).toHaveBeenCalledWith(hoisted.apiClient, { token: "tok-1" });
  });

  it("never reuses a cached answer, because a link can be spent between visits", () => {
    authApi.useValidatePasswordResetToken("tok-1");

    expect(opts().staleTime).toBe(0);
    expect(opts().gcTime).toBe(0);
    expect(opts().refetchOnWindowFocus).toBe(false);
    expect(opts().retry).toBe(false);
  });

  it("does not run without a token", () => {
    authApi.useValidatePasswordResetToken("");
    expect(opts().enabled).toBe(false);

    authApi.useValidatePasswordResetToken("t");
    expect(opts().enabled).toBe(true);
  });
});
