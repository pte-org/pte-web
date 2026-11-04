import { beforeEach, describe, expect, it, vi } from "vitest";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  staleTime?: number;
  select?: (logs: { data: Array<{ actorUserId: string }>; total?: number }) => unknown;
  placeholderData?: unknown;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  calls: [] as Options[],
  actors: undefined as unknown,
  listPlatformAuditActors: vi.fn(),
  listPlatformAuditLogs: vi.fn(),
  keepPreviousData: Symbol("keepPreviousData"),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/api-client")>()),
  listPlatformAuditActors: hoisted.listPlatformAuditActors,
  listPlatformAuditLogs: hoisted.listPlatformAuditLogs,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  keepPreviousData: hoisted.keepPreviousData,
  useQuery: (options: Options) => {
    hoisted.calls.push(options);
    return { data: options.staleTime === 60_000 ? hoisted.actors : undefined };
  },
}));

import { usePlatformAuditLogs } from "../../../../features/auditLog/api";
import { PLATFORM_AUDIT_ACTORS_QUERY_KEY, PLATFORM_AUDIT_LOG_QUERY_KEY } from "../../../../features/auditLog/constants";

const logsQuery = (): Options => hoisted.calls.find((call) => call.staleTime !== 60_000) as Options;
const actorsQuery = (): Options => hoisted.calls.find((call) => call.staleTime === 60_000) as Options;

beforeEach(() => {
  hoisted.calls.length = 0;
  hoisted.actors = undefined;
  hoisted.listPlatformAuditActors.mockReset();
  hoisted.listPlatformAuditLogs.mockReset();
});

describe("usePlatformAuditLogs", () => {
  it("caches the actor directory for a minute under its own key", async () => {
    hoisted.listPlatformAuditActors.mockResolvedValue([]);
    usePlatformAuditLogs();

    await actorsQuery().queryFn?.();

    expect(actorsQuery().queryKey).toEqual(PLATFORM_AUDIT_ACTORS_QUERY_KEY);
    expect(hoisted.listPlatformAuditActors).toHaveBeenCalledWith(hoisted.apiClient);
  });

  it("keys the log page by type, search, dates and paging with ALL as the default type", () => {
    usePlatformAuditLogs(undefined, 1, 20, "login", "2026-01-01", "2026-01-31");

    expect(logsQuery().queryKey).toEqual([...PLATFORM_AUDIT_LOG_QUERY_KEY, "ALL", "login", "2026-01-01", "2026-01-31", 1, 20]);
  });

  it("passes empty dates to the api as undefined", async () => {
    hoisted.listPlatformAuditLogs.mockResolvedValue({ data: [] });
    usePlatformAuditLogs("USER", 0, 10, "", "", "");

    await logsQuery().queryFn?.();

    expect(hoisted.listPlatformAuditLogs).toHaveBeenCalledWith(hoisted.apiClient, "USER", 0, 10, "", undefined, undefined);
  });

  it("passes set dates through unchanged", async () => {
    hoisted.listPlatformAuditLogs.mockResolvedValue({ data: [] });
    usePlatformAuditLogs("USER", 0, 10, "q", "2026-02-01", "2026-02-28");

    await logsQuery().queryFn?.();

    expect(hoisted.listPlatformAuditLogs).toHaveBeenCalledWith(hoisted.apiClient, "USER", 0, 10, "q", "2026-02-01", "2026-02-28");
  });

  it("adds the actor name to each row and null when the actor is unknown", () => {
    hoisted.actors = [{ publicId: "u1", fullName: "An Nguyen" }];
    usePlatformAuditLogs();

    const result = logsQuery().select?.({ data: [{ actorUserId: "u1" }, { actorUserId: "ghost" }], total: 2 }) as {
      data: Array<{ log: { actorUserId: string }; actorName: string | null }>;
      total: number;
    };

    expect(result.data.map((row) => row.actorName)).toEqual(["An Nguyen", null]);
    expect(result.data[0].log.actorUserId).toBe("u1");
    expect(result.total).toBe(2);
  });

  it("gives every row a null actor name while the directory is still loading", () => {
    hoisted.actors = undefined;
    usePlatformAuditLogs();

    const result = logsQuery().select?.({ data: [{ actorUserId: "u1" }] }) as { data: Array<{ actorName: string | null }> };

    expect(result.data[0].actorName).toBeNull();
  });

  it("keeps the previous page visible while another loads", () => {
    usePlatformAuditLogs();

    expect(logsQuery().placeholderData).toBe(hoisted.keepPreviousData);
  });
});
