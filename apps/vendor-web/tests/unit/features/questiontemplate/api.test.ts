import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  staleTime?: number;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  options: undefined as unknown,
  invalidate: vi.fn(),
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", () => new Proxy({}, {
  has: () => true,
  get: (_target, name: string) => (name === "__esModule" ? false : name === "then" ? undefined : hoisted.api[name]),
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

import * as templateApi from "../../../../features/questiontemplate/api";
import {
  QUESTION_TYPES_QUERY_KEY,
  SUPPORTED_QUESTION_TYPES_QUERY_KEY,
  SUPPORTED_TASK_TYPES_QUERY_KEY,
  TASK_TYPES_QUERY_KEY,
} from "../../../../features/questiontemplate/constants";

const opts = () => hoisted.options as Options;
const { api } = hoisted;

beforeEach(() => {
  hoisted.invalidate.mockReset();
});

describe("catalog queries", () => {
  it("question types are keyed by the activeOnly flag, which defaults to true", async () => {
    api.listQuestionTypes.mockResolvedValue([]);
    templateApi.useQuestionTypes();
    await opts().queryFn?.();

    expect(opts().queryKey).toEqual([...QUESTION_TYPES_QUERY_KEY, { activeOnly: true }]);
    expect(api.listQuestionTypes).toHaveBeenCalledWith(hoisted.apiClient, { activeOnly: true });

    templateApi.useQuestionTypes(false);
    await opts().queryFn?.();
    expect(api.listQuestionTypes).toHaveBeenLastCalledWith(hoisted.apiClient, { activeOnly: false });
  });

  it("task types use their own cache key so the two catalogs never share an entry", async () => {
    api.listTaskTypes.mockResolvedValue([]);
    templateApi.useTaskTypes(false);
    await opts().queryFn?.();

    expect(opts().queryKey).toEqual([...TASK_TYPES_QUERY_KEY, { activeOnly: false }]);
    expect(opts().queryKey).not.toEqual([...QUESTION_TYPES_QUERY_KEY, { activeOnly: false }]);
    expect(api.listTaskTypes).toHaveBeenCalledWith(hoisted.apiClient, { activeOnly: false });
  });

  it("supported type lists never go stale", async () => {
    templateApi.useSupportedQuestionTypes();
    await opts().queryFn?.();
    expect(opts().queryKey).toEqual(SUPPORTED_QUESTION_TYPES_QUERY_KEY);
    expect(opts().staleTime).toBe(Infinity);
    expect(api.listSupportedQuestionTypes).toHaveBeenCalledWith(hoisted.apiClient);

    templateApi.useSupportedTaskTypes();
    await opts().queryFn?.();
    expect(opts().queryKey).toEqual(SUPPORTED_TASK_TYPES_QUERY_KEY);
    expect(opts().staleTime).toBe(Infinity);
    expect(api.listSupportedTaskTypes).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("capabilities ask for active types only and stay fresh for a minute", async () => {
    templateApi.useTaskTypeCapabilities();
    await opts().queryFn?.();

    expect(opts().queryKey).toEqual([...SUPPORTED_TASK_TYPES_QUERY_KEY, "capabilities"]);
    expect(opts().staleTime).toBe(60_000);
    expect(api.listTaskTypeCapabilities).toHaveBeenCalledWith(hoisted.apiClient, { activeOnly: true });
  });
});

describe("useTaskTypeAvailability", () => {
  it("is enabled when a key or a display name is typed", () => {
    templateApi.useTaskTypeAvailability({ taskTypeKey: "SPEAK_X" });
    expect(opts().enabled).toBe(true);

    templateApi.useTaskTypeAvailability({ displayName: "Speak X" });
    expect(opts().enabled).toBe(true);
  });

  it("is disabled when nothing or only blanks were typed", () => {
    templateApi.useTaskTypeAvailability({});
    expect(opts().enabled).toBe(false);

    templateApi.useTaskTypeAvailability({ taskTypeKey: "   ", displayName: "  " });
    expect(opts().enabled).toBe(false);
  });

  it("checks the parameters it was given and debounces with a short cache time", async () => {
    const params = { taskTypeKey: "K", excludePublicId: "p1" };
    templateApi.useTaskTypeAvailability(params);

    await opts().queryFn?.();

    expect(opts().queryKey).toEqual(["taskTypeAvailability", params]);
    expect(opts().staleTime).toBe(300);
    expect(api.getTaskTypeAvailability).toHaveBeenCalledWith(hoisted.apiClient, params);
  });
});

describe("mutations", () => {
  const cases: Array<[string, () => unknown, string, unknown, unknown[]]> = [
    ["update question type", () => templateApi.useUpdateQuestionType(), "updateQuestionType", { publicId: "p", payload: { name: "N" } }, ["p", { name: "N" }]],
    ["update task type", () => templateApi.useUpdateTaskType(), "updateTaskType", { publicId: "p", payload: { name: "N" } }, ["p", { name: "N" }]],
    ["create question type", () => templateApi.useCreateQuestionType(), "createQuestionType", { payload: { name: "N" } }, [{ name: "N" }]],
    ["create task type", () => templateApi.useCreateTaskType(), "createTaskType", { payload: { name: "N" } }, [{ name: "N" }]],
    ["delete question type", () => templateApi.useDeleteQuestionType(), "deleteQuestionType", { publicId: "p" }, ["p"]],
    ["retire task type", () => templateApi.useRetireTaskType(), "deleteTaskType", { publicId: "p" }, ["p"]],
    ["submit task type for approval", () => templateApi.useSubmitTaskTypeApproval(), "submitTaskTypeApproval", "p", ["p"]],
    ["approve task type", () => templateApi.useApproveTaskType(), "approveTaskType", "p", ["p"]],
  ];

  it.each(cases)("%s calls its api with the right arguments", async (_name, hook, apiName, input, args) => {
    api[apiName].mockResolvedValue({});
    hook();

    await opts().mutationFn?.(input as never);

    expect(api[apiName]).toHaveBeenCalledWith(hoisted.apiClient, ...args);
  });

  it.each(cases)("%s refreshes all four catalog caches after success", (_name, hook) => {
    hook();

    opts().onSuccess?.();

    const keys = hoisted.invalidate.mock.calls.map(([arg]) => (arg as { queryKey: unknown[] }).queryKey);
    expect(keys).toEqual([
      [...QUESTION_TYPES_QUERY_KEY],
      [...TASK_TYPES_QUERY_KEY],
      [...SUPPORTED_QUESTION_TYPES_QUERY_KEY],
      [...SUPPORTED_TASK_TYPES_QUERY_KEY],
    ]);
  });
});
