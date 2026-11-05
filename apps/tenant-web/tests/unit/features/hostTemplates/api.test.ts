import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => Promise<void> | void;
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
  useActivateHostTemplate,
  useCloneHostTemplate,
  useCreateHostTemplate,
  useDeleteHostTemplate,
  useHostTemplate,
  useHostTemplateFeasibility,
  useHostTemplates,
  useReplaceHostTemplateItems,
  useRetireHostTemplate,
  useSuggestSkillWeights,
} from "../../../../features/hostTemplates/api";
import { HOST_TEMPLATES_QUERY_KEY } from "../../../../features/hostTemplates/constants";

const query = () => hoisted.queryOptions!;
const lastMutation = () => hoisted.mutations[hoisted.mutations.length - 1];
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutations = [];
});

describe("Host Templates Queries", () => {
  it("useHostTemplates queries template list", async () => {
    api.listHostExamTemplates.mockResolvedValue([]);
    useHostTemplates();

    expect(query().queryKey).toEqual([HOST_TEMPLATES_QUERY_KEY]);
    await query().queryFn?.();
    expect(api.listHostExamTemplates).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("useHostTemplate queries single template", async () => {
    api.getHostExamTemplate.mockResolvedValue({ publicId: "tpl-1" });
    useHostTemplate("tpl-1");

    expect(query().queryKey).toEqual([HOST_TEMPLATES_QUERY_KEY, "tpl-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.getHostExamTemplate).toHaveBeenCalledWith(hoisted.apiClient, "tpl-1");
  });

  it("useHostTemplate stays disabled when publicId is empty", () => {
    useHostTemplate("");
    expect(query().enabled).toBe(false);
  });

  it("useHostTemplateFeasibility queries feasibility per task type", async () => {
    api.getHostExamTemplateFeasibility.mockResolvedValue({ tasks: [] });
    useHostTemplateFeasibility("tpl-1");

    expect(query().queryKey).toEqual([HOST_TEMPLATES_QUERY_KEY, "tpl-1", "feasibility"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.getHostExamTemplateFeasibility).toHaveBeenCalledWith(hoisted.apiClient, "tpl-1");
  });
});

describe("Host Templates Mutations", () => {
  it("useCreateHostTemplate creates template and refreshes", async () => {
    api.createHostExamTemplate.mockResolvedValue({ publicId: "tpl-new" });
    useCreateHostTemplate();

    await lastMutation().mutationFn?.("Custom Template" as never);
    expect(api.createHostExamTemplate).toHaveBeenCalledWith(hoisted.apiClient, {
      name: "Custom Template",
    });

    await lastMutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [HOST_TEMPLATES_QUERY_KEY],
    });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["activeScoreTemplate"],
    });
  });

  it("useCloneHostTemplate, useReplaceHostTemplateItems, useActivateHostTemplate, useRetireHostTemplate, useDeleteHostTemplate", async () => {
    api.cloneHostExamTemplate.mockResolvedValue({ publicId: "tpl-cloned" });
    useCloneHostTemplate();
    await lastMutation().mutationFn?.("tpl-1" as never);
    expect(api.cloneHostExamTemplate).toHaveBeenCalledWith(hoisted.apiClient, "tpl-1");
    await lastMutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: [HOST_TEMPLATES_QUERY_KEY] });

    hoisted.invalidateQueries.mockClear();
    api.replaceHostExamTemplateItems.mockResolvedValue({ publicId: "tpl-1" });
    useReplaceHostTemplateItems("tpl-1");
    const replacePayload = { items: [] };
    await lastMutation().mutationFn?.(replacePayload as never);
    expect(api.replaceHostExamTemplateItems).toHaveBeenCalledWith(hoisted.apiClient, "tpl-1", replacePayload);
    await lastMutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: [HOST_TEMPLATES_QUERY_KEY] });

    hoisted.invalidateQueries.mockClear();
    api.activateHostExamTemplate.mockResolvedValue({ publicId: "tpl-1", status: "ACTIVE" });
    useActivateHostTemplate();
    await lastMutation().mutationFn?.("tpl-1" as never);
    expect(api.activateHostExamTemplate).toHaveBeenCalledWith(hoisted.apiClient, "tpl-1");

    api.retireHostExamTemplate.mockResolvedValue({ publicId: "tpl-1", status: "RETIRED" });
    useRetireHostTemplate();
    await lastMutation().mutationFn?.("tpl-1" as never);
    expect(api.retireHostExamTemplate).toHaveBeenCalledWith(hoisted.apiClient, "tpl-1");

    api.deleteHostExamTemplate.mockResolvedValue(undefined);
    useDeleteHostTemplate();
    await lastMutation().mutationFn?.("tpl-1" as never);
    expect(api.deleteHostExamTemplate).toHaveBeenCalledWith(hoisted.apiClient, "tpl-1");
  });

  it("useSuggestSkillWeights previews suggested skill weights", async () => {
    api.suggestHostSkillWeights.mockResolvedValue({ suggestions: [] });
    useSuggestSkillWeights();

    const payload = { targetSkill: "SPEAKING" };
    await lastMutation().mutationFn?.(payload as never);
    expect(api.suggestHostSkillWeights).toHaveBeenCalledWith(hoisted.apiClient, payload);
  });
});

