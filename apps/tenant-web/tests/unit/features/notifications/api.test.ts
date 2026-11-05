import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  refetchInterval?: ((query: unknown) => number | false) | number | false;
  retry?: boolean;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  user: { publicId: "u1", tenantId: "t1", roles: ["HOST_ADMIN"] } as {
    publicId: string;
    tenantId: string | null;
    roles: string[];
  } | null,
  queries: [] as QueryOptions[],
  mutations: [] as MutationOptions[],
  clear: vi.fn(),
  removeQueries: vi.fn(),
  invalidateQueries: vi.fn(),
  getInboxUnreadCount: vi.fn(),
  listInbox: vi.fn(),
  markInboxItemRead: vi.fn(),
  markAllInboxRead: vi.fn(),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@/features/auth/api", () => ({
  useCurrentUser: () => ({ data: hoisted.user }),
}));
vi.mock("@pte/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pte/api-client")>();
  return {
    ...actual,
    getInboxUnreadCount: hoisted.getInboxUnreadCount,
    listInbox: hoisted.listInbox,
    markInboxItemRead: hoisted.markInboxItemRead,
    markAllInboxRead: hoisted.markAllInboxRead,
  };
});
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => ({
    clear: hoisted.clear,
    removeQueries: hoisted.removeQueries,
    invalidateQueries: hoisted.invalidateQueries,
  }),
  useQuery: (options: QueryOptions) => {
    hoisted.queries.push(options);
    return { data: undefined, isFetching: false };
  },
  useMutation: (options: MutationOptions) => {
    hoisted.mutations.push(options);
    return { mutateAsync: vi.fn() };
  },
}));

import {
  notificationQueryKeys,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationCenter,
  useNotificationHistory,
} from "../../../../features/notifications/api";
import { ApiError } from "@pte/api-client";

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queries = [];
  hoisted.mutations = [];
  hoisted.user = { publicId: "u1", tenantId: "t1", roles: ["HOST_ADMIN"] };
});

describe("notificationQueryKeys", () => {
  it("formats unread and recent query keys with tenant or platform fallback", () => {
    expect(notificationQueryKeys.unread("u1", "t1")).toEqual([
      "notifications",
      "unread",
      "u1",
      "t1",
    ]);
    expect(notificationQueryKeys.unread("u1", null)).toEqual([
      "notifications",
      "unread",
      "u1",
      "platform",
    ]);
    expect(notificationQueryKeys.recent("u1", "t1", 5)).toEqual([
      "notifications",
      "recent",
      "u1",
      "t1",
      5,
    ]);
    expect(notificationQueryKeys.recent("u1", null, 10)).toEqual([
      "notifications",
      "recent",
      "u1",
      "platform",
      10,
    ]);
  });
});

describe("useNotificationCenter", () => {
  it("registers unread and recent queries when rendered for HOST_ADMIN", () => {
    let result!: ReturnType<typeof useNotificationCenter>;
    renderToStaticMarkup(
      createElement(() => {
        result = useNotificationCenter();
        return null;
      }),
    );

    expect(result.isOpen).toBe(false);
    expect(hoisted.queries).toHaveLength(2);

    const [unreadQuery, recentQuery] = hoisted.queries;
    expect(unreadQuery.queryKey).toEqual(["notifications", "unread", "u1", "t1"]);
    expect(unreadQuery.enabled).toBe(true);
    expect(recentQuery.queryKey).toEqual(["notifications", "recent", "u1", "t1", 5]);
    expect(recentQuery.enabled).toBe(false);
  });

  it("disables queries when user is not HOST_ADMIN", () => {
    hoisted.user = { publicId: "u2", tenantId: "t2", roles: ["EXAMINER"] };
    renderToStaticMarkup(
      createElement(() => {
        useNotificationCenter();
        return null;
      }),
    );

    const [unreadQuery, recentQuery] = hoisted.queries;
    expect(unreadQuery.enabled).toBe(false);
    expect(recentQuery.enabled).toBe(false);
  });

  it("invokes api methods on query execution", async () => {
    hoisted.getInboxUnreadCount.mockResolvedValue({ unreadCount: 3 });
    hoisted.listInbox.mockResolvedValue({ items: [], page: { meta: { hasNext: false } } });

    renderToStaticMarkup(
      createElement(() => {
        useNotificationCenter();
        return null;
      }),
    );

    const [unreadQuery, recentQuery] = hoisted.queries;
    await expect(unreadQuery.queryFn?.()).resolves.toEqual({ unreadCount: 3 });
    expect(hoisted.getInboxUnreadCount).toHaveBeenCalledWith(hoisted.apiClient);

    await expect(recentQuery.queryFn?.()).resolves.toEqual({
      items: [],
      page: { meta: { hasNext: false } },
    });
    expect(hoisted.listInbox).toHaveBeenCalledWith(hoisted.apiClient, {
      page: 0,
      size: 5,
      filter: "ALL",
    });
  });

  it("clears query cache on 401 unauthorized ApiError", async () => {
    const unauthorizedError = new ApiError("unauthorized", 401, "Session expired");
    hoisted.getInboxUnreadCount.mockRejectedValue(unauthorizedError);

    renderToStaticMarkup(
      createElement(() => {
        useNotificationCenter();
        return null;
      }),
    );

    const [unreadQuery] = hoisted.queries;
    await expect(unreadQuery.queryFn?.()).rejects.toThrow("Session expired");
    expect(hoisted.clear).toHaveBeenCalledTimes(1);
  });

  it("executes markRead and markAllRead mutations and invalidates queries", async () => {
    hoisted.markInboxItemRead.mockResolvedValue(undefined);
    hoisted.markAllInboxRead.mockResolvedValue(undefined);

    renderToStaticMarkup(
      createElement(() => {
        useNotificationCenter();
        return null;
      }),
    );

    expect(hoisted.mutations).toHaveLength(2);
    const [markReadMut, markAllReadMut] = hoisted.mutations;

    await markReadMut.mutationFn?.("item-1" as never);
    expect(hoisted.markInboxItemRead).toHaveBeenCalledWith(hoisted.apiClient, "item-1");
    markReadMut.onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["notifications", "unread", "u1", "t1"],
    });

    await markAllReadMut.mutationFn?.("snap-1" as never);
    expect(hoisted.markAllInboxRead).toHaveBeenCalledWith(hoisted.apiClient, "snap-1");
    markAllReadMut.onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["notifications", "recent", "u1", "t1", 5],
    });
  });

  it("handles loadMoreRecent and collapseRecent helpers", () => {
    let result!: ReturnType<typeof useNotificationCenter>;
    renderToStaticMarkup(
      createElement(() => {
        result = useNotificationCenter();
        return null;
      }),
    );

    expect(typeof result.loadMoreRecent).toBe("function");
    expect(typeof result.collapseRecent).toBe("function");
    expect(result.hasMoreRecent).toBe(false);
    expect(result.isLoadingMore).toBe(false);

    // Should not throw
    result.loadMoreRecent();
    result.collapseRecent();
  });
});

describe("useNotificationHistory", () => {
  it("keys history by user, tenant, page, filter, and category", async () => {
    hoisted.listInbox.mockResolvedValue({ items: [] });
    renderToStaticMarkup(
      createElement(() => {
        useNotificationHistory(1, "UNREAD", "SYSTEM_NOTICE", "snap-token");
        return null;
      }),
    );

    const [historyQuery] = hoisted.queries;
    expect(historyQuery.queryKey).toEqual([
      "notifications",
      "history",
      "u1",
      "t1",
      1,
      "UNREAD",
      "SYSTEM_NOTICE",
      "snap-token",
    ]);
    expect(historyQuery.enabled).toBe(true);

    await historyQuery.queryFn?.();
    expect(hoisted.listInbox).toHaveBeenCalledWith(hoisted.apiClient, {
      page: 1,
      size: 20,
      filter: "UNREAD",
      category: "SYSTEM_NOTICE",
      snapshot: "snap-token",
    });
  });
});

describe("useMarkNotificationRead and useMarkAllNotificationsRead standalone", () => {
  it("invalidates root notifications key on success", async () => {
    renderToStaticMarkup(
      createElement(() => {
        useMarkNotificationRead();
        useMarkAllNotificationsRead();
        return null;
      }),
    );

    const [markOne, markAll] = hoisted.mutations;
    markOne.onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationQueryKeys.root,
    });

    hoisted.invalidateQueries.mockClear();
    markAll.onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationQueryKeys.root,
    });
  });
});
