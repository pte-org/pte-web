import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  staleTime?: number;
  retry?: number;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
  onSettled?: () => void;
};

const hoisted = vi.hoisted(() => ({
  questionApiNames: new Set([
    "archiveQuestion", "deleteQuestion", "approveQuestion", "createQuestion", "createQuestionRevision",
    "getQuestionStats", "getMediaPreview", "getQuestion", "listQuestions", "publishQuestion", "rejectQuestion",
    "submitQuestionApproval", "updateQuestion", "unarchiveQuestion",
  ]),
  apiClient: { request: "stub" },
  options: undefined as unknown,
  invalidate: vi.fn(),
  keepPreviousData: Symbol("keepPreviousData"),
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", async (importOriginal) => {
  const original = await importOriginal<typeof import("@pte/api-client")>();
  return new Proxy(original, {
    get: (target, name: string) => (hoisted.questionApiNames.has(name) ? hoisted.api[name] : Reflect.get(target, name)),
  });
});
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  keepPreviousData: hoisted.keepPreviousData,
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

import * as questionApi from "../../../../features/questionbank/api";
import { QUESTION_STATS_QUERY_KEY, QUESTIONS_QUERY_KEY } from "../../../../features/questionbank/constants";

const opts = () => hoisted.options as Options;
const { api } = hoisted;

beforeEach(() => {
  hoisted.invalidate.mockReset();
  for (const name of hoisted.questionApiNames) api[name].mockReset();
});

const response = (over: Record<string, unknown> = {}) => ({
  publicId: "q1", section: "SPEAKING", pteTaskType: "READ_ALOUD", title: "Read this", promptText: "prompt",
  status: "DRAFT", pool: "EXAM", options: [], rejectionReason: null, canDeleteDraft: true, canArchive: false, deleteBlockReason: null,
  ...over,
});

const page = (items: unknown[], totalPages = 1) => ({
  data: items,
  meta: { page: 0, size: 100, totalElements: items.length, totalPages, first: true, last: true, hasNext: false, hasPrevious: false },
});

describe("mapPool", () => {
  it("maps PRACTICE to practice and anything else to exam", () => {
    expect(questionApi.mapPool({ pool: "PRACTICE" })).toBe("practice");
    expect(questionApi.mapPool({ pool: "EXAM" })).toBe("exam");
    expect(questionApi.mapPool(undefined)).toBe("exam");
  });

  it("lets the availability flags win over the creation pool", () => {
    expect(questionApi.mapPool({ pool: "EXAM", availableForExam: false, availableForPractice: true })).toBe("practice");
    expect(questionApi.mapPool({ pool: "PRACTICE", availableForExam: true, availableForPractice: false })).toBe("exam");
  });
});

describe("useQuestions", () => {
  it("keys the page by every filter with empty defaults", () => {
    questionApi.useQuestions({}, 0, 20);

    expect(opts().queryKey).toEqual([...QUESTIONS_QUERY_KEY, "", "", "", "", "", "", "", 0, 20]);
    expect(opts().placeholderData).toBe(hoisted.keepPreviousData);
  });

  it("maps server rows to UI questions: skill, status, pool and the first text as the label", async () => {
    api.listQuestions.mockResolvedValue(page([
      response(),
      response({ publicId: "q2", section: "LISTENING", status: "APPROVED", pool: "PRACTICE", title: "", promptText: "Fallback text" }),
      response({ publicId: "q3", section: "UNKNOWN", status: "WEIRD", title: "", promptText: null }),
      response({ publicId: "q4", section: "WRITING", status: "PENDING_APPROVAL" }),
      response({ publicId: "q5", section: "READING", status: "ARCHIVED" }),
    ]));
    questionApi.useQuestions({ taskType: "READ_ALOUD" }, 1, 10);

    const result = (await opts().queryFn?.()) as { data: Array<Record<string, unknown>> };

    expect(api.listQuestions).toHaveBeenCalledWith(hoisted.apiClient, { taskType: "READ_ALOUD" }, 1, 10);
    expect(result.data.map((q) => [q.id, q.skill, q.status, q.pool, q.content])).toEqual([
      ["q1", "speaking", "draft", "exam", "prompt"],
      ["q2", "listening", "published", "practice", "Fallback text"],
      ["q3", "reading", "draft", "exam", "—"],
      ["q4", "writing", "pending_approval", "exam", "prompt"],
      ["q5", "reading", "archived", "exam", "prompt"],
    ]);
  });

  it("loads everything in pages of 100 when the caller asks for 1000 or more", async () => {
    api.listQuestions
      .mockResolvedValueOnce(page([response({ publicId: "a" })], 3))
      .mockResolvedValueOnce(page([response({ publicId: "b" })], 3))
      .mockResolvedValueOnce(page([response({ publicId: "c" })], 3));
    questionApi.useQuestions({}, 0, 1000);

    const result = (await opts().queryFn?.()) as { data: Array<{ id: string }>; meta: Record<string, unknown> };

    expect(api.listQuestions).toHaveBeenCalledTimes(3);
    expect(api.listQuestions).toHaveBeenNthCalledWith(1, hoisted.apiClient, {}, 0, 100);
    expect(api.listQuestions).toHaveBeenNthCalledWith(2, hoisted.apiClient, {}, 1, 100);
    expect(api.listQuestions).toHaveBeenNthCalledWith(3, hoisted.apiClient, {}, 2, 100);
    expect(result.data.map((q) => q.id)).toEqual(["a", "b", "c"]);
    expect(result.meta).toMatchObject({ page: 0, size: 3, totalElements: 3, totalPages: 1, first: true, last: true, hasNext: false });
  });

  it("makes a single request when the first page is also the last one", async () => {
    api.listQuestions.mockResolvedValue(page([response()], 1));
    questionApi.useQuestions({}, 0, 1000);

    await opts().queryFn?.();

    expect(api.listQuestions).toHaveBeenCalledTimes(1);
  });

  it("does not use the load-all path for 999", async () => {
    api.listQuestions.mockResolvedValue(page([], 5));
    questionApi.useQuestions({}, 2, 999);

    await opts().queryFn?.();

    expect(api.listQuestions).toHaveBeenCalledTimes(1);
    expect(api.listQuestions).toHaveBeenCalledWith(hoisted.apiClient, {}, 2, 999);
  });
});

describe("useQuestionStats", () => {
  it("converts counts to strings and leaves notes empty", async () => {
    api.getQuestionStats.mockResolvedValue({ total: 10, listening: 2, reading: 3, writing: 4, speaking: 1, draft: 0 });
    questionApi.useQuestionStats();

    const stats = await opts().queryFn?.();

    expect(opts().queryKey).toEqual(QUESTION_STATS_QUERY_KEY);
    expect(stats).toMatchObject({ total: "10", listening: "2", reading: "3", writing: "4", speaking: "1", draft: "0", totalTrend: "", draftNote: "" });
  });
});

describe("single question and media preview", () => {
  it("useQuestion is disabled without an id", () => {
    questionApi.useQuestion("");
    expect(opts().enabled).toBe(false);

    questionApi.useQuestion("q1");
    expect(opts().enabled).toBe(true);
    expect(opts().queryKey).toEqual([...QUESTIONS_QUERY_KEY, "q1"]);
  });

  it("useMediaPreview is disabled for a missing id and retries once with a 30 second cache", async () => {
    questionApi.useMediaPreview(null);
    expect(opts().enabled).toBe(false);
    questionApi.useMediaPreview(undefined);
    expect(opts().enabled).toBe(false);

    questionApi.useMediaPreview("m1");
    await opts().queryFn?.();
    expect(opts().enabled).toBe(true);
    expect(opts().staleTime).toBe(30_000);
    expect(opts().retry).toBe(1);
    expect(api.getMediaPreview).toHaveBeenCalledWith(hoisted.apiClient, "m1");
  });
});

describe("mutations", () => {
  const simple: Array<[string, () => unknown, string, "onSuccess" | "onSettled"]> = [
    ["publish", () => questionApi.usePublishQuestion(), "publishQuestion", "onSuccess"],
    ["archive", () => questionApi.useArchiveQuestion(), "archiveQuestion", "onSettled"],
    ["delete", () => questionApi.useDeleteQuestion(), "deleteQuestion", "onSettled"],
    ["unarchive", () => questionApi.useUnarchiveQuestion(), "unarchiveQuestion", "onSuccess"],
    ["revision", () => questionApi.useCreateQuestionRevision(), "createQuestionRevision", "onSuccess"],
    ["submit for approval", () => questionApi.useSubmitQuestionApproval(), "submitQuestionApproval", "onSuccess"],
    ["approve", () => questionApi.useApproveQuestion(), "approveQuestion", "onSuccess"],
  ];

  it.each(simple)("%s calls its api with the question id", async (_name, hook, apiName) => {
    api[apiName].mockResolvedValue({});
    hook();

    await opts().mutationFn?.("q1" as never);

    expect(api[apiName]).toHaveBeenCalledWith(hoisted.apiClient, "q1");
  });

  it.each(simple)("%s refreshes the question list and the stats", (_name, hook, _apiName, callback) => {
    hook();

    opts()[callback]?.();

    const keys = hoisted.invalidate.mock.calls.map(([arg]) => (arg as { queryKey: unknown[] }).queryKey);
    expect(keys).toEqual([[...QUESTIONS_QUERY_KEY], [...QUESTION_STATS_QUERY_KEY]]);
  });

  it("archive and delete refresh even when the call fails, because they use onSettled", () => {
    questionApi.useArchiveQuestion();
    expect(opts().onSuccess).toBeUndefined();
    expect(opts().onSettled).toBeTypeOf("function");

    questionApi.useDeleteQuestion();
    expect(opts().onSuccess).toBeUndefined();
    expect(opts().onSettled).toBeTypeOf("function");
  });

  it("create sends the payload", async () => {
    api.createQuestion.mockResolvedValue({});
    questionApi.useCreateQuestion();

    await opts().mutationFn?.({ title: "New" } as never);

    expect(api.createQuestion).toHaveBeenCalledWith(hoisted.apiClient, { title: "New" });
  });

  it("update sends the id and the payload", async () => {
    api.updateQuestion.mockResolvedValue({});
    questionApi.useUpdateQuestion();

    await opts().mutationFn?.({ id: "q1", payload: { title: "Edited" } } as never);

    expect(api.updateQuestion).toHaveBeenCalledWith(hoisted.apiClient, "q1", { title: "Edited" });
  });

  it("reject sends the id and the reason", async () => {
    api.rejectQuestion.mockResolvedValue({});
    questionApi.useRejectQuestion();

    await opts().mutationFn?.({ id: "q1", reason: "Unclear audio" } as never);

    expect(api.rejectQuestion).toHaveBeenCalledWith(hoisted.apiClient, "q1", "Unclear audio");
  });
});
