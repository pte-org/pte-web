import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: (ctx?: { pageParam?: string }) => Promise<unknown>;
  enabled?: boolean;
  staleTime?: number;
  select?: (data: never) => unknown;
  getNextPageParam?: (last: { cursor: string | null }) => unknown;
  initialPageParam?: unknown;
  refetchInterval?: unknown;
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  options: undefined as unknown,
  session: undefined as unknown,
  claims: undefined as unknown,
  polling: vi.fn(),
  invalidate: vi.fn(),
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/ui", () => ({ useSessionManager: () => ({ session: hoisted.session }) }));
vi.mock("../../../../features/proctor/hooks/usePollingInterval", () => ({ usePollingInterval: hoisted.polling }));
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
  useInfiniteQuery: (options: unknown) => {
    hoisted.options = options;
    return {};
  },
  useMutation: (options: unknown) => {
    hoisted.options = options;
    return {};
  },
  useQueryClient: () => ({ invalidateQueries: hoisted.invalidate }),
}));

import * as proctorApi from "../../../../features/proctor/api";
import { POLL_INTERVAL_MS } from "../../../../features/proctor/constants";

const opts = () => hoisted.options as Options;
const api = hoisted.api;

beforeEach(() => {
  hoisted.session = { tenantId: "t1", accessToken: "token" };
  hoisted.claims = { sub: "u1" };
  hoisted.polling.mockReset();
  hoisted.polling.mockReturnValue({ refetchInterval: 1234, refetchIntervalInBackground: false });
  hoisted.invalidate.mockReset();
});

describe("useProctorWorkspaceOverview", () => {
  it("loads the overview for the signed-in actor in the given timezone", async () => {
    api.getProctorWorkspaceOverview.mockResolvedValue({});
    proctorApi.useProctorWorkspaceOverview("Asia/Ho_Chi_Minh");

    await opts().queryFn?.();

    expect(opts().queryKey).toEqual(["proctor", "t1", "u1", "overview", "Asia/Ho_Chi_Minh"]);
    expect(opts().enabled).toBe(true);
    expect(opts().staleTime).toBe(30_000);
    expect(api.getProctorWorkspaceOverview).toHaveBeenCalledWith(hoisted.apiClient, "Asia/Ho_Chi_Minh");
  });

  it("stays disabled and uses a neutral key without a timezone, a session or a token subject", () => {
    proctorApi.useProctorWorkspaceOverview(null);
    expect(opts().enabled).toBe(false);
    expect(opts().queryKey).toEqual(["proctor", "unauthenticated", "overview"]);

    hoisted.session = undefined;
    proctorApi.useProctorWorkspaceOverview("UTC");
    expect(opts().enabled).toBe(false);

    hoisted.session = { tenantId: "t1", accessToken: "token" };
    hoisted.claims = undefined;
    proctorApi.useProctorWorkspaceOverview("UTC");
    expect(opts().enabled).toBe(false);
  });
});

describe("useAssignedProctorSessions", () => {
  it("accepts the legacy page and size arguments", async () => {
    api.listAssignedProctorSessions.mockResolvedValue({});
    proctorApi.useAssignedProctorSessions(2, 5);

    await opts().queryFn?.();

    expect(api.listAssignedProctorSessions).toHaveBeenCalledWith(hoisted.apiClient, 2, 5, {
      scope: undefined, sort: undefined, timezone: undefined,
    });
    expect(opts().queryKey).toEqual(["proctor", "t1", "u1", "assignments", "mine", { page: 2, size: 5 }]);
  });

  it("defaults to the first page of 20 when called without arguments", async () => {
    api.listAssignedProctorSessions.mockResolvedValue({});
    proctorApi.useAssignedProctorSessions();

    await opts().queryFn?.();

    expect(api.listAssignedProctorSessions).toHaveBeenCalledWith(hoisted.apiClient, 0, 20, expect.any(Object));
  });

  it("waits for a timezone when the scope is TODAY", () => {
    proctorApi.useAssignedProctorSessions({ scope: "TODAY" });
    expect(opts().enabled).toBe(false);

    proctorApi.useAssignedProctorSessions({ scope: "TODAY", timezone: "Asia/Ho_Chi_Minh" });
    expect(opts().enabled).toBe(true);
  });

  it("does not need a timezone for other scopes", () => {
    proctorApi.useAssignedProctorSessions({ scope: "ACCESSIBLE" });

    expect(opts().enabled).toBe(true);
  });

  it("is disabled without a session", () => {
    hoisted.session = undefined;
    proctorApi.useAssignedProctorSessions({});

    expect(opts().enabled).toBe(false);
    expect(opts().queryKey).toEqual(["proctor", "unauthenticated", "assignments"]);
  });
});

describe("session scoped queries", () => {
  it("monitoring snapshot polls only when asked to", async () => {
    api.getMonitoringSnapshot.mockResolvedValue({});
    proctorApi.useMonitoringSnapshot("s1", 1, 10, { poll: true });
    await opts().queryFn?.();

    expect(hoisted.polling).toHaveBeenCalledWith({ intervalMs: POLL_INTERVAL_MS });
    expect(opts().refetchInterval).toBe(1234);
    expect(api.getMonitoringSnapshot).toHaveBeenCalledWith(hoisted.apiClient, "s1", 1, 10);

    proctorApi.useMonitoringSnapshot("s1");
    expect(hoisted.polling).toHaveBeenLastCalledWith({ intervalMs: 0 });
  });

  it("every session query is disabled for an empty session id", () => {
    const calls: Array<() => unknown> = [
      () => proctorApi.useMonitoringSnapshot(""),
      () => proctorApi.useStudentAttemptHistory("", "stu"),
      () => proctorApi.useProctorViolations(""),
      () => proctorApi.useProctorSecurityAudit(""),
      () => proctorApi.useProctorLiveAttempts(""),
      () => proctorApi.useProctorAuditLog(""),
      () => proctorApi.useAttendanceRoster(""),
      () => proctorApi.useAttendanceHistory("", "stu"),
      () => proctorApi.useHostAttendanceRoster(""),
      () => proctorApi.useHostAttendanceHistory("", "stu"),
      () => proctorApi.useIncidentsList(""),
      () => proctorApi.useIncidentDetail("", "inc"),
      () => proctorApi.useIncidentHistory("", "inc"),
    ];
    for (const call of calls) {
      call();
      expect(opts().enabled).toBe(false);
    }
  });

  it("queries that also need a student or incident id stay disabled without it", () => {
    for (const call of [
      () => proctorApi.useStudentAttemptHistory("s1", ""),
      () => proctorApi.useAttendanceHistory("s1", ""),
      () => proctorApi.useHostAttendanceHistory("s1", ""),
      () => proctorApi.useIncidentDetail("s1", ""),
      () => proctorApi.useIncidentHistory("s1", ""),
    ]) {
      call();
      expect(opts().enabled).toBe(false);
    }
  });

  it("student attempt history, violations and incidents call the matching api with their ids", async () => {
    proctorApi.useStudentAttemptHistory("s1", "stu", 2, 5);
    await opts().queryFn?.();
    expect(api.getStudentAttemptHistory).toHaveBeenCalledWith(hoisted.apiClient, "s1", "stu", 2, 5);

    proctorApi.useProctorViolations("s1");
    await opts().queryFn?.();
    expect(api.listViolations).toHaveBeenCalledWith(hoisted.apiClient, "s1");

    proctorApi.useIncidentsList("s1", { status: "OPEN" });
    await opts().queryFn?.();
    expect(api.listIncidents).toHaveBeenCalledWith(hoisted.apiClient, "s1", { status: "OPEN" });

    proctorApi.useIncidentDetail("s1", "inc");
    await opts().queryFn?.();
    expect(api.getIncident).toHaveBeenCalledWith(hoisted.apiClient, "s1", "inc");

    proctorApi.useIncidentHistory("s1", "inc");
    await opts().queryFn?.();
    expect(api.getIncidentHistory).toHaveBeenCalledWith(hoisted.apiClient, "s1", "inc");
  });

  it("host attendance uses its own key space, separate from the proctor attendance", () => {
    proctorApi.useHostAttendanceRoster("s1", { status: "PRESENT" } as never);
    expect(opts().queryKey).toEqual(["host", "attendance", "s1", { status: "PRESENT" }]);

    proctorApi.useHostAttendanceHistory("s1", "stu", 1, 5);
    expect(opts().queryKey).toEqual(["host", "attendance", "s1", "history", "stu", 1, 5]);

    proctorApi.useAttendanceRoster("s1");
    expect(opts().queryKey).toEqual(["proctor", "attendance", "s1"]);
  });
});

describe("useProctorSecurityAudit", () => {
  it("maps provider entries to audit rows and builds the description from source and severity when no detail", async () => {
    api.getProctorSecurityAudit.mockResolvedValue({
      entries: [
        { publicId: "a", detectedAt: "2026-01-01T00:00:00Z", violationType: "TAB_SWITCH", detail: "Left the window", source: "CLIENT", severity: "HIGH" },
        { publicId: "b", detectedAt: "2026-01-01T00:01:00Z", violationType: "COPY", source: "SERVER", severity: "LOW" },
      ],
      nextCursor: "next",
    });
    proctorApi.useProctorSecurityAudit("s1", 2);

    const page = (await opts().queryFn?.({ pageParam: "cur" })) as { items: unknown[]; cursor: string; hasNext: boolean };

    expect(api.getProctorSecurityAudit).toHaveBeenCalledWith(hoisted.apiClient, "s1", 2, "cur");
    expect(page.items).toEqual([
      { publicId: "a", recordedAt: "2026-01-01T00:00:00Z", eventType: "TAB_SWITCH", description: "Left the window" },
      { publicId: "b", recordedAt: "2026-01-01T00:01:00Z", eventType: "COPY", description: "SERVER - LOW" },
    ]);
    expect(page.cursor).toBe("next");
    expect(page.hasNext).toBe(true);
  });

  it("falls back to the items field and reports no next page when the cursor is empty", async () => {
    api.getProctorSecurityAudit.mockResolvedValue({
      items: [{ publicId: "a", detectedAt: "d", violationType: "X", source: "S", severity: "L" }],
      nextCursor: null,
    });
    proctorApi.useProctorSecurityAudit("s1");

    const page = (await opts().queryFn?.({})) as { hasNext: boolean; items: unknown[] };

    expect(page.hasNext).toBe(false);
    expect(page.items).toHaveLength(1);
  });

  it("returns an empty page when the response carries no entries at all", async () => {
    api.getProctorSecurityAudit.mockResolvedValue({ nextCursor: null });
    proctorApi.useProctorSecurityAudit("s1");

    await expect(opts().queryFn?.({})).resolves.toMatchObject({ items: [], hasNext: false });
  });

  it("asks for the next page with the last cursor and stops when it is null", () => {
    proctorApi.useProctorSecurityAudit("s1");

    expect(opts().initialPageParam).toBeUndefined();
    expect(opts().getNextPageParam?.({ cursor: "c2" })).toBe("c2");
    expect(opts().getNextPageParam?.({ cursor: null })).toBeUndefined();
  });
});

describe("useProctorLiveAttempts", () => {
  const select = (students: unknown[]) => {
    proctorApi.useProctorLiveAttempts("s1");
    return opts().select?.({ students: { data: students } } as never) as Array<Record<string, unknown>>;
  };

  it("maps SUBMITTED to COMPLETED, IN_PROGRESS to IN_PROGRESS and anything else to PENDING", () => {
    const rows = select([
      { studentPublicId: "a", displayName: "A", status: "SUBMITTED", manualViolationCount: 0, attemptCount: 1 },
      { studentPublicId: "b", displayName: "B", status: "IN_PROGRESS", manualViolationCount: 0, attemptCount: 0 },
      { studentPublicId: "c", displayName: "C", status: "NOT_STARTED", manualViolationCount: 0, attemptCount: 0 },
    ]);

    expect(rows.map((row) => row.status)).toEqual(["COMPLETED", "IN_PROGRESS", "PENDING"]);
  });

  it("flags a student with at least one manual violation and uses the student id when there is no attempt id", () => {
    const [flagged, clean] = select([
      { studentPublicId: "a", displayName: "A", status: "IN_PROGRESS", manualViolationCount: 1, attemptCount: 2 },
      { studentPublicId: "b", attemptPublicId: "att-b", displayName: "B", status: "IN_PROGRESS", manualViolationCount: 0, attemptCount: 0 },
    ]);

    expect(flagged).toMatchObject({ flagged: true, attemptPublicId: "a", notesCount: 2 });
    expect(clean).toMatchObject({ flagged: false, attemptPublicId: "att-b" });
  });

  it("returns an empty list when the snapshot has no student data", () => {
    proctorApi.useProctorLiveAttempts("s1");

    expect(opts().select?.({ students: {} } as never)).toEqual([]);
  });

  it("polls on the standard interval", () => {
    proctorApi.useProctorLiveAttempts("s1");

    expect(hoisted.polling).toHaveBeenCalledWith({ intervalMs: POLL_INTERVAL_MS });
  });
});

describe("useProctorAuditLog", () => {
  const select = (violations: unknown[]) => {
    proctorApi.useProctorAuditLog("s1");
    return opts().select?.(violations as never) as { items: Array<Record<string, unknown>>; totalItems: number; totalPages: number };
  };

  it("maps violations to audit rows with a shortened proctor label", () => {
    const result = select([
      { publicId: "v1", attemptPublicId: "att", proctorPublicId: "abcdef123456", detail: "Phone seen", detectedAt: "2026-02-02T00:00:00Z" },
    ]);

    expect(result.items[0]).toMatchObject({
      publicId: "v1", action: "FLAG_VIOLATION", sessionPublicId: "s1", note: "Phone seen",
      createdAt: "2026-02-02T00:00:00Z",
      performedBy: { publicId: "abcdef123456", fullName: "Proctor #ABCDEF12", email: "" },
    });
    expect(result.totalItems).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("uses a dash for an unknown proctor, falls back to note and prefers the violation own session", () => {
    const result = select([{ publicId: "v1", sessionPublicId: "other", note: "n", createdAt: "2026-03-03T00:00:00Z" }]);

    expect(result.items[0]).toMatchObject({ sessionPublicId: "other", note: "n", createdAt: "2026-03-03T00:00:00Z" });
    expect(result.items[0].performedBy).toMatchObject({ publicId: "", fullName: "—" });
  });

  it("reports an empty page for no violations", () => {
    const result = select([]);

    expect(result.items).toEqual([]);
    expect(result.totalItems).toBe(0);
  });
});

describe("attendance and incident mutations", () => {
  it("record attendance sends the student and request, then refreshes that session roster", async () => {
    api.recordAttendance.mockResolvedValue({});
    proctorApi.useRecordAttendanceMutation("s1");

    await opts().mutationFn?.({ studentPublicId: "stu", request: { status: "PRESENT" } } as never);
    opts().onSuccess?.();

    expect(api.recordAttendance).toHaveBeenCalledWith(hoisted.apiClient, "s1", "stu", { status: "PRESENT" });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["proctor", "attendance", "s1"] });
  });

  it("record identity verification refreshes the proctor roster", async () => {
    api.recordIdentityVerification.mockResolvedValue({});
    proctorApi.useRecordIdentityVerificationMutation("s1");

    await opts().mutationFn?.({ studentPublicId: "stu", request: { verified: true } } as never);
    opts().onSuccess?.();

    expect(api.recordIdentityVerification).toHaveBeenCalledWith(hoisted.apiClient, "s1", "stu", { verified: true });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["proctor", "attendance", "s1"] });
  });

  it("host attendance mutations refresh the host roster, not the proctor one", async () => {
    api.recordHostAttendance.mockResolvedValue({});
    proctorApi.useRecordHostAttendanceMutation("s1");
    await opts().mutationFn?.({ studentPublicId: "stu", request: {} } as never);
    opts().onSuccess?.();
    expect(api.recordHostAttendance).toHaveBeenCalledWith(hoisted.apiClient, "s1", "stu", {});
    expect(hoisted.invalidate).toHaveBeenLastCalledWith({ queryKey: ["host", "attendance", "s1"] });

    api.recordHostIdentityVerification.mockResolvedValue({});
    proctorApi.useRecordHostIdentityVerificationMutation("s1");
    await opts().mutationFn?.({ studentPublicId: "stu", request: {} } as never);
    opts().onSuccess?.();
    expect(api.recordHostIdentityVerification).toHaveBeenCalledWith(hoisted.apiClient, "s1", "stu", {});
    expect(hoisted.invalidate).toHaveBeenLastCalledWith({ queryKey: ["host", "attendance", "s1"] });
  });

  it("creating an incident refreshes the incident list of the session", async () => {
    api.createIncident.mockResolvedValue({});
    proctorApi.useCreateIncidentMutation("s1");

    await opts().mutationFn?.({ title: "Noise" } as never);
    opts().onSuccess?.();

    expect(api.createIncident).toHaveBeenCalledWith(hoisted.apiClient, "s1", { title: "Noise" });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["proctor", "incidents", "s1"] });
  });

  it("changing an incident status refreshes its detail, its history and the list", async () => {
    api.updateIncidentStatus.mockResolvedValue({});
    proctorApi.useUpdateIncidentStatusMutation("s1", "inc");

    await opts().mutationFn?.({ status: "RESOLVED" } as never);
    opts().onSuccess?.();

    expect(api.updateIncidentStatus).toHaveBeenCalledWith(hoisted.apiClient, "s1", "inc", { status: "RESOLVED" });
    const keys = hoisted.invalidate.mock.calls.map(([arg]) => (arg as { queryKey: string[] }).queryKey);
    expect(keys).toEqual([
      ["proctor", "incidents", "s1", "inc"],
      ["proctor", "incidents", "s1", "inc", "history"],
      ["proctor", "incidents", "s1"],
    ]);
  });
});
