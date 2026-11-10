import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  select?: (users: { roles: string[]; publicId: string }[]) => unknown;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: (result: never) => unknown;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  queries: [] as unknown[],
  mutations: [] as unknown[],
  invalidate: vi.fn(),
  getQueryData: vi.fn(),
  bulkCreateUsers: vi.fn(),
  bulkEnroll: vi.fn(),
  listEnrollments: vi.fn(),
  listUsers: vi.fn(),
  resetPassword: vi.fn(),
  unenroll: vi.fn(),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@/features/exams/constants", () => ({
  ENROLLMENTS_QUERY_KEY: ["enrollments"],
  TENANT_USERS_QUERY_KEY: ["tenantUsers"],
}));
vi.mock("@/features/hostDashboard/constants", () => ({ HOST_DASHBOARD_QUERY_KEY: ["hostDashboard"] }));
vi.mock("@pte/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/api-client")>()),
  bulkCreateUsers: hoisted.bulkCreateUsers,
  bulkEnroll: hoisted.bulkEnroll,
  listEnrollments: hoisted.listEnrollments,
  listUsers: hoisted.listUsers,
  resetPassword: hoisted.resetPassword,
  unenroll: hoisted.unenroll,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQuery: (options: unknown) => {
    hoisted.queries.push(options);
    return { data: undefined };
  },
  useMutation: (options: unknown) => {
    hoisted.mutations.push(options);
    return {};
  },
  useQueryClient: () => ({ invalidateQueries: hoisted.invalidate, getQueryData: hoisted.getQueryData }),
}));

import {
  clearPendingImport,
  loadPendingImport,
  savePendingImport,
  useCreateRosterAccounts,
  useCreateStudent,
  useEnrollExistingStudents,
  useEnrollRosterAccounts,
  useResetStudentPassword,
  useSessionRoster,
  useTenantStudents,
  useUnenroll,
} from "../../../../features/examoperations/api";
import { UserFacingError } from "../../../../features/examoperations/errorMessage";

const lastQuery = () => hoisted.queries.at(-1) as Options;
const lastMutation = () => hoisted.mutations.at(-1) as Options;

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
}

beforeEach(() => {
  vi.stubGlobal("sessionStorage", new MemoryStorage());
  hoisted.queries.length = 0;
  hoisted.mutations.length = 0;
  for (const fn of [hoisted.invalidate, hoisted.getQueryData, hoisted.bulkCreateUsers, hoisted.bulkEnroll,
    hoisted.listEnrollments, hoisted.listUsers, hoisted.resetPassword, hoisted.unenroll]) fn.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const account = { publicId: "stu-1", email: "a@b.vn", generatedPassword: "ABCD-1234" };

describe("pending import storage", () => {
  it("returns what was saved for the same session", () => {
    savePendingImport("s1", [account] as never);

    expect(loadPendingImport("s1")).toEqual([account]);
  });

  it("keeps sessions apart", () => {
    savePendingImport("s1", [account] as never);

    expect(loadPendingImport("s2")).toBeNull();
  });

  it("returns null after the entry is cleared", () => {
    savePendingImport("s1", [account] as never);
    clearPendingImport("s1");

    expect(loadPendingImport("s1")).toBeNull();
  });

  it("returns null instead of throwing when the stored text is not JSON", () => {
    sessionStorage.setItem("pte.pendingImport.s1", "{not json");

    expect(loadPendingImport("s1")).toBeNull();
  });

  it("does not throw when storage refuses writes, reads or removals", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    });

    expect(() => savePendingImport("s1", [])).not.toThrow();
    expect(loadPendingImport("s1")).toBeNull();
    expect(() => clearPendingImport("s1")).not.toThrow();
  });
});

describe("useCreateRosterAccounts", () => {
  it("turns blank roster cells into null before calling the api", async () => {
    hoisted.bulkCreateUsers.mockResolvedValue({ created: [], skipped: [] });
    useCreateRosterAccounts("s1");

    await lastMutation().mutationFn?.({
      rows: [
        {
          email: "",
          fullName: "An",
          studentCode: "",
          programName: "PTE",
          className: "A1",
          phone: "",
          dateOfBirth: "",
          sourceRow: 3,
        },
      ],
      sendCredentialsEmail: true,
    } as never);

    // programName and sourceRow stay in the browser.
    expect(hoisted.bulkCreateUsers).toHaveBeenCalledWith(hoisted.apiClient, {
      rows: [{ email: null, fullName: "An", studentCode: null, className: "A1", phone: null, dateOfBirth: null }],
      tenantId: null,
      sendCredentialsEmail: true,
    });
  });

  it("stores the generated accounts for recovery and refreshes the dashboard on success", () => {
    useCreateRosterAccounts("s1");

    lastMutation().onSuccess?.({ created: [account] } as never);

    expect(loadPendingImport("s1")).toEqual([account]);
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["hostDashboard"] });
  });
});

describe("useEnrollRosterAccounts", () => {
  it("enrolls the public ids of the accounts that were created", async () => {
    hoisted.bulkEnroll.mockResolvedValue({ skippedByConflict: [] });
    useEnrollRosterAccounts("s1");

    await lastMutation().mutationFn?.([account, { ...account, publicId: "stu-2" }] as never);

    expect(hoisted.bulkEnroll).toHaveBeenCalledWith(hoisted.apiClient, "s1", { studentPublicIds: ["stu-1", "stu-2"] });
  });

  it("clears the recovery entry when nobody was skipped", async () => {
    savePendingImport("s1", [account] as never);
    useEnrollRosterAccounts("s1");

    await lastMutation().onSuccess?.({ skippedByConflict: [] } as never);

    expect(loadPendingImport("s1")).toBeNull();
  });

  it("keeps the recovery entry when some students were skipped by conflict", async () => {
    savePendingImport("s1", [account] as never);
    useEnrollRosterAccounts("s1");

    await lastMutation().onSuccess?.({ skippedByConflict: ["stu-1"] } as never);

    expect(loadPendingImport("s1")).toEqual([account]);
  });

  it("refreshes tenant users first and only then the session enrollments", async () => {
    const order: string[] = [];
    hoisted.invalidate.mockImplementation(async ({ queryKey }: { queryKey: string[] }) => {
      await Promise.resolve();
      order.push(queryKey.join("/"));
    });
    useEnrollRosterAccounts("s1");

    await lastMutation().onSuccess?.({ skippedByConflict: [] } as never);
    await Promise.resolve();

    expect(order).toEqual(["tenantUsers", "enrollments/s1"]);
  });
});

describe("useEnrollExistingStudents, useUnenroll and useResetStudentPassword", () => {
  it("enrolls existing students and refreshes only that session roster", async () => {
    hoisted.bulkEnroll.mockResolvedValue({});
    useEnrollExistingStudents("s1");

    await lastMutation().mutationFn?.(["a", "b"] as never);
    lastMutation().onSuccess?.({} as never);

    expect(hoisted.bulkEnroll).toHaveBeenCalledWith(hoisted.apiClient, "s1", { studentPublicIds: ["a", "b"] });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["enrollments", "s1"] });
  });

  it("unenrolls one enrollment of the session and refreshes the roster", async () => {
    hoisted.unenroll.mockResolvedValue(undefined);
    useUnenroll("s1");

    await lastMutation().mutationFn?.("enr-1" as never);
    lastMutation().onSuccess?.(undefined as never);

    expect(hoisted.unenroll).toHaveBeenCalledWith(hoisted.apiClient, "s1", "enr-1");
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["enrollments", "s1"] });
  });

  it("resets a student password with the new password only", async () => {
    hoisted.resetPassword.mockResolvedValue({});
    useResetStudentPassword("stu-1");

    await lastMutation().mutationFn?.("New-Pass-1" as never);

    expect(hoisted.resetPassword).toHaveBeenCalledWith(hoisted.apiClient, "stu-1", { newPassword: "New-Pass-1" });
  });
});

describe("useCreateStudent", () => {
  const input = { email: "", fullName: "An", studentCode: "S1" };

  it("creates a single-row batch and returns the created account", async () => {
    hoisted.bulkCreateUsers.mockResolvedValue({ created: [account], skipped: [] });
    useCreateStudent();

    await expect(lastMutation().mutationFn?.(input as never)).resolves.toEqual(account);
    expect(hoisted.bulkCreateUsers).toHaveBeenCalledWith(hoisted.apiClient, {
      rows: [{ email: null, fullName: "An", studentCode: "S1", className: null, phone: null, dateOfBirth: null }],
      tenantId: null,
      sendCredentialsEmail: false,
    });
  });

  it("explains the refusal with the server reason when the row was skipped", async () => {
    hoisted.bulkCreateUsers.mockResolvedValue({ created: [], skipped: [{ reason: "Email already used" }] });
    useCreateStudent();

    const error = await lastMutation().mutationFn?.(input as never).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(UserFacingError);
    expect((error as UserFacingError).userMessage).toBe("Email already used");
  });

  it("falls back to a generic message when nothing was created and nothing was skipped", async () => {
    hoisted.bulkCreateUsers.mockResolvedValue({ created: [], skipped: [] });
    useCreateStudent();

    const error = await lastMutation().mutationFn?.(input as never).catch((e: unknown) => e);

    expect((error as UserFacingError).userMessage).toBe("Unable to create account");
  });

  it("refreshes the dashboard after success", () => {
    useCreateStudent();

    lastMutation().onSuccess?.(account as never);

    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["hostDashboard"] });
  });
});

describe("useTenantStudents", () => {
  it("keeps only accounts that hold the STUDENT role", () => {
    useTenantStudents();
    const users = [
      { publicId: "a", roles: ["STUDENT"] },
      { publicId: "b", roles: ["PROCTOR"] },
      { publicId: "c", roles: ["STUDENT", "PROCTOR"] },
    ];

    expect(lastQuery().select?.(users)).toEqual([users[0], users[2]]);
  });

  it("shares the tenant users key and honours the enabled flag", async () => {
    hoisted.listUsers.mockResolvedValue([]);
    useTenantStudents(false);

    await lastQuery().queryFn?.();

    expect(lastQuery().queryKey).toEqual(["tenantUsers"]);
    expect(lastQuery().enabled).toBe(false);
    expect(hoisted.listUsers).toHaveBeenCalledWith(hoisted.apiClient);
  });
});

describe("useSessionRoster", () => {
  it("is disabled until the tenant students have loaded", () => {
    useSessionRoster("s1");

    expect(lastQuery().queryKey).toEqual(["enrollments", "s1"]);
    expect(lastQuery().enabled).toBe(false);
  });

  it("is disabled for an empty session id", () => {
    useSessionRoster("");

    expect(lastQuery().enabled).toBe(false);
  });

  it("joins enrollments with cached students and drops enrollments of unknown or non-student accounts", async () => {
    hoisted.listEnrollments.mockResolvedValue([
      { publicId: "e1", studentPublicId: "stu-1" },
      { publicId: "e2", studentPublicId: "gone" },
      { publicId: "e3", studentPublicId: "proc-1" },
    ]);
    hoisted.getQueryData.mockReturnValue([
      { publicId: "stu-1", roles: ["STUDENT"], fullName: "An" },
      { publicId: "proc-1", roles: ["PROCTOR"], fullName: "Binh" },
    ]);
    useSessionRoster("s1");

    const roster = await lastQuery().queryFn?.();

    expect(hoisted.listEnrollments).toHaveBeenCalledWith(hoisted.apiClient, "s1");
    expect(roster).toEqual([{ enrollmentPublicId: "e1", student: { publicId: "stu-1", roles: ["STUDENT"], fullName: "An" } }]);
  });

  it("returns an empty roster when there are no enrollments", async () => {
    hoisted.listEnrollments.mockResolvedValue([]);
    hoisted.getQueryData.mockReturnValue(undefined);
    useSessionRoster("s1");

    await expect(lastQuery().queryFn?.()).resolves.toEqual([]);
  });
});
