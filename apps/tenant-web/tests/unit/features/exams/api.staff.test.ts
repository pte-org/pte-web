import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  select?: (data: Array<{ roles: string[]; publicId: string }>) => unknown;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: (result: unknown) => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  queryOptions: undefined as QueryOptions | undefined,
  mutationOptions: undefined as MutationOptions | undefined,
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
    setQueryData: hoisted.setQueryData,
    getQueryData: hoisted.getQueryData,
  }),
  useQuery: (options: QueryOptions) => {
    hoisted.queryOptions = options;
    return { data: [{ publicId: "p1", roles: ["PROCTOR"] }] };
  },
  useMutation: (options: MutationOptions) => {
    hoisted.mutationOptions = options;
    return {};
  },
}));

import {
  useActiveExaminers,
  useAssignProctor,
  useCommitExaminerAssignment,
  useExaminerAssignmentRoster,
  useProctorAssignments,
  useReassignExaminer,
  useTenantProctors,
  useUnassignProctor,
  useUpdateProctorRole,
} from "../../../../features/exams/api";
import {
  EXAMINER_ASSIGNMENT_ROSTER_QUERY_KEY,
  EXAMINER_DIRECTORY_QUERY_KEY,
  PROCTOR_ASSIGNMENTS_QUERY_KEY,
  TENANT_USERS_QUERY_KEY,
} from "../../../../features/exams/constants";

const query = () => hoisted.queryOptions!;
const mutation = () => hoisted.mutationOptions!;
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutationOptions = undefined;
});

describe("Examiner Hooks", () => {
  it("useExaminerAssignmentRoster queries roster by session id", async () => {
    api.getExaminerAssignmentRoster.mockResolvedValue({ assignments: [] });
    useExaminerAssignmentRoster("ses-1");

    expect(query().queryKey).toEqual([...EXAMINER_ASSIGNMENT_ROSTER_QUERY_KEY, "ses-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.getExaminerAssignmentRoster).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
  });

  it("useExaminerAssignmentRoster is disabled without session id", () => {
    useExaminerAssignmentRoster("");
    expect(query().enabled).toBe(false);
  });

  it("useActiveExaminers lists active examiners directory", async () => {
    api.listAllExamStaff.mockResolvedValue([]);
    useActiveExaminers();

    expect(query().queryKey).toEqual(EXAMINER_DIRECTORY_QUERY_KEY);
    await query().queryFn?.();
    expect(api.listAllExamStaff).toHaveBeenCalledWith(hoisted.apiClient, {
      size: 100,
      role: "EXAMINER",
      status: "ACTIVE",
      sort: "FULL_NAME",
      direction: "ASC",
    });
  });

  it("useCommitExaminerAssignment updates assignment roster in cache", async () => {
    const payload = { assignments: [] };
    const roster = { committed: true };
    api.commitExaminerAssignment.mockResolvedValue(roster);
    useCommitExaminerAssignment("ses-1");

    const res = await mutation().mutationFn?.(payload as never);
    expect(api.commitExaminerAssignment).toHaveBeenCalledWith(hoisted.apiClient, "ses-1", payload);

    mutation().onSuccess?.(res);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(
      [...EXAMINER_ASSIGNMENT_ROSTER_QUERY_KEY, "ses-1"],
      roster,
    );
  });

  it("useReassignExaminer reassigns attempt and updates cache", async () => {
    const roster = { reassigned: true };
    api.reassignExaminer.mockResolvedValue(roster);
    useReassignExaminer("ses-1");

    const payload = { newExaminerPublicId: "ex-2", reason: "load" };
    const res = await mutation().mutationFn?.({ attemptPublicId: "att-1", payload } as never);
    expect(api.reassignExaminer).toHaveBeenCalledWith(hoisted.apiClient, "ses-1", "att-1", payload);

    mutation().onSuccess?.(res);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(
      [...EXAMINER_ASSIGNMENT_ROSTER_QUERY_KEY, "ses-1"],
      roster,
    );
  });
});

describe("Proctor Hooks", () => {
  it("useTenantProctors selects PROCTOR roles from tenant users query", async () => {
    const users = [
      { publicId: "p1", roles: ["PROCTOR"] },
      { publicId: "s1", roles: ["STUDENT"] },
    ];
    api.listUsers.mockResolvedValue(users);
    useTenantProctors();

    expect(query().queryKey).toEqual(TENANT_USERS_QUERY_KEY);
    await query().queryFn?.();
    expect(api.listUsers).toHaveBeenCalledWith(hoisted.apiClient);

    const filtered = query().select?.(users);
    expect(filtered).toEqual([{ publicId: "p1", roles: ["PROCTOR"] }]);
  });

  it("useProctorAssignments joins assignment list with tenant proctors", async () => {
    api.listProctorAssignments.mockResolvedValue([
      { publicId: "as-1", proctorPublicId: "p1", role: "MAIN" },
    ]);
    hoisted.getQueryData.mockReturnValue([
      { publicId: "p1", roles: ["PROCTOR"], fullName: "Proctor 1" },
    ]);

    useProctorAssignments("ses-1");
    expect(query().queryKey).toEqual([...PROCTOR_ASSIGNMENTS_QUERY_KEY, "ses-1"]);
    expect(query().enabled).toBe(true);

    const assignments = (await query().queryFn?.()) as Array<{ assignmentPublicId: string }>;
    expect(assignments[0].assignmentPublicId).toBe("as-1");
    expect(api.listProctorAssignments).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
  });

  it("useAssignProctor, useUnassignProctor, useUpdateProctorRole mutate and invalidate", async () => {
    api.assignProctor.mockResolvedValue(undefined);
    useAssignProctor("ses-1");
    await mutation().mutationFn?.({ proctorPublicId: "p1", role: "MAIN" } as never);
    expect(api.assignProctor).toHaveBeenCalledWith(hoisted.apiClient, "ses-1", {
      proctorPublicId: "p1",
      role: "MAIN",
    });
    mutation().onSuccess?.(undefined);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...PROCTOR_ASSIGNMENTS_QUERY_KEY, "ses-1"],
    });

    hoisted.invalidateQueries.mockClear();
    api.unassignProctor.mockResolvedValue(undefined);
    useUnassignProctor("ses-1");
    await mutation().mutationFn?.("as-1" as never);
    expect(api.unassignProctor).toHaveBeenCalledWith(hoisted.apiClient, "ses-1", "as-1");
    mutation().onSuccess?.(undefined);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...PROCTOR_ASSIGNMENTS_QUERY_KEY, "ses-1"],
    });

    hoisted.invalidateQueries.mockClear();
    api.updateProctorRole.mockResolvedValue(undefined);
    useUpdateProctorRole("ses-1");
    await mutation().mutationFn?.({ assignmentPublicId: "as-1", role: "BACKUP" } as never);
    expect(api.updateProctorRole).toHaveBeenCalledWith(hoisted.apiClient, "ses-1", "as-1", {
      role: "BACKUP",
    });
    mutation().onSuccess?.(undefined);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...PROCTOR_ASSIGNMENTS_QUERY_KEY, "ses-1"],
    });
  });
});

