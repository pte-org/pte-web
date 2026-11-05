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
  useAllTenantClasses,
  useAssignStudent,
  useBulkAssignStudents,
  useClasses,
  useClassStatusMutations,
  useCreateClass,
  useTransferStudent,
  useUnassignStudent,
  useUpdateClass,
} from "../../../../features/classes/api";
import { useClassRoster } from "../../../../features/classes/api/classRoster";
import {
  useMergeClasses,
  useSplitClass,
} from "../../../../features/classes/api/mergeSplit";
import {
  ALL_TENANT_CLASSES_QUERY_KEY,
  CLASSES_QUERY_KEY,
} from "../../../../features/classes/constants";
import { CLASS_MEMBERSHIPS_QUERY_KEY } from "@/features/studentSearch/constants";

const query = () => hoisted.queryOptions!;
const lastMutation = () => hoisted.mutations[hoisted.mutations.length - 1];
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutations = [];
});

describe("Classes CRUD and Listing", () => {
  it("useClasses queries classes for an organization and program", async () => {
    api.listClasses.mockResolvedValue([]);
    useClasses("org-1", "prog-1");

    expect(query().queryKey).toEqual([...CLASSES_QUERY_KEY, "prog-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.listClasses).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1");
  });

  it("useClasses stays disabled when either publicId is empty", () => {
    useClasses("", "prog-1");
    expect(query().enabled).toBe(false);

    useClasses("org-1", "");
    expect(query().enabled).toBe(false);
  });

  it("useAllTenantClasses queries all active classes across tenant", async () => {
    api.listMyOrganizations.mockResolvedValue([{ publicId: "org-1" }]);
    api.listPrograms.mockResolvedValue([{ publicId: "prog-1", name: "Program 1" }]);
    api.listClasses.mockResolvedValue([{ publicId: "cls-1", name: "Class 1", status: "ACTIVE" }]);

    useAllTenantClasses();

    expect(query().queryKey).toEqual(ALL_TENANT_CLASSES_QUERY_KEY);
    const result = (await query().queryFn?.()) as Array<{ classPublicId: string }>;
    expect(result).toHaveLength(1);
    expect(result[0].classPublicId).toBe("cls-1");
  });

  it("useCreateClass creates a class and invalidates program classes", async () => {
    api.createClass.mockResolvedValue({ publicId: "cls-1" });
    useCreateClass("org-1", "prog-1");

    const payload = { name: "Class A", classCode: "CLA" };
    await lastMutation().mutationFn?.(payload as never);
    expect(api.createClass).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1", payload);

    lastMutation().onSuccess?.({ publicId: "cls-1" });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...CLASSES_QUERY_KEY, "prog-1"],
    });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ALL_TENANT_CLASSES_QUERY_KEY,
    });
  });

  it("useUpdateClass updates a class and updates query cache", async () => {
    const updated = { publicId: "cls-1", name: "Class B" };
    api.updateClass.mockResolvedValue(updated);
    useUpdateClass("org-1", "prog-1", "cls-1");

    const payload = { name: "Class B" };
    await lastMutation().mutationFn?.(payload as never);
    expect(api.updateClass).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1", "cls-1", payload);

    lastMutation().onSuccess?.(updated);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(
      [...CLASSES_QUERY_KEY, "prog-1"],
      expect.any(Function),
    );
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...CLASSES_QUERY_KEY, "prog-1"],
    });
  });

  it("useClassStatusMutations creates activate, deactivate, suspend, archive mutations", async () => {
    api.activateClass.mockResolvedValue({ publicId: "cls-1", status: "ACTIVE" });
    const { activate, deactivate, suspend, archive } = useClassStatusMutations("org-1", "prog-1", "cls-1");

    expect(activate).toBeDefined();
    expect(deactivate).toBeDefined();
    expect(suspend).toBeDefined();
    expect(archive).toBeDefined();

    expect(hoisted.mutations).toHaveLength(4);
    await hoisted.mutations[0].mutationFn?.(undefined as never);
    expect(api.activateClass).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1", "cls-1");
  });
});

describe("Student Assignment Hooks", () => {
  it("useAssignStudent and useBulkAssignStudents assign students and invalidate memberships", async () => {
    api.assignStudent.mockResolvedValue(undefined);
    useAssignStudent("org-1", "prog-1", "cls-1");
    await lastMutation().mutationFn?.({ studentPublicId: "stu-1" } as never);
    expect(api.assignStudent).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1", "cls-1", {
      studentPublicId: "stu-1",
    });
    lastMutation().onSuccess?.(undefined);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: CLASS_MEMBERSHIPS_QUERY_KEY,
    });

    hoisted.invalidateQueries.mockClear();
    api.bulkAssignStudents.mockResolvedValue({ assignedCount: 2 });
    useBulkAssignStudents("org-1", "prog-1", "cls-1");
    await lastMutation().mutationFn?.(["stu-1", "stu-2"] as never);
    expect(api.bulkAssignStudents).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1", "cls-1", {
      studentPublicIds: ["stu-1", "stu-2"],
    });
    lastMutation().onSuccess?.(undefined);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: CLASS_MEMBERSHIPS_QUERY_KEY,
    });
  });

  it("useUnassignStudent and useTransferStudent mutate and invalidate", async () => {
    api.unassignStudent.mockResolvedValue(undefined);
    useUnassignStudent("org-1", "prog-1", "cls-1");
    await lastMutation().mutationFn?.("mem-1" as never);
    expect(api.unassignStudent).toHaveBeenCalledWith(
      hoisted.apiClient,
      "org-1",
      "prog-1",
      "cls-1",
      "mem-1",
    );
    lastMutation().onSuccess?.(undefined);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: CLASS_MEMBERSHIPS_QUERY_KEY,
    });

    hoisted.invalidateQueries.mockClear();
    api.transferStudent.mockResolvedValue(undefined);
    useTransferStudent("org-1", "prog-1", "cls-1");
    await lastMutation().mutationFn?.({
      membershipPublicId: "mem-1",
      targetProgramPublicId: "prog-2",
      targetClassPublicId: "cls-2",
    } as never);
    expect(api.transferStudent).toHaveBeenCalled();
    lastMutation().onSuccess?.(undefined);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: CLASS_MEMBERSHIPS_QUERY_KEY,
    });
  });
});

describe("Merge and Split Hooks", () => {
  it("useMergeClasses and useSplitClass perform mutations and invalidations", async () => {
    api.mergeClasses.mockResolvedValue({ targetClass: { publicId: "cls-target" } });
    useMergeClasses("org-1", "prog-1", "cls-target");
    await lastMutation().mutationFn?.(["cls-1", "cls-2"] as never);
    expect(api.mergeClasses).toHaveBeenCalledWith(hoisted.apiClient, "org-1", "prog-1", "cls-target", {
      sourceClassPublicIds: ["cls-1", "cls-2"],
    });
    lastMutation().onSuccess?.(undefined);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...CLASSES_QUERY_KEY, "prog-1"],
    });

    hoisted.invalidateQueries.mockClear();
    api.splitClass.mockResolvedValue({ sourceClass: {}, targetClass: {} });
    useSplitClass("org-1", "prog-1", "cls-1");
    const splitPayload = {
      targetClassName: "Class Split",
      targetClassCode: "CS",
      studentPublicIds: ["stu-1"],
    };
    await lastMutation().mutationFn?.(splitPayload as never);
    expect(api.splitClass).toHaveBeenCalledWith(
      hoisted.apiClient,
      "org-1",
      "prog-1",
      "cls-1",
      splitPayload,
    );
    lastMutation().onSuccess?.(undefined);
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...CLASSES_QUERY_KEY, "prog-1"],
    });
  });
});

describe("Class Roster Hook", () => {
  it("useClassRoster queries roster by program and class id", async () => {
    api.listClassMemberships.mockResolvedValue([
      { publicId: "mem-1", studentPublicId: "stu-1", classPublicId: "cls-1" },
    ]);
    useClassRoster("prog-1", "cls-1");

    expect(query().queryKey).toEqual([...CLASS_MEMBERSHIPS_QUERY_KEY, "prog-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.listClassMemberships).toHaveBeenCalledWith(hoisted.apiClient, "prog-1");
  });
});
