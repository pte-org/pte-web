import { beforeEach, describe, expect, it, vi } from "vitest";

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: (result: unknown, variables: unknown) => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  mutations: [] as MutationOptions[],
  invalidateQueries: vi.fn(),
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
  useQueryClient: () => ({
    invalidateQueries: hoisted.invalidateQueries,
  }),
  useMutation: (options: MutationOptions) => {
    hoisted.mutations.push(options);
    return options;
  },
}));

import {
  useGenerateStudentCredentials,
  useSendUserCredentials,
} from "../../../../features/userManagement/api";

const lastMutation = () => hoisted.mutations[hoisted.mutations.length - 1];
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.mutations = [];
});

describe("userManagement Mutations", () => {
  it("useSendUserCredentials sends credentials email and invalidates account queries", async () => {
    api.sendCredentialsEmail.mockResolvedValue({ username: "usr", password: "pwd" });
    useSendUserCredentials();

    await lastMutation().mutationFn?.("usr-1" as never);
    expect(api.sendCredentialsEmail).toHaveBeenCalledWith(hoisted.apiClient, "usr-1");

    lastMutation().onSuccess?.(undefined, "usr-1");
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["examStaff"] });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["studentRoster"] });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["tenantUsers"] });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["studentDetail", "usr-1"] });
  });

  it("useGenerateStudentCredentials rotates student password without email and invalidates queries", async () => {
    api.generateStudentCredentials.mockResolvedValue({ username: "stu", password: "pwd" });
    useGenerateStudentCredentials();

    await lastMutation().mutationFn?.("stu-1" as never);
    expect(api.generateStudentCredentials).toHaveBeenCalledWith(hoisted.apiClient, "stu-1");

    lastMutation().onSuccess?.(undefined, "stu-1");
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["studentRoster"] });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["tenantUsers"] });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["studentDetail", "stu-1"] });
  });
});

