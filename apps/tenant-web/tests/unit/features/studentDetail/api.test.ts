import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
  enabled?: boolean;
  placeholderData?: unknown;
};
type MutationOptions = {
  mutationFn: (input: never) => Promise<unknown>;
  onSuccess: (result: unknown, variables: { publicId: string }) => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  query: undefined as unknown,
  mutation: undefined as unknown,
  invalidate: vi.fn(),
  getStudentDetail: vi.fn(),
  listStudentAttempts: vi.fn(),
  getStudentPerformance: vi.fn(),
  updateStudentProfile: vi.fn(),
  keepPreviousData: Symbol("keepPreviousData"),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/api-client")>()),
  getStudentDetail: hoisted.getStudentDetail,
  listStudentAttempts: hoisted.listStudentAttempts,
  getStudentPerformance: hoisted.getStudentPerformance,
  updateStudentProfile: hoisted.updateStudentProfile,
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
  STUDENT_DETAIL_QUERY_KEY,
  useStudentAttempts,
  useStudentDetail,
  useStudentPerformance,
  useUpdateStudentProfile,
} from "../../../../features/studentDetail/api";

const query = () => hoisted.query as QueryOptions;
const mutation = () => hoisted.mutation as MutationOptions;

beforeEach(() => {
  hoisted.invalidate.mockReset();
  hoisted.getStudentDetail.mockReset();
  hoisted.listStudentAttempts.mockReset();
  hoisted.getStudentPerformance.mockReset();
  hoisted.updateStudentProfile.mockReset();
});

describe("useStudentDetail", () => {
  it("is keyed by the student and enabled by default", () => {
    useStudentDetail("stu-1");

    expect(query().queryKey).toEqual([...STUDENT_DETAIL_QUERY_KEY, "stu-1"]);
    expect(query().enabled).toBe(true);
  });

  it("stays disabled for an empty public id even when the caller enables it", () => {
    useStudentDetail("", true);

    expect(query().enabled).toBe(false);
  });

  it("stays disabled when the caller disables it", () => {
    useStudentDetail("stu-1", false);

    expect(query().enabled).toBe(false);
  });

  it("loads the student through the api client", async () => {
    hoisted.getStudentDetail.mockResolvedValue({ publicId: "stu-1" });
    useStudentDetail("stu-1");

    await expect(query().queryFn()).resolves.toEqual({ publicId: "stu-1" });
    expect(hoisted.getStudentDetail).toHaveBeenCalledWith(hoisted.apiClient, "stu-1");
  });
});

describe("useStudentAttempts", () => {
  it("keys history by paging and fills defaults for the optional filters", () => {
    useStudentAttempts("stu-1", { page: 0, size: 10 });

    expect(query().queryKey).toEqual([...STUDENT_DETAIL_QUERY_KEY, "stu-1", "attempts", 0, 10, "", "", "ALL"]);
  });

  it("includes date range and status in the key", () => {
    useStudentAttempts("stu-1", { page: 1, size: 5, from: "2026-01-01", to: "2026-02-01", status: "SUBMITTED" });

    expect(query().queryKey).toEqual([
      ...STUDENT_DETAIL_QUERY_KEY, "stu-1", "attempts", 1, 5, "2026-01-01", "2026-02-01", "SUBMITTED",
    ]);
  });

  it("keeps the previous page while loading and passes the query to the api", async () => {
    const params = { page: 3, size: 5 };
    hoisted.listStudentAttempts.mockResolvedValue({ content: [] });
    useStudentAttempts("stu-1", params);

    await query().queryFn();

    expect(query().placeholderData).toBe(hoisted.keepPreviousData);
    expect(hoisted.listStudentAttempts).toHaveBeenCalledWith(hoisted.apiClient, "stu-1", params);
  });

  it("is disabled without a public id", () => {
    useStudentAttempts("", { page: 0, size: 10 });

    expect(query().enabled).toBe(false);
  });
});

describe("useStudentPerformance", () => {
  it("defaults to an unbounded range", async () => {
    hoisted.getStudentPerformance.mockResolvedValue({});
    useStudentPerformance("stu-1");

    await query().queryFn();

    expect(query().queryKey).toEqual([...STUDENT_DETAIL_QUERY_KEY, "stu-1", "performance", "", ""]);
    expect(hoisted.getStudentPerformance).toHaveBeenCalledWith(hoisted.apiClient, "stu-1", {});
  });

  it("separates cache entries per date range", () => {
    useStudentPerformance("stu-1", { from: "2026-03-01", to: "2026-03-31" });

    expect(query().queryKey).toEqual([...STUDENT_DETAIL_QUERY_KEY, "stu-1", "performance", "2026-03-01", "2026-03-31"]);
  });
});

describe("useUpdateStudentProfile", () => {
  it("sends the payload for the given student", async () => {
    hoisted.updateStudentProfile.mockResolvedValue({});
    useUpdateStudentProfile();

    await mutation().mutationFn({ publicId: "stu-1", payload: { fullName: "An" } } as never);

    expect(hoisted.updateStudentProfile).toHaveBeenCalledWith(hoisted.apiClient, "stu-1", { fullName: "An" });
  });

  it("refreshes that student, the roster and the tenant users after saving", () => {
    useUpdateStudentProfile();

    mutation().onSuccess({}, { publicId: "stu-1" });

    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: [...STUDENT_DETAIL_QUERY_KEY, "stu-1"] });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["studentRoster"] });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["tenantUsers"] });
    expect(hoisted.invalidate).toHaveBeenCalledTimes(3);
  });
});
