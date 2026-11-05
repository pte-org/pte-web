import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryConfig = {
  queryKey?: readonly unknown[];
  queryFn?: (ctx: { signal?: AbortSignal }) => Promise<unknown>;
  enabled?: boolean;
};

type MutationConfig<TVariables = unknown, TContext = unknown> = {
  mutationFn?: (variables: TVariables) => Promise<unknown>;
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  onSuccess?: (data: unknown, variables: TVariables, context: TContext | undefined) => Promise<void> | void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  user: { publicId: "u1", tenantId: "tenant-1", roles: ["HOST_ADMIN"] } as {
    publicId: string;
    tenantId: string | null;
    roles: string[];
  } | null,
  capturedQuery: null as QueryConfig | null,
  capturedMutation: null as MutationConfig<unknown, unknown> | null,
  cancelQueries: vi.fn().mockResolvedValue(undefined),
  setQueryData: vi.fn(),
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
  getExamStaffDetail: vi.fn().mockResolvedValue({ publicId: "staff-1", fullName: "Staff One" }),
  getExamStaffOverview: vi.fn().mockResolvedValue({ totalSessions: 10 }),
  listProctorStaffSessions: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  listExaminerStaffSessions: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  updateExamStaffProfile: vi.fn().mockResolvedValue({ publicId: "staff-1", fullName: "Updated Staff" }),
  listSessions: vi.fn().mockResolvedValue([{ id: "s1" }]),
  currentGeneration: 1,
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/ui", () => ({
  getSessionGeneration: () => hoisted.currentGeneration,
}));
vi.mock("@/features/auth/api", () => ({
  useCurrentUser: () => ({ data: hoisted.user }),
}));
vi.mock("@pte/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pte/api-client")>();
  return {
    ...actual,
    getExamStaffDetail: hoisted.getExamStaffDetail,
    getExamStaffOverview: hoisted.getExamStaffOverview,
    listProctorStaffSessions: hoisted.listProctorStaffSessions,
    listExaminerStaffSessions: hoisted.listExaminerStaffSessions,
    updateExamStaffProfile: hoisted.updateExamStaffProfile,
    listSessions: hoisted.listSessions,
  };
});
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({
      cancelQueries: hoisted.cancelQueries,
      setQueryData: hoisted.setQueryData,
      invalidateQueries: hoisted.invalidateQueries,
    }),
    useQuery: (config: QueryConfig) => {
      hoisted.capturedQuery = config;
      return { data: undefined, isFetching: false, isPending: false };
    },
    useMutation: (config: MutationConfig<unknown, unknown>) => {
      hoisted.capturedMutation = config;
      return {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
        error: null,
      };
    },
  };
});

import {
  useNextStaffProctorSessions,
  useStaffDetail,
  useStaffExaminerSessions,
  useStaffOverview,
  useStaffProctorSessions,
  useUpdateStaffProfile,
} from "@/features/examStaff/detail/api";
import { useStaffSessionOptions } from "@/features/examStaff/detail/filters/api";

const renderHarness = (fn: () => void): void => {
  renderToStaticMarkup(createElement(() => { fn(); return null; }));
};

describe("features/examStaff/detail/api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.user = { publicId: "u1", tenantId: "tenant-1", roles: ["HOST_ADMIN"] };
    hoisted.currentGeneration = 1;
    hoisted.capturedQuery = null;
    hoisted.capturedMutation = null;
  });

  it("configures useStaffDetail query", async () => {
    renderHarness(() => useStaffDetail("staff-123"));
    expect(hoisted.capturedQuery).not.toBeNull();
    expect(hoisted.capturedQuery?.enabled).toBe(true);
    expect(hoisted.capturedQuery?.queryKey).toEqual(["examStaff", "detail", "tenant-1", "staff-123"]);

    const signal = new AbortController().signal;
    await hoisted.capturedQuery?.queryFn?.({ signal });
    expect(hoisted.getExamStaffDetail).toHaveBeenCalledWith(hoisted.apiClient, "staff-123", signal);
  });

  it("disables useStaffDetail when user is not HOST_ADMIN or publicId is empty", () => {
    hoisted.user = { publicId: "u1", tenantId: "tenant-1", roles: ["STUDENT"] };
    renderHarness(() => useStaffDetail("staff-123"));
    expect(hoisted.capturedQuery?.enabled).toBe(false);

    hoisted.user = { publicId: "u1", tenantId: "tenant-1", roles: ["HOST_ADMIN"] };
    renderHarness(() => useStaffDetail(""));
    expect(hoisted.capturedQuery?.enabled).toBe(false);
  });

  it("configures useStaffOverview query", async () => {
    const query = { page: 0, size: 10 };
    renderHarness(() => useStaffOverview("staff-123", query, true));
    expect(hoisted.capturedQuery?.enabled).toBe(true);
    expect(hoisted.capturedQuery?.queryKey).toEqual([
      "examStaff", "detail", "tenant-1", "staff-123", "overview", query,
    ]);

    const signal = new AbortController().signal;
    await hoisted.capturedQuery?.queryFn?.({ signal });
    expect(hoisted.getExamStaffOverview).toHaveBeenCalledWith(hoisted.apiClient, "staff-123", query, signal);
  });

  it("configures useStaffProctorSessions query", async () => {
    const query = { page: 1, size: 20 };
    renderHarness(() => useStaffProctorSessions("staff-123", query, true));
    expect(hoisted.capturedQuery?.enabled).toBe(true);
    expect(hoisted.capturedQuery?.queryKey).toEqual([
      "examStaff", "detail", "tenant-1", "staff-123", "proctor", query,
    ]);

    const signal = new AbortController().signal;
    await hoisted.capturedQuery?.queryFn?.({ signal });
    expect(hoisted.listProctorStaffSessions).toHaveBeenCalledWith(hoisted.apiClient, "staff-123", query, signal);
  });

  it("configures useStaffExaminerSessions query", async () => {
    const query = { page: 0, size: 5 };
    renderHarness(() => useStaffExaminerSessions("staff-123", query, false));
    expect(hoisted.capturedQuery?.enabled).toBe(false);

    renderHarness(() => useStaffExaminerSessions("staff-123", query, true));
    expect(hoisted.capturedQuery?.enabled).toBe(true);
    expect(hoisted.capturedQuery?.queryKey).toEqual([
      "examStaff", "detail", "tenant-1", "staff-123", "examiner", query,
    ]);

    const signal = new AbortController().signal;
    await hoisted.capturedQuery?.queryFn?.({ signal });
    expect(hoisted.listExaminerStaffSessions).toHaveBeenCalledWith(hoisted.apiClient, "staff-123", query, signal);
  });

  it("configures useNextStaffProctorSessions query with preview params", async () => {
    renderHarness(() => useNextStaffProctorSessions("staff-123", true));
    expect(hoisted.capturedQuery?.enabled).toBe(true);
    expect(hoisted.capturedQuery?.queryKey).toEqual([
      "examStaff", "detail", "tenant-1", "staff-123", "proctor-preview",
    ]);

    const signal = new AbortController().signal;
    await hoisted.capturedQuery?.queryFn?.({ signal });
    expect(hoisted.listProctorStaffSessions).toHaveBeenCalledWith(
      hoisted.apiClient,
      "staff-123",
      expect.objectContaining({
        sessionStatus: "SCHEDULED",
        direction: "asc",
        page: 0,
        size: 3,
      }),
      signal,
    );
  });

  it("handles useUpdateStaffProfile lifecycle with concurrency generation checks", async () => {
    renderHarness(() => useUpdateStaffProfile());
    expect(hoisted.capturedMutation).not.toBeNull();

    const payload = { fullName: "New Name", email: "new@example.com" };
    const mutationArgs = { publicId: "staff-123", payload };

    // 1. onMutate
    const context = await hoisted.capturedMutation?.onMutate?.(mutationArgs) as {
      key: readonly unknown[];
      generation: number;
    };
    expect(context).toEqual({
      key: ["examStaff", "detail", "tenant-1", "staff-123"],
      generation: 1,
    });
    expect(hoisted.cancelQueries).toHaveBeenCalledWith({
      queryKey: context.key,
      exact: true,
    });

    // 2. mutationFn
    await hoisted.capturedMutation?.mutationFn?.(mutationArgs);
    expect(hoisted.updateExamStaffProfile).toHaveBeenCalledWith(hoisted.apiClient, "staff-123", payload);

    // 3. onSuccess with matched generation
    const updatedAccount = { publicId: "staff-123", fullName: "New Name" };
    await hoisted.capturedMutation?.onSuccess?.(updatedAccount, mutationArgs, context);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(context.key, updatedAccount);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["examStaff"] });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["tenantUsers"] });

    // 4. onSuccess with generation mismatch is ignored
    vi.clearAllMocks();
    hoisted.currentGeneration = 99;
    await hoisted.capturedMutation?.onSuccess?.(updatedAccount, mutationArgs, context);
    expect(hoisted.setQueryData).not.toHaveBeenCalled();
    expect(hoisted.invalidateQueries).not.toHaveBeenCalled();
  });
});

describe("features/examStaff/detail/filters/api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.user = { publicId: "u1", tenantId: "tenant-1", roles: ["HOST_ADMIN"] };
    hoisted.capturedQuery = null;
  });

  it("configures useStaffSessionOptions query", async () => {
    renderHarness(() => useStaffSessionOptions(true));
    expect(hoisted.capturedQuery?.enabled).toBe(true);
    expect(hoisted.capturedQuery?.queryKey).toEqual(["examStaff", "sessionOptions", "tenant-1"]);

    const signal = new AbortController().signal;
    await hoisted.capturedQuery?.queryFn?.({ signal });
    expect(hoisted.listSessions).toHaveBeenCalledWith(hoisted.apiClient, signal);
  });

  it("disables useStaffSessionOptions when enabled is false or user lacks HOST_ADMIN", () => {
    renderHarness(() => useStaffSessionOptions(false));
    expect(hoisted.capturedQuery?.enabled).toBe(false);

    hoisted.user = { publicId: "u1", tenantId: "tenant-1", roles: ["STUDENT"] };
    renderHarness(() => useStaffSessionOptions(true));
    expect(hoisted.capturedQuery?.enabled).toBe(false);
  });
});

