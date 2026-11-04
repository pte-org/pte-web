import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  queries: [] as QueryOptions[],
  getQueryData: vi.fn(),
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
    getQueryData: hoisted.getQueryData,
  }),
  useQuery: (options: QueryOptions) => {
    hoisted.queries.push(options);
    return { data: [{ publicId: "act-1", fullName: "Admin User" }] };
  },
}));

import { useAuditLogs } from "../../../../features/auditLog/api";
import {
  AUDIT_LOGS_QUERY_KEY,
  AUDIT_LOG_ACTORS_QUERY_KEY,
} from "../../../../features/auditLog/constants";

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queries = [];
});

describe("useAuditLogs", () => {
  it("queries actor directory and audit logs with pagination and filters", async () => {
    hoisted.api.listUserDirectory.mockResolvedValue([
      { publicId: "act-1", fullName: "Admin User" },
    ]);
    hoisted.api.listAuditLogs.mockResolvedValue({
      data: [{ id: 1, actorUserId: "act-1", action: "CREATE_EXAM" }],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
    hoisted.getQueryData.mockReturnValue([
      { publicId: "act-1", fullName: "Admin User" },
    ]);

    useAuditLogs("EXAM", 0, 20, "exam-1", "2026-01-01", "2026-01-02");

    expect(hoisted.queries).toHaveLength(2);
    const [directoryQuery, logsQuery] = hoisted.queries;

    expect(directoryQuery.queryKey).toEqual(AUDIT_LOG_ACTORS_QUERY_KEY);
    await directoryQuery.queryFn?.();
    expect(hoisted.api.listUserDirectory).toHaveBeenCalledWith(hoisted.apiClient);

    expect(logsQuery.queryKey).toEqual([
      ...AUDIT_LOGS_QUERY_KEY,
      "EXAM",
      "exam-1",
      "2026-01-01",
      "2026-01-02",
      0,
      20,
    ]);
    expect(logsQuery.enabled).toBe(true);

    const result = (await logsQuery.queryFn?.()) as { data: Array<{ actorName: string | null }> };
    expect(result.data[0].actorName).toBe("Admin User");
    expect(hoisted.api.listAuditLogs).toHaveBeenCalledWith(
      hoisted.apiClient,
      "EXAM",
      0,
      20,
      "exam-1",
      "2026-01-01",
      "2026-01-02",
    );
  });
});

