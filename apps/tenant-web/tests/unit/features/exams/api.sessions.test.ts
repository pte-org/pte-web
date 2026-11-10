import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  refetchInterval?: ((query: { state: { data?: { status?: string } } }) => number | false) | number | false;
  staleTime?: number;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: (result: unknown, variables?: unknown) => void;
  onError?: (error: unknown) => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  queryOptions: undefined as QueryOptions | undefined,
  mutationOptions: undefined as MutationOptions | undefined,
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
  removeQueries: vi.fn(),
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
    setQueryData: hoisted.setQueryData,
    removeQueries: hoisted.removeQueries,
  }),
  useQuery: (options: QueryOptions) => {
    hoisted.queryOptions = options;
    return {};
  },
  useMutation: (options: MutationOptions) => {
    hoisted.mutationOptions = options;
    return {};
  },
}));

import {
  useCancelSession,
  useCloseSession,
  useCreateSession,
  useDeleteSession,
  useOpenSession,
  useSession,
  useSessionExamPreview,
  useSessions,
  useTransitionExamStatus,
  useUpdateExamDraft,
  useUpdateExamPolicy,
  useUpdateExamSchedule,
} from "../../../../features/exams/api";
import {
  EXAM_PREVIEW_QUERY_KEY,
  SESSION_QUERY_KEY,
  SESSIONS_QUERY_KEY,
} from "../../../../features/exams/constants";
import { HOST_DASHBOARD_QUERY_KEY } from "../../../../features/hostDashboard/constants";

const query = () => hoisted.queryOptions!;
const mutation = () => hoisted.mutationOptions!;
const api = hoisted.api;

const sampleSessionResponse = {
  publicId: "ses-1",
  sessionCode: "CODE-1",
  name: "Session 1",
  subscriptionPublicId: "sub-1",
  examVersionPublicId: "ev-1",
  opensAt: "2026-11-01T00:00:00Z",
  closesAt: "2026-11-02T00:00:00Z",
  status: "OPEN" as const,
  capacity: 20,
  examDefinitionPublicId: "def-1",
  examDefinitionVersion: 1,
  reusePolicy: "NEW",
  seriesKey: null,
  draftVersion: 1,
  examMode: "OFFICIAL",
  policy: { lockdownMode: "STANDARD" },
  selectedSkills: ["SPEAKING"],
  maxRetriesPerStudent: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutationOptions = undefined;
});

describe("useSessions and useSession", () => {
  it("useSessions queries all sessions and maps response", async () => {
    api.listSessions.mockResolvedValue([sampleSessionResponse]);
    useSessions();

    expect(query().queryKey).toEqual(SESSIONS_QUERY_KEY);
    const result = (await query().queryFn?.()) as Array<{ id: string; name: string }>;
    expect(result[0].id).toBe("ses-1");
    expect(result[0].name).toBe("Session 1");
    expect(api.listSessions).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("useSession keys by publicId and handles polling interval", async () => {
    api.getSession.mockResolvedValue(sampleSessionResponse);
    useSession("ses-1");

    expect(query().queryKey).toEqual([...SESSION_QUERY_KEY, "ses-1"]);
    expect(query().enabled).toBe(true);
    const intervalFn = query().refetchInterval as (q: { state: { data?: { status?: string } } }) => number | false;
    expect(intervalFn({ state: { data: { status: "OPEN" } } })).toBe(30_000);
    expect(intervalFn({ state: { data: { status: "SCHEDULED" } } })).toBe(30_000);
    expect(intervalFn({ state: { data: { status: "CLOSED" } } })).toBe(false);

    const result = (await query().queryFn?.()) as { id: string };
    expect(result.id).toBe("ses-1");
    expect(api.getSession).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
  });

  it("useSession stays disabled when publicId is empty", () => {
    useSession("");
    expect(query().enabled).toBe(false);
  });
});

describe("useSessionExamPreview", () => {
  it("queries session preview when enabled", async () => {
    api.getSessionExamPreview.mockResolvedValue({ previewUrl: "url" });
    useSessionExamPreview("ses-1", true);

    expect(query().queryKey).toEqual([...EXAM_PREVIEW_QUERY_KEY, "ses-1"]);
    expect(query().enabled).toBe(true);
    expect(query().staleTime).toBe(240_000);

    await query().queryFn?.();
    expect(api.getSessionExamPreview).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
  });

  it("stays disabled when enabled flag is false", () => {
    useSessionExamPreview("ses-1", false);
    expect(query().enabled).toBe(false);
  });
});

describe("Draft and Policy Mutations", () => {
  it("useUpdateExamDraft patches draft and updates session cache on success", async () => {
    api.patchExamDraft.mockResolvedValue(sampleSessionResponse);
    useUpdateExamDraft("ses-1");

    const res = await mutation().mutationFn?.({ name: "Updated" } as never);
    expect(api.patchExamDraft).toHaveBeenCalledWith(hoisted.apiClient, "ses-1", { name: "Updated" });
    expect((res as { id: string }).id).toBe("ses-1");

    mutation().onSuccess?.(res);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(SESSIONS_QUERY_KEY, expect.any(Function));
    expect(hoisted.setQueryData).toHaveBeenCalledWith([...SESSION_QUERY_KEY, "ses-1"], res);

    mutation().onError?.(new Error("fail"));
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...SESSION_QUERY_KEY, "ses-1"],
    });
  });

  it("useUpdateExamPolicy patches policy and updates session cache", async () => {
    const samplePolicy = { lockdownMode: "STRICT" };
    api.patchExamPolicy.mockResolvedValue(samplePolicy);
    useUpdateExamPolicy("ses-1");

    const res = await mutation().mutationFn?.(samplePolicy as never);
    expect(api.patchExamPolicy).toHaveBeenCalledWith(hoisted.apiClient, "ses-1", samplePolicy);

    mutation().onSuccess?.(res);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(SESSIONS_QUERY_KEY, expect.any(Function));
    expect(hoisted.setQueryData).toHaveBeenCalledWith([...SESSION_QUERY_KEY, "ses-1"], expect.any(Function));

    mutation().onError?.(new Error("fail"));
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...SESSION_QUERY_KEY, "ses-1"],
    });
  });

  it("useUpdateExamSchedule patches schedule and updates cache", async () => {
    api.patchExamSchedule.mockResolvedValue(sampleSessionResponse);
    useUpdateExamSchedule("ses-1");

    const payload = { opensAt: "2026-11-05T00:00:00Z" };
    const res = await mutation().mutationFn?.(payload as never);
    expect(api.patchExamSchedule).toHaveBeenCalledWith(hoisted.apiClient, "ses-1", payload);

    mutation().onSuccess?.(res);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(SESSIONS_QUERY_KEY, expect.any(Function));
    expect(hoisted.setQueryData).toHaveBeenCalledWith([...SESSION_QUERY_KEY, "ses-1"], res);

    mutation().onError?.(new Error("fail"));
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...SESSION_QUERY_KEY, "ses-1"],
    });
  });
});

describe("Session Lifecycle Mutations", () => {
  it("useCreateSession calls createSession and updates cache and invalidates", async () => {
    api.createSession.mockResolvedValue(sampleSessionResponse);
    useCreateSession();

    const input = {
      name: " New Session ",
      subscriptionPublicId: "sub-1",
      skills: ["SPEAKING"],
      opensAt: "2026-11-01T00:00:00Z",
      closesAt: "2026-11-02T00:00:00Z",
      capacity: 30,
    };
    const res = (await mutation().mutationFn?.(input as never)) as { id: string };
    expect(api.createSession).toHaveBeenCalledWith(hoisted.apiClient, {
      name: "New Session",
      subscriptionPublicId: "sub-1",
      skills: ["SPEAKING"],
      opensAt: new Date("2026-11-01T00:00:00Z").toISOString(),
      closesAt: new Date("2026-11-02T00:00:00Z").toISOString(),
      capacity: 30,
    });
    expect(res.id).toBe("ses-1");

    mutation().onSuccess?.(res);
    expect(hoisted.setQueryData).toHaveBeenCalledWith(SESSIONS_QUERY_KEY, expect.any(Function));
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: SESSIONS_QUERY_KEY });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({ queryKey: HOST_DASHBOARD_QUERY_KEY });
  });

  it("useOpenSession, useCloseSession, and useCancelSession perform state changes", async () => {
    api.openSession.mockResolvedValue(sampleSessionResponse);
    useOpenSession("ses-1");
    await mutation().mutationFn?.(undefined as never);
    expect(api.openSession).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");

    api.closeSession.mockResolvedValue(sampleSessionResponse);
    useCloseSession("ses-1");
    await mutation().mutationFn?.(undefined as never);
    expect(api.closeSession).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");

    api.cancelExam.mockResolvedValue(sampleSessionResponse);
    useCancelSession("ses-1");
    await mutation().mutationFn?.(undefined as never);
    expect(api.cancelExam).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
  });

  it("useTransitionExamStatus executes open, close, cancel, and publish", async () => {
    api.openSession.mockResolvedValue(sampleSessionResponse);
    useTransitionExamStatus("ses-1");
    await mutation().mutationFn?.("OPEN" as never);
    expect(api.openSession).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");

    api.closeSession.mockResolvedValue(sampleSessionResponse);
    await mutation().mutationFn?.("CLOSED" as never);
    expect(api.closeSession).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");

    api.cancelExam.mockResolvedValue(sampleSessionResponse);
    await mutation().mutationFn?.("CANCELLED" as never);
    expect(api.cancelExam).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");

    api.preflightExam.mockResolvedValue({
      ready: true,
      issues: [],
      examDefinition: { slots: [] },
      audience: { members: [] },
    });
    api.generateExam.mockResolvedValue(undefined);
    api.getSession.mockResolvedValue(sampleSessionResponse);
    await mutation().mutationFn?.("READY" as never);
    expect(api.preflightExam).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
    expect(api.generateExam).toHaveBeenCalled();
  });

  it("useDeleteSession removes session from cache", async () => {
    api.deleteSession.mockResolvedValue(undefined);
    useDeleteSession();

    await mutation().mutationFn?.("ses-1" as never);
    expect(api.deleteSession).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");

    mutation().onSuccess?.(undefined, "ses-1");
    expect(hoisted.setQueryData).toHaveBeenCalledWith(SESSIONS_QUERY_KEY, expect.any(Function));
    expect(hoisted.removeQueries).toHaveBeenCalledWith({
      queryKey: [...SESSION_QUERY_KEY, "ses-1"],
    });
  });
});
