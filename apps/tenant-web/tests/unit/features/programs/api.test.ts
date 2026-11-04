import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
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
vi.mock("@/features/examoperations/api", () => ({
  useTenantStudents: () => ({ data: [{ publicId: "stu-1", fullName: "Student One" }] }),
}));
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
    return {};
  },
  useMutation: (options: MutationOptions) => {
    hoisted.mutations.push(options);
    return options;
  },
}));

import {
  useCreateProgram,
  useMyOrganizations,
  useProgram,
  useProgramDashboard,
  useProgramRoster,
  usePrograms,
  useProgramStatusMutations,
  useUpdateProgram,
} from "../../../../features/programs/api";
import {
  MY_ORGANIZATIONS_QUERY_KEY,
  PROGRAM_QUERY_KEY,
  PROGRAMS_QUERY_KEY,
} from "../../../../features/programs/constants";
import { CLASS_MEMBERSHIPS_QUERY_KEY } from "@/features/studentSearch/constants";

const query = () => hoisted.queryOptions!;
const lastMutation = () => hoisted.mutations[hoisted.mutations.length - 1];
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutations = [];
});

describe("Organizations and Programs Queries", () => {
  it("useMyOrganizations queries organizations", async () => {
    api.listMyOrganizations.mockResolvedValue([]);
    useMyOrganizations();

    expect(query().queryKey).toEqual(MY_ORGANIZATIONS_QUERY_KEY);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.listMyOrganizations).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("usePrograms queries programs for an organization", async () => {
    api.listPrograms.mockResolvedValue([]);
    usePrograms("org-1");

    expect(query().queryKey).toEqual([...PROGRAMS_QUERY_KEY, "org-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.listPrograms).toHaveBeenCalledWith(hoisted.apiClient, "org-1");
  });

  it("useProgram queries single program by id", async () => {
    api.getProgram.mockResolvedValue({ publicId: "prog-1", name: "Program 1" });
    useProgram("org-1", "prog-1");

    expect(query().queryKey).toEqual([...PROGRAM_QUERY_KEY, "prog-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.getProgram).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1");
  });

  it("useProgram stays disabled when either id is missing", () => {
    useProgram("", "prog-1");
    expect(query().enabled).toBe(false);

    useProgram("org-1", "");
    expect(query().enabled).toBe(false);
  });
});

describe("Program Mutations", () => {
  it("useCreateProgram creates program and invalidates organization programs", async () => {
    api.createProgram.mockResolvedValue({ publicId: "prog-new" });
    useCreateProgram("org-1");

    const payload = { name: "New Prog", programCode: "NP" };
    await lastMutation().mutationFn?.(payload as never);
    expect(api.createProgram).toHaveBeenCalledWith(hoisted.apiClient, "org-1", payload);

    lastMutation().onSuccess?.({ publicId: "prog-new" });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...PROGRAMS_QUERY_KEY, "org-1"],
    });
  });

  it("useUpdateProgram updates program and sets query data", async () => {
    const updated = { publicId: "prog-1", name: "Updated" };
    api.updateProgram.mockResolvedValue(updated);
    useUpdateProgram("org-1", "prog-1");

    const payload = { name: "Updated" };
    await lastMutation().mutationFn?.(payload as never);
    expect(api.updateProgram).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1", payload);

    lastMutation().onSuccess?.(updated);
    expect(hoisted.setQueryData).toHaveBeenCalledWith([...PROGRAM_QUERY_KEY, "prog-1"], updated);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...PROGRAMS_QUERY_KEY, "org-1"],
    });
  });

  it("useProgramStatusMutations provides status transition mutations", async () => {
    const prog = { publicId: "prog-1", status: "ACTIVE" };
    api.activateProgram.mockResolvedValue(prog);
    const { activate, deactivate, suspend, archive } = useProgramStatusMutations("org-1", "prog-1");

    expect(activate).toBeDefined();
    expect(deactivate).toBeDefined();
    expect(suspend).toBeDefined();
    expect(archive).toBeDefined();

    expect(hoisted.mutations).toHaveLength(4);
    await hoisted.mutations[0].mutationFn?.(undefined as never);
    expect(api.activateProgram).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1");

    hoisted.mutations[0].onSuccess?.(prog);
    expect(hoisted.setQueryData).toHaveBeenCalledWith([...PROGRAM_QUERY_KEY, "prog-1"], prog);
  });
});

describe("Program Dashboard and Roster", () => {
  it("useProgramDashboard queries dashboard numbers", async () => {
    api.getProgramDashboard.mockResolvedValue({ classCount: 5, studentCount: 20 });
    useProgramDashboard("org-1", "prog-1");

    expect(query().queryKey).toEqual([...CLASS_MEMBERSHIPS_QUERY_KEY, "prog-1", "dashboard"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.getProgramDashboard).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1");
  });

  it("useProgramRoster joins memberships with cached tenant students", async () => {
    api.listClassMemberships.mockResolvedValue([
      { publicId: "mem-1", studentPublicId: "stu-1" },
    ]);
    hoisted.getQueryData.mockReturnValue([{ publicId: "stu-1", fullName: "Student One" }]);

    useProgramRoster("prog-1");

    expect(query().queryKey).toEqual([...CLASS_MEMBERSHIPS_QUERY_KEY, "prog-1"]);
    expect(query().enabled).toBe(true);

    const roster = (await query().queryFn?.()) as Array<{ student: { publicId: string } }>;
    expect(roster).toHaveLength(1);
    expect(roster[0].student.publicId).toBe("stu-1");
  });
});

