import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  select?: (templates: Array<{ status: string; publicId: string }>) => unknown;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: (data: unknown, variables: never) => void;
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

import * as scoreApi from "../../../../features/scoretemplate/api";
import { SCORE_TEMPLATES_QUERY_KEY, SCORE_TEMPLATE_QUERY_KEY } from "../../../../features/scoretemplate/constants";

const opts = () => hoisted.options as Options;
const { api } = hoisted;
const invalidated = () => hoisted.invalidate.mock.calls.map(([arg]) => (arg as { queryKey: unknown[] }).queryKey);

beforeEach(() => {
  hoisted.invalidate.mockReset();
});

describe("queries", () => {
  it("lists templates under the list key", async () => {
    api.listScoreTemplates.mockResolvedValue([]);
    scoreApi.useScoreTemplates();

    await opts().queryFn?.();

    expect(opts().queryKey).toEqual(SCORE_TEMPLATES_QUERY_KEY);
    expect(api.listScoreTemplates).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("the active template is the only ACTIVE one of the shared list", () => {
    scoreApi.useActiveScoreTemplate();
    const templates = [
      { publicId: "a", status: "RETIRED" },
      { publicId: "b", status: "ACTIVE" },
      { publicId: "c", status: "DRAFT" },
    ];

    expect(opts().queryKey).toEqual(SCORE_TEMPLATES_QUERY_KEY);
    expect(opts().select?.(templates)).toEqual(templates[1]);
  });

  it("the active template is undefined when none is active", () => {
    scoreApi.useActiveScoreTemplate();

    expect(opts().select?.([{ publicId: "a", status: "DRAFT" }])).toBeUndefined();
  });

  it("detail and feasibility are keyed by id and disabled for an empty id", async () => {
    scoreApi.useScoreTemplate("t1");
    await opts().queryFn?.();
    expect(opts().queryKey).toEqual([...SCORE_TEMPLATE_QUERY_KEY, "t1"]);
    expect(opts().enabled).toBe(true);
    expect(api.getScoreTemplate).toHaveBeenCalledWith(hoisted.apiClient, "t1");

    scoreApi.useScoreTemplateFeasibility("t1");
    await opts().queryFn?.();
    expect(opts().queryKey).toEqual([...SCORE_TEMPLATE_QUERY_KEY, "t1", "feasibility"]);
    expect(api.getScoreTemplateFeasibility).toHaveBeenCalledWith(hoisted.apiClient, "t1");

    scoreApi.useScoreTemplate("");
    expect(opts().enabled).toBe(false);
    scoreApi.useScoreTemplateFeasibility("");
    expect(opts().enabled).toBe(false);
  });
});

describe("mutations that refresh only the list", () => {
  it.each([
    ["create", () => scoreApi.useCreateScoreTemplate(), "createScoreTemplate", { name: "T" }],
    ["clone", () => scoreApi.useCloneScoreTemplate(), "cloneScoreTemplate", "src"],
    ["delete", () => scoreApi.useDeleteScoreTemplate(), "deleteScoreTemplate", "t1"],
  ])("%s calls the api and refreshes the list only", async (_name, hook, apiName, input) => {
    api[apiName].mockResolvedValue({});
    hook();

    await opts().mutationFn?.(input as never);
    opts().onSuccess?.({}, input as never);

    expect(api[apiName]).toHaveBeenCalledWith(hoisted.apiClient, input);
    expect(invalidated()).toEqual([[...SCORE_TEMPLATES_QUERY_KEY]]);
  });
});

describe("mutations that refresh the list and one detail", () => {
  it("replace items sends id and payload then refreshes list and that template", async () => {
    api.replaceScoreTemplateItems.mockResolvedValue({});
    scoreApi.useReplaceScoreTemplateItems();

    await opts().mutationFn?.({ publicId: "t1", payload: { items: [] } } as never);
    opts().onSuccess?.({}, { publicId: "t1" } as never);

    expect(api.replaceScoreTemplateItems).toHaveBeenCalledWith(hoisted.apiClient, "t1", { items: [] });
    expect(invalidated()).toEqual([[...SCORE_TEMPLATES_QUERY_KEY], [...SCORE_TEMPLATE_QUERY_KEY, "t1"]]);
  });

  it.each([
    ["submit", () => scoreApi.useSubmitScoreTemplateApproval(), "submitScoreTemplateApproval"],
    ["approve", () => scoreApi.useApproveScoreTemplate(), "approveScoreTemplate"],
  ])("%s refreshes the list and the template it was called for", async (_name, hook, apiName) => {
    api[apiName].mockResolvedValue({});
    hook();

    await opts().mutationFn?.("t9" as never);
    opts().onSuccess?.({}, "t9" as never);

    expect(api[apiName]).toHaveBeenCalledWith(hoisted.apiClient, "t9");
    expect(invalidated()).toEqual([[...SCORE_TEMPLATES_QUERY_KEY], [...SCORE_TEMPLATE_QUERY_KEY, "t9"]]);
  });

  it("reject sends the reason payload and refreshes the list and the template", async () => {
    api.rejectScoreTemplate.mockResolvedValue({});
    scoreApi.useRejectScoreTemplate();

    await opts().mutationFn?.({ publicId: "t1", payload: { reason: "Weights" } } as never);
    opts().onSuccess?.({}, { publicId: "t1" } as never);

    expect(api.rejectScoreTemplate).toHaveBeenCalledWith(hoisted.apiClient, "t1", { reason: "Weights" });
    expect(invalidated()).toEqual([[...SCORE_TEMPLATES_QUERY_KEY], [...SCORE_TEMPLATE_QUERY_KEY, "t1"]]);
  });

  it("activate refreshes the list and every cached detail, because the previous active one changes too", async () => {
    api.activateScoreTemplate.mockResolvedValue({});
    scoreApi.useActivateScoreTemplate();

    await opts().mutationFn?.("t1" as never);
    opts().onSuccess?.({}, "t1" as never);

    expect(api.activateScoreTemplate).toHaveBeenCalledWith(hoisted.apiClient, "t1");
    expect(invalidated()).toEqual([[...SCORE_TEMPLATES_QUERY_KEY], [...SCORE_TEMPLATE_QUERY_KEY]]);
  });
});
