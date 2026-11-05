import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  queryOptions: undefined as QueryOptions | undefined,
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
  useClassMemberships,
  useCreateTenantStudents,
  useReactivateStudent,
  useStudentRoster,
  useSuspendStudent,
} from "../../../../features/studentSearch/api";
import {
  CLASS_MEMBERSHIPS_QUERY_KEY,
  STUDENT_ROSTER_QUERY_KEY,
} from "../../../../features/studentSearch/constants";
import { TENANT_USERS_QUERY_KEY } from "@/features/exams/constants";
import { HOST_DASHBOARD_QUERY_KEY } from "@/features/hostDashboard/constants";

const query = () => hoisted.queryOptions!;
const lastMutation = () => hoisted.mutations[hoisted.mutations.length - 1];
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutations = [];
});

describe("studentSearch Queries", () => {
  it("useClassMemberships queries all class memberships", async () => {
    api.listClassMemberships.mockResolvedValue([]);
    useClassMemberships();

    expect(query().queryKey).toEqual(CLASS_MEMBERSHIPS_QUERY_KEY);
    await query().queryFn?.();
    expect(api.listClassMemberships).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("useStudentRoster queries roster with query params", async () => {
    api.listStudentRoster.mockResolvedValue({ items: [] });
    useStudentRoster({
      page: 0,
      size: 20,
      search: "alex",
      status: "ACTIVE",
      assignmentStatus: "ALL",
      sort: "FULL_NAME",
      direction: "ASC",
    });

    expect(query().queryKey).toEqual([
      ...STUDENT_ROSTER_QUERY_KEY,
      "alex",
      0,
      20,
      "",
      "",
      "ACTIVE",
      "ALL",
      "FULL_NAME",
      "ASC",
    ]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.listStudentRoster).toHaveBeenCalled();
  });
});

describe("studentSearch Mutations", () => {
  it("useCreateTenantStudents creates students and invalidates caches", async () => {
    api.bulkCreateUsers.mockResolvedValue({ createdCount: 1 });
    useCreateTenantStudents();

    const rows = [
      {
        email: "alex@test.com",
        fullName: "Alex",
        studentCode: "A01",
        className: "Class 1",
        phone: "123456",
        dateOfBirth: "2000-01-01",
      },
    ];
    await lastMutation().mutationFn?.(rows as never);
    expect(api.bulkCreateUsers).toHaveBeenCalled();

    lastMutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: TENANT_USERS_QUERY_KEY });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: STUDENT_ROSTER_QUERY_KEY });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: HOST_DASHBOARD_QUERY_KEY });
  });

  it("useSuspendStudent and useReactivateStudent mutate and invalidate", async () => {
    api.suspendUser.mockResolvedValue({ publicId: "stu-1", status: "SUSPENDED" });
    useSuspendStudent();
    await lastMutation().mutationFn?.("stu-1" as never);
    expect(api.suspendUser).toHaveBeenCalledWith(hoisted.apiClient, "stu-1");
    lastMutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: STUDENT_ROSTER_QUERY_KEY });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: TENANT_USERS_QUERY_KEY });

    hoisted.invalidateQueries.mockClear();
    api.reactivateUser.mockResolvedValue({ publicId: "stu-1", status: "ACTIVE" });
    useReactivateStudent();
    await lastMutation().mutationFn?.("stu-1" as never);
    expect(api.reactivateUser).toHaveBeenCalledWith(hoisted.apiClient, "stu-1");
    lastMutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: STUDENT_ROSTER_QUERY_KEY });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: TENANT_USERS_QUERY_KEY });
  });
});

