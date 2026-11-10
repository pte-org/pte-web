import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
  refetchOnWindowFocus?: boolean;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => Promise<void>;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  options: undefined as unknown,
  session: undefined as unknown,
  claims: undefined as unknown,
  invalidate: vi.fn(),
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/ui", () => ({ useSessionManager: () => ({ session: hoisted.session }) }));
vi.mock("@pte/api-client", () => new Proxy({}, {
  has: () => true,
  get: (_target, name: string) => {
    if (name === "__esModule") return false;
    if (name === "then") return undefined;
    if (name === "decodeAccessTokenClaims") return () => hoisted.claims;
    return hoisted.api[name];
  },
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
  useQueryClient: () => ({ invalidateQueries: hoisted.invalidate }),
}));

import * as examinerApi from "../../../../features/examiner/api";

const opts = () => hoisted.options as Options;
const api = hoisted.api;
const invalidatedKeys = () => hoisted.invalidate.mock.calls.map(([arg]) => (arg as { queryKey: unknown[] }).queryKey);

beforeEach(() => {
  hoisted.session = { tenantId: "t1", accessToken: "token" };
  hoisted.claims = { sub: "u1" };
  hoisted.invalidate.mockReset();
});

describe("readiness gating", () => {
  const readOnlyHooks: Array<[string, () => unknown, string]> = [
    ["overview", () => examinerApi.useExaminerOverview(), "overview"],
    ["reports", () => examinerApi.useExaminerReports(), "reports"],
    ["queue", () => examinerApi.useExaminerQueue("PENDING"), "queue"],
    ["history", () => examinerApi.useExaminerHistory("s1", "a1"), "history"],
    ["attempt", () => examinerApi.useExaminerAttempt("s1", "a1"), "attempt"],
    ["guidelines", () => examinerApi.useExaminerGuidelines("s1", "a1"), "guidelines"],
    ["issues", () => examinerApi.useExaminerIssues("s1", "a1"), "issues"],
  ];

  it.each(readOnlyHooks)("%s is enabled for a signed-in examiner and keyed by tenant and actor", (_name, call) => {
    call();

    expect(opts().enabled).toBe(true);
    expect(opts().queryKey?.slice(0, 3)).toEqual(["examiner", "t1", "u1"]);
  });

  it.each(readOnlyHooks)("%s is disabled with a neutral key when nobody is signed in", (_name, call, segment) => {
    hoisted.session = undefined;
    call();

    expect(opts().enabled).toBe(false);
    expect(opts().queryKey).toEqual(["examiner", "unauthenticated", segment]);
  });

  it.each(readOnlyHooks)("%s is disabled when the token carries no subject", (_name, call) => {
    hoisted.claims = undefined;
    call();

    expect(opts().enabled).toBe(false);
  });

  it("hooks that need a session and attempt id stay disabled without them", () => {
    for (const call of [
      () => examinerApi.useExaminerHistory("", "a1"),
      () => examinerApi.useExaminerHistory("s1", ""),
      () => examinerApi.useExaminerAttempt("", "a1"),
      () => examinerApi.useExaminerGuidelines("s1", ""),
      () => examinerApi.useExaminerIssues("", ""),
    ]) {
      call();
      expect(opts().enabled).toBe(false);
    }
  });
});

describe("query functions", () => {
  it("call the matching api with the ids they were given", async () => {
    examinerApi.useExaminerOverview();
    await opts().queryFn?.();
    expect(api.getExaminerWorkspaceOverview).toHaveBeenCalledWith(hoisted.apiClient);

    examinerApi.useExaminerReports({ from: "2026-01-01" } as never);
    await opts().queryFn?.();
    expect(api.getExaminerReports).toHaveBeenCalledWith(hoisted.apiClient, { from: "2026-01-01" });

    examinerApi.useExaminerHistory("s1", "a1", 2, 5);
    await opts().queryFn?.();
    expect(api.getExaminerHistory).toHaveBeenCalledWith(hoisted.apiClient, "s1", "a1", 2, 5);

    examinerApi.useExaminerAttempt("s1", "a1");
    await opts().queryFn?.();
    expect(api.getExaminerAttemptWork).toHaveBeenCalledWith(hoisted.apiClient, "s1", "a1");

    examinerApi.useExaminerGuidelines("s1", "a1");
    await opts().queryFn?.();
    expect(api.getExaminerGuidelines).toHaveBeenCalledWith(hoisted.apiClient, "s1", "a1");

    examinerApi.useExaminerIssues("s1", "a1");
    await opts().queryFn?.();
    expect(api.getExaminerIssues).toHaveBeenCalledWith(hoisted.apiClient, "s1", "a1");
  });

  it("use the cache freshness each screen needs", () => {
    examinerApi.useExaminerOverview();
    expect(opts().staleTime).toBe(30_000);
    examinerApi.useExaminerHistory("s1", "a1");
    expect(opts().staleTime).toBe(10_000);
    examinerApi.useExaminerGuidelines("s1", "a1");
    expect(opts().staleTime).toBe(60_000);
    examinerApi.useExaminerAttempt("s1", "a1");
    expect(opts().refetchOnWindowFocus).toBe(false);
  });
});

describe("useExaminerQueue", () => {
  it("treats a bare status as the legacy form with 20 items per page", async () => {
    api.listExaminerWork.mockResolvedValue({});
    examinerApi.useExaminerQueue("PENDING", 3);

    await opts().queryFn?.();

    expect(api.listExaminerWork).toHaveBeenCalledWith(hoisted.apiClient, { status: "PENDING", page: 3, size: 20 });
    expect(opts().retry).toBe(1);
  });

  it("fills first page and size 20 under the given parameters", async () => {
    api.listExaminerWork.mockResolvedValue({});
    examinerApi.useExaminerQueue({ status: "IN_PROGRESS", search: "an" });

    await opts().queryFn?.();

    expect(api.listExaminerWork).toHaveBeenCalledWith(hoisted.apiClient, { page: 0, size: 20, status: "IN_PROGRESS", search: "an" });
  });

  it("passes assignment date boundaries to the queue request", async () => {
    api.listExaminerWork.mockResolvedValue({});
    examinerApi.useExaminerQueue({ fromDate: "2026-11-01", toDate: "2026-11-07" });

    await opts().queryFn?.();

    expect(api.listExaminerWork).toHaveBeenCalledWith(hoisted.apiClient, {
      page: 0,
      size: 20,
      fromDate: "2026-11-01",
      toDate: "2026-11-07",
    });
  });

  it("lets explicit paging override the defaults", async () => {
    api.listExaminerWork.mockResolvedValue({});
    examinerApi.useExaminerQueue({ page: 4, size: 5 });

    await opts().queryFn?.();

    expect(api.listExaminerWork).toHaveBeenCalledWith(hoisted.apiClient, { page: 4, size: 5 });
  });
});

describe("mutations", () => {
  it("start work sends the payload and refreshes attempt, queue and overview", async () => {
    api.startExaminerWork.mockResolvedValue({});
    examinerApi.useStartExaminerWork("s1", "a1");

    await opts().mutationFn?.({ note: "go" } as never);
    await opts().onSuccess?.();

    expect(api.startExaminerWork).toHaveBeenCalledWith(hoisted.apiClient, "s1", "a1", { note: "go" });
    expect(invalidatedKeys()).toEqual([
      ["examiner", "t1", "u1", "attempt", "s1", "a1"],
      ["examiner", "t1", "u1", "queue"],
      ["examiner", "t1", "u1", "overview"],
    ]);
  });

  it("saving a draft sends the answer id and refreshes only the attempt", async () => {
    api.saveExaminerDraft.mockResolvedValue({});
    examinerApi.useSaveExaminerDraft("s1", "a1");

    await opts().mutationFn?.({ answerPublicId: "ans", payload: { score: 4 } } as never);
    await opts().onSuccess?.();

    expect(api.saveExaminerDraft).toHaveBeenCalledWith(hoisted.apiClient, "s1", "a1", "ans", { score: 4 });
    expect(invalidatedKeys()).toEqual([["examiner", "t1", "u1", "attempt", "s1", "a1"]]);
  });

  it("finalizing refreshes attempt, queue and overview", async () => {
    api.finalizeExaminerWork.mockResolvedValue({});
    examinerApi.useFinalizeExaminerWork("s1", "a1");

    await opts().mutationFn?.({ overall: 80 } as never);
    await opts().onSuccess?.();

    expect(api.finalizeExaminerWork).toHaveBeenCalledWith(hoisted.apiClient, "s1", "a1", { overall: 80 });
    expect(invalidatedKeys()).toHaveLength(3);
  });

  it("reporting an issue refreshes the issue list and the attempt", async () => {
    api.reportExaminerIssue.mockResolvedValue({});
    examinerApi.useReportExaminerIssue("s1", "a1");

    await opts().mutationFn?.({ reason: "audio" } as never);
    await opts().onSuccess?.();

    expect(api.reportExaminerIssue).toHaveBeenCalledWith(hoisted.apiClient, "s1", "a1", { reason: "audio" });
    expect(invalidatedKeys()).toEqual([
      ["examiner", "t1", "u1", "issues", "s1", "a1"],
      ["examiner", "t1", "u1", "attempt", "s1", "a1"],
    ]);
  });

  it("nothing is refreshed after success when there is no signed-in actor", async () => {
    hoisted.session = undefined;
    examinerApi.useStartExaminerWork("s1", "a1");
    await opts().onSuccess?.();
    examinerApi.useSaveExaminerDraft("s1", "a1");
    await opts().onSuccess?.();
    examinerApi.useFinalizeExaminerWork("s1", "a1");
    await opts().onSuccess?.();
    examinerApi.useReportExaminerIssue("s1", "a1");
    await opts().onSuccess?.();

    expect(hoisted.invalidate).not.toHaveBeenCalled();
  });
});
