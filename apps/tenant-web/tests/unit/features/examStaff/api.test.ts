import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
  placeholderData?: unknown;
};
type MutationOptions = {
  mutationFn: (input: never) => Promise<unknown>;
  onSuccess: () => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  query: undefined as unknown,
  mutation: undefined as unknown,
  invalidate: vi.fn(),
  listExamStaff: vi.fn(),
  listAllExamStaff: vi.fn(),
  createUser: vi.fn(),
  suspendUser: vi.fn(),
  reactivateUser: vi.fn(),
  keepPreviousData: Symbol("keepPreviousData"),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@/features/exams/constants", () => ({ TENANT_USERS_QUERY_KEY: ["tenantUsers"] }));
vi.mock("@pte/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/api-client")>()),
  listExamStaff: hoisted.listExamStaff,
  listAllExamStaff: hoisted.listAllExamStaff,
  createUser: hoisted.createUser,
  suspendUser: hoisted.suspendUser,
  reactivateUser: hoisted.reactivateUser,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  keepPreviousData: hoisted.keepPreviousData,
  useQuery: (options: unknown) => {
    hoisted.query = options;
    return {};
  },
  useMutation: (options: unknown) => {
    hoisted.mutation = options;
    return {};
  },
  useQueryClient: () => ({ invalidateQueries: hoisted.invalidate }),
}));

import {
  useAllExamStaff,
  useCreateExamStaff,
  useExamStaff,
  useReactivateExamStaff,
  useSuspendExamStaff,
} from "../../../../features/examStaff/api";
import { EXAM_STAFF_QUERY_KEY } from "../../../../features/examStaff/constants";
import { TENANT_USERS_QUERY_KEY } from "@/features/exams/constants";

const query = () => hoisted.query as QueryOptions;
const mutation = () => hoisted.mutation as MutationOptions;

beforeEach(() => {
  hoisted.invalidate.mockReset();
  hoisted.listExamStaff.mockReset();
  hoisted.listAllExamStaff.mockReset();
  hoisted.createUser.mockReset();
  hoisted.suspendUser.mockReset();
  hoisted.reactivateUser.mockReset();
});

describe("useExamStaff", () => {
  it("keys the page by every filter and falls back to defaults for omitted ones", () => {
    useExamStaff({ page: 2, size: 20 });

    expect(query().queryKey).toEqual([...EXAM_STAFF_QUERY_KEY, 2, 20, "", "ALL", "ALL", "CREATED_AT", "DESC"]);
  });

  it("puts explicit filters into the key so each filter combination caches separately", () => {
    useExamStaff({ page: 0, size: 10, search: "an", role: "PROCTOR", status: "ACTIVE", sort: "FULL_NAME", direction: "ASC" });

    expect(query().queryKey).toEqual([...EXAM_STAFF_QUERY_KEY, 0, 10, "an", "PROCTOR", "ACTIVE", "FULL_NAME", "ASC"]);
  });

  it("keeps the previous page visible while the next one loads", () => {
    useExamStaff({ page: 0, size: 10 });

    expect(query().placeholderData).toBe(hoisted.keepPreviousData);
  });

  it("fetches through the api client with the exact query it was given", async () => {
    const params = { page: 1, size: 5, role: "EXAMINER" as const };
    hoisted.listExamStaff.mockResolvedValue({ content: [] });
    useExamStaff(params);

    await expect(query().queryFn()).resolves.toEqual({ content: [] });
    expect(hoisted.listExamStaff).toHaveBeenCalledWith(hoisted.apiClient, params);
  });
});

describe("useAllExamStaff", () => {
  it("loads the whole staff set in one request of 100 without filters", async () => {
    hoisted.listAllExamStaff.mockResolvedValue([]);
    useAllExamStaff();

    await query().queryFn();

    expect(query().queryKey).toEqual([...EXAM_STAFF_QUERY_KEY, "all"]);
    expect(hoisted.listAllExamStaff).toHaveBeenCalledWith(hoisted.apiClient, {
      size: 100, role: "ALL", status: "ALL", sort: "CREATED_AT", direction: "DESC",
    });
  });
});

describe("useCreateExamStaff", () => {
  it("trims e-mail and name, sends one role and no tenant id", async () => {
    hoisted.createUser.mockResolvedValue({ publicId: "u1" });
    useCreateExamStaff();

    await mutation().mutationFn({ email: "  a@b.vn ", fullName: " An Nguyen ", password: "Secret-123", role: "PROCTOR" } as never);

    expect(hoisted.createUser).toHaveBeenCalledWith(hoisted.apiClient, {
      email: "a@b.vn", fullName: "An Nguyen", password: "Secret-123", roles: ["PROCTOR"], tenantId: null,
    });
  });

  it("refreshes the staff list and the tenant user list after success", () => {
    useCreateExamStaff();

    mutation().onSuccess();

    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: EXAM_STAFF_QUERY_KEY });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: TENANT_USERS_QUERY_KEY });
    expect(hoisted.invalidate).toHaveBeenCalledTimes(2);
  });

  it("does not refresh anything when creation fails", async () => {
    hoisted.createUser.mockRejectedValue(new Error("409"));
    useCreateExamStaff();

    await expect(mutation().mutationFn({ email: "a@b.vn", fullName: "An", password: "x", role: "EXAMINER" } as never)).rejects.toThrow("409");
    expect(hoisted.invalidate).not.toHaveBeenCalled();
  });
});

describe("useSuspendExamStaff and useReactivateExamStaff", () => {
  it("suspend calls the api with the public id and refreshes both lists", async () => {
    hoisted.suspendUser.mockResolvedValue({});
    useSuspendExamStaff();

    await mutation().mutationFn("user-1" as never);
    mutation().onSuccess();

    expect(hoisted.suspendUser).toHaveBeenCalledWith(hoisted.apiClient, "user-1");
    expect(hoisted.invalidate).toHaveBeenCalledTimes(2);
  });

  it("reactivate calls the api with the public id and refreshes both lists", async () => {
    hoisted.reactivateUser.mockResolvedValue({});
    useReactivateExamStaff();

    await mutation().mutationFn("user-2" as never);
    mutation().onSuccess();

    expect(hoisted.reactivateUser).toHaveBeenCalledWith(hoisted.apiClient, "user-2");
    expect(hoisted.suspendUser).not.toHaveBeenCalled();
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: TENANT_USERS_QUERY_KEY });
  });
});
