import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  staleTime?: number;
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
  it("the assigned session behind the header is polled so status changes show", async () => {
    api.getMyProctorAssignment.mockResolvedValue({});
    proctorApi.useMyProctorAssignment("s1");
    await opts().queryFn?.();

    expect(hoisted.polling).toHaveBeenCalledWith({ intervalMs: POLL_INTERVAL_MS });
    expect(opts().refetchInterval).toBe(1234);
    expect(opts().queryKey).toEqual(["proctor", "assignment", "s1"]);
    expect(api.getMyProctorAssignment).toHaveBeenCalledWith(hoisted.apiClient, "s1");
  });

  it("force submit sends the attempt id and refreshes the attendance roster", async () => {
    api.forceSubmitAttempt.mockResolvedValue({ attemptPublicId: "att", outcome: "APPLIED" });
    proctorApi.useForceSubmitMutation("s1");
    await opts().mutationFn?.("att" as never);
    opts().onSuccess?.();

    expect(api.forceSubmitAttempt).toHaveBeenCalledWith(hoisted.apiClient, "s1", "att");
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["proctor", "attendance", "s1"] });
  });

  it("every session query is disabled for an empty session id", () => {
    const calls: Array<() => unknown> = [
      () => proctorApi.useMyProctorAssignment(""),
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
      () => proctorApi.useAttendanceHistory("s1", ""),
      () => proctorApi.useHostAttendanceHistory("s1", ""),
      () => proctorApi.useIncidentDetail("s1", ""),
      () => proctorApi.useIncidentHistory("s1", ""),
    ]) {
      call();
      expect(opts().enabled).toBe(false);
    }
  });

  it("incident queries call the matching api with their ids", async () => {
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

describe("attendance and incident mutations", () => {
  it("record attendance sends the student and request, then refreshes that session roster", async () => {
    api.recordAttendance.mockResolvedValue({});
    proctorApi.useRecordAttendanceMutation("s1");

    await opts().mutationFn?.({ studentPublicId: "stu", request: { status: "PRESENT" } } as never);
    opts().onSuccess?.();

    expect(api.recordAttendance).toHaveBeenCalledWith(hoisted.apiClient, "s1", "stu", { status: "PRESENT" });
    expect(hoisted.invalidate).toHaveBeenCalledWith({ queryKey: ["proctor", "attendance", "s1"] });
  });

  it("host attendance mutations refresh the host roster, not the proctor one", async () => {
    api.recordHostAttendance.mockResolvedValue({});
    proctorApi.useRecordHostAttendanceMutation("s1");
    await opts().mutationFn?.({ studentPublicId: "stu", request: {} } as never);
    opts().onSuccess?.();
    expect(api.recordHostAttendance).toHaveBeenCalledWith(hoisted.apiClient, "s1", "stu", {});
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
