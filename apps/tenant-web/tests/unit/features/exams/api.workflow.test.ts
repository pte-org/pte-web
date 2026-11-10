import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: (result: unknown) => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  queryOptions: undefined as QueryOptions | undefined,
  mutationOptions: undefined as MutationOptions | undefined,
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
  hostTemplates: [] as Array<{ publicId: string; status: string; name: string }>,
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@/features/hostTemplates/api", () => ({
  useHostTemplates: () => ({ data: hoisted.hostTemplates }),
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
    return { data: undefined, error: undefined };
  },
  useMutation: (options: MutationOptions) => {
    hoisted.mutationOptions = options;
    return {};
  },
}));

import {
  useActiveScoreTemplate,
  useCreateExamWorkflow,
  useSelectableTemplates,
} from "../../../../features/exams/api";
import {
  OFFICIAL_EXAM_LOCKDOWN_MODE,
  SESSIONS_QUERY_KEY,
} from "../../../../features/exams/constants";
import { HOST_DASHBOARD_QUERY_KEY } from "../../../../features/hostDashboard/constants";

const query = () => hoisted.queryOptions!;
const mutation = () => hoisted.mutationOptions!;
const api = hoisted.api;

const sampleDraft = {
  publicId: "draft-1",
  sessionCode: "CODE-D1",
  name: "Draft 1",
  policy: { lockdownMode: OFFICIAL_EXAM_LOCKDOWN_MODE },
};

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutationOptions = undefined;
  hoisted.hostTemplates = [];
});

describe("useActiveScoreTemplate", () => {
  it("queries active score template", async () => {
    api.getActiveScoreTemplate.mockResolvedValue({ publicId: "tpl-default" });
    useActiveScoreTemplate();

    expect(query().queryKey).toEqual(["activeScoreTemplate"]);
    await query().queryFn?.();
    expect(api.getActiveScoreTemplate).toHaveBeenCalledWith(hoisted.apiClient);
  });
});

describe("useSelectableTemplates", () => {
  it("merges active host templates with default platform template", () => {
    hoisted.hostTemplates = [
      { publicId: "tpl-1", status: "ACTIVE", name: "Host Tpl 1" },
      { publicId: "tpl-2", status: "RETIRED", name: "Host Tpl 2" },
    ];

    const result = useSelectableTemplates();
    expect(result.templates).toEqual([
      { publicId: "tpl-1", status: "ACTIVE", name: "Host Tpl 1" },
    ]);
  });
});

describe("useCreateExamWorkflow", () => {
  it("runs the full workflow: draft -> audience -> preflight -> generate -> publish", async () => {
    useCreateExamWorkflow();

    api.createExamDraft.mockResolvedValue(sampleDraft);
    api.addAudienceSources.mockResolvedValue(undefined);
    api.preflightExam.mockResolvedValue({
      ready: true,
      issues: [],
      examDefinition: { slots: [] },
      audience: { members: [] },
    });
    api.generateExam.mockResolvedValue(undefined);
    api.publishExam.mockResolvedValue({
      ...sampleDraft,
      status: "SCHEDULED",
    });

    const input = {
      name: "Workflow Exam",
      templatePublicId: "tpl-1",
      subscriptionPublicId: "sub-1",
      opensAt: "2026-11-01T10:00:00Z",
      closesAt: "2026-11-01T12:00:00Z",
      maxRetriesPerStudent: 0,
      reusePolicy: "NEW",
      seriesKey: "",
      capacity: 50,
      sources: [{ type: "CLASS", sourcePublicId: "cls-1" }],
    };

    const res = (await mutation().mutationFn?.(input as never)) as { id: string; status: string };
    expect(res.id).toBe("draft-1");
    expect(api.createExamDraft).toHaveBeenCalled();
    expect(api.addAudienceSources).toHaveBeenCalledWith(hoisted.apiClient, "draft-1", input.sources);
    expect(api.preflightExam).toHaveBeenCalledWith(hoisted.apiClient, "draft-1");
    expect(api.generateExam).toHaveBeenCalled();
    expect(api.publishExam).toHaveBeenCalledWith(hoisted.apiClient, "draft-1");

    mutation().onSuccess?.(res);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(SESSIONS_QUERY_KEY, expect.any(Function));
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: SESSIONS_QUERY_KEY });
  });

  it("throws when preflight check is not ready", async () => {
    useCreateExamWorkflow();

    api.createExamDraft.mockResolvedValue(sampleDraft);
    api.addAudienceSources.mockResolvedValue(undefined);
    api.preflightExam.mockResolvedValue({
      ready: false,
      issues: ["NOT_ENOUGH_QUESTIONS"],
      examDefinition: { slots: [] },
      audience: { members: [] },
    });

    const input = {
      name: "Blocked Exam",
      templatePublicId: "tpl-1",
      subscriptionPublicId: "sub-1",
      opensAt: "2026-11-01T10:00:00Z",
      closesAt: "2026-11-01T12:00:00Z",
      maxRetriesPerStudent: 0,
      reusePolicy: "NEW",
      seriesKey: "",
      capacity: 50,
      sources: [],
    };

    await expect(mutation().mutationFn?.(input as never)).rejects.toThrow();
  });
});

