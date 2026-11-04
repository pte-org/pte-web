import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
  onSettled?: () => void;
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
  useCloseTicket,
  useReportQuestion,
  useSubmitTicket,
  useSupportTicket,
  useSupportTickets,
} from "../../../../features/supportTickets/api";
import {
  SUPPORT_TICKETS_QUERY_KEY,
  SUPPORT_TICKET_QUERY_KEY,
} from "../../../../features/supportTickets/constants";

const query = () => hoisted.queryOptions!;
const lastMutation = () => hoisted.mutations[hoisted.mutations.length - 1];
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutations = [];
});

describe("Support Tickets Queries", () => {
  it("useSupportTickets queries tickets page with filters", async () => {
    api.listTickets.mockResolvedValue({ items: [] });
    useSupportTickets("OPEN", "BUG", 1, 10, "login");

    expect(query().queryKey).toEqual([
      ...SUPPORT_TICKETS_QUERY_KEY,
      "OPEN",
      "BUG",
      "login",
      1,
      10,
    ]);

    await query().queryFn?.();
    expect(api.listTickets).toHaveBeenCalledWith(hoisted.apiClient, {
      status: "OPEN",
      category: "BUG",
      search: "login",
      page: 1,
      size: 10,
    });
  });

  it("useSupportTicket queries ticket by publicId", async () => {
    api.getTicket.mockResolvedValue({ publicId: "tic-1" });
    useSupportTicket("tic-1");

    expect(query().queryKey).toEqual(SUPPORT_TICKET_QUERY_KEY("tic-1"));

    await query().queryFn?.();
    expect(api.getTicket).toHaveBeenCalledWith(hoisted.apiClient, "tic-1");
  });
});

describe("Support Tickets Mutations", () => {
  it("useSubmitTicket creates ticket and invalidates list", async () => {
    api.submitTicket.mockResolvedValue({ publicId: "tic-1" });
    useSubmitTicket();

    const input = { category: "BUG", description: "Something broke" };
    await lastMutation().mutationFn?.(input as never);
    expect(api.submitTicket).toHaveBeenCalledWith(hoisted.apiClient, input);

    lastMutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: SUPPORT_TICKETS_QUERY_KEY,
    });
  });

  it("useReportQuestion submits report and invalidates list", async () => {
    api.submitTicket.mockResolvedValue({ publicId: "tic-2" });
    useReportQuestion("q-123");

    await lastMutation().mutationFn?.("Typo in question" as never);
    expect(api.submitTicket).toHaveBeenCalledWith(hoisted.apiClient, {
      category: "CONTENT_COMPLAINT",
      description: "Typo in question",
      entityType: "QUESTION",
      entityId: "q-123",
    });

    lastMutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: SUPPORT_TICKETS_QUERY_KEY,
    });
  });

  it("useCloseTicket closes ticket and invalidates list on settlement", async () => {
    api.closeTicket.mockResolvedValue({ publicId: "tic-1", status: "CLOSED" });
    useCloseTicket();

    await lastMutation().mutationFn?.("tic-1" as never);
    expect(api.closeTicket).toHaveBeenCalledWith(hoisted.apiClient, "tic-1");

    lastMutation().onSettled?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: SUPPORT_TICKETS_QUERY_KEY,
    });
  });
});

