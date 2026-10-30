import { describe, expect, it, vi } from "vitest";
import { ProctorTransport } from "../../../../features/proctor/transport";
import type { ApiClient } from "@pte/api-client";
import type { ConnectionStatus } from "../../../../features/proctor/transportTypes";

describe("ProctorTransport", () => {
  function createMockApiClient(token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEiLCJyb2xlcyI6WyJQUk9DVE9SIl0sImV4cCI6OTk5OTk5OTk5OX0.sig"): ApiClient {
    return {
      request: vi.fn(),
      upload: vi.fn(),
      uploadDownload: vi.fn(),
      download: vi.fn(),
      ensureFreshAccessToken: vi.fn().mockResolvedValue(token),
    };
  }

  interface MockMessage {
    body: string;
    headers: Record<string, string>;
  }

  function createMockClient() {
    const subs: { destination: string; callback: (msg: MockMessage) => void }[] = [];
    return {
      active: true,
      connected: true,
      connectHeaders: {} as Record<string, string>,
      activate: vi.fn(),
      deactivate: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn((destination: string, callback: (msg: MockMessage) => void) => {
        subs.push({ destination, callback });
        return {
          id: `sub-${subs.length}`,
          unsubscribe: vi.fn(),
        };
      }),
      publish: vi.fn(),
      beforeConnect: undefined as (() => Promise<void>) | undefined,
      onConnect: undefined as (() => void) | undefined,
      onDisconnect: undefined as (() => void) | undefined,
      onStompError: undefined as ((frame: { headers: Record<string, string> }) => void) | undefined,
      onWebSocketClose: undefined as (() => void) | undefined,
    };
  }

  it("sets up subscriptions before notifying status CONNECTED (P1 requirement)", async () => {
    const apiClient = createMockApiClient();
    const mockClient = createMockClient();
    const statusEvents: ConnectionStatus[] = [];
    let subscriptionsCountWhenConnected = 0;

    const transport = new ProctorTransport({
      apiClient,
      baseUrl: "http://localhost:8080",
      examSessionPublicId: "session-123",
      callbacks: {
        onStatusChange: (status) => {
          statusEvents.push(status);
          if (status === "CONNECTED") {
            subscriptionsCountWhenConnected = mockClient.subscribe.mock.calls.length;
          }
        },
      },
      clientFactory: () => mockClient as unknown as import("@stomp/stompjs").Client,
    });

    transport.connect();
    expect(statusEvents).toEqual(["CONNECTING"]);

    // Execute beforeConnect
    await mockClient.beforeConnect?.();
    expect(mockClient.connectHeaders["Authorization"]).toContain("Bearer ");

    // Execute onConnect
    mockClient.onConnect?.();

    expect(statusEvents).toEqual(["CONNECTING", "CONNECTED"]);
    // At the instant CONNECTED was fired, subscriptions MUST have already been established!
    expect(subscriptionsCountWhenConnected).toBeGreaterThan(0);
    expect(mockClient.subscribe).toHaveBeenCalledWith(
      "/user/queue/proctor-session",
      expect.any(Function),
    );
    expect(mockClient.subscribe).toHaveBeenCalledWith(
      "/user/queue/proctor-results",
      expect.any(Function),
    );
    expect(mockClient.subscribe).toHaveBeenCalledWith(
      "/user/queue/proctor-errors",
      expect.any(Function),
    );
    expect(mockClient.subscribe).toHaveBeenCalledWith(
      "/topic/proctor-sessions/session-123",
      expect.any(Function),
    );
  });

  it("does not transition to RECONNECTING when websocket closes after intentional disconnect (P2 requirement)", async () => {
    const apiClient = createMockApiClient();
    const mockClient = createMockClient();
    const statusEvents: ConnectionStatus[] = [];

    const transport = new ProctorTransport({
      apiClient,
      baseUrl: "http://localhost:8080",
      callbacks: {
        onStatusChange: (status) => {
          statusEvents.push(status);
        },
      },
      clientFactory: () => mockClient as unknown as import("@stomp/stompjs").Client,
    });

    transport.connect();
    await mockClient.beforeConnect?.();
    mockClient.onConnect?.();

    expect(statusEvents).toEqual(["CONNECTING", "CONNECTED"]);

    transport.disconnect();
    expect(statusEvents).toEqual(["CONNECTING", "CONNECTED", "DISCONNECTED"]);

    // When the underlying websocket finishes closing after intentional disconnect
    mockClient.onWebSocketClose?.();

    // Should NOT transition to RECONNECTING
    expect(statusEvents).toEqual(["CONNECTING", "CONNECTED", "DISCONNECTED"]);
    expect(transport.getStatus()).toBe("DISCONNECTED");
  });

  it("does not activate client if disconnected while awaiting deactivation during token refresh (P2 requirement)", async () => {
    const apiClient = createMockApiClient();
    let resolveDeactivate: () => void = () => {};
    const deactivatePromise = new Promise<void>((resolve) => {
      resolveDeactivate = resolve;
    });

    const mockClient = createMockClient();
    mockClient.deactivate = vi.fn().mockReturnValue(deactivatePromise);

    const transport = new ProctorTransport({
      apiClient,
      baseUrl: "http://localhost:8080",
      clientFactory: () => mockClient as unknown as import("@stomp/stompjs").Client,
    });

    transport.connect();
    await mockClient.beforeConnect?.();
    mockClient.onConnect?.();

    // Reset activate call count from initial connect
    mockClient.activate.mockClear();

    // Simulate new token refresh arrival with exp 2 hours in the future
    const futureExp = Math.floor(Date.now() / 1000) + 7200;
    const newToken = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ sub: "u1", exp: futureExp }))}.sig`;

    const refreshPromise = (transport as unknown as { handleTokenRefreshed: (token: string) => Promise<void> })
      .handleTokenRefreshed(newToken);

    // While deactivate is pending, user unmounts/disconnects
    transport.disconnect();

    // Now resolve deactivation
    resolveDeactivate();
    await refreshPromise;

    // mockClient.activate MUST NOT have been called after disconnect
    expect(mockClient.activate).not.toHaveBeenCalled();
    expect(transport.getStatus()).toBe("DISCONNECTED");
  });

  it("transitions to DENIED when refresh fails and token is expired (P1 requirement)", async () => {
    // Expired token (exp 10 seconds ago)
    const pastExp = Math.floor(Date.now() / 1000) - 10;
    const expiredToken = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ sub: "u1", exp: pastExp }))}.sig`;

    const apiClient = createMockApiClient(expiredToken);
    apiClient.ensureFreshAccessToken = vi.fn().mockResolvedValue(expiredToken);

    const mockClient = createMockClient();
    const statusEvents: ConnectionStatus[] = [];

    const transport = new ProctorTransport({
      apiClient,
      baseUrl: "http://localhost:8080",
      callbacks: {
        onStatusChange: (status) => statusEvents.push(status),
      },
      clientFactory: () => mockClient as unknown as import("@stomp/stompjs").Client,
    });

    transport.connect();
    mockClient.onConnect?.();

    await (transport as unknown as { executeTokenRefresh: (token: string) => Promise<void> })
      .executeTokenRefresh(expiredToken);

    expect(transport.getStatus()).toBe("DENIED");
    expect(statusEvents).toContain("DENIED");
  });

  it("successfully reactivates client when onDisconnect fires during token rotation deactivate (R2 requirement)", async () => {
    const apiClient = createMockApiClient();
    const mockClient = createMockClient();

    // Simulate STOMP client behavior where onDisconnect callback is triggered before deactivate resolves
    mockClient.deactivate = vi.fn().mockImplementation(async () => {
      mockClient.onDisconnect?.();
    });

    const transport = new ProctorTransport({
      apiClient,
      baseUrl: "http://localhost:8080",
      clientFactory: () => mockClient as unknown as import("@stomp/stompjs").Client,
    });

    transport.connect();
    await mockClient.beforeConnect?.();
    mockClient.onConnect?.();

    mockClient.activate.mockClear();

    const futureExp = Math.floor(Date.now() / 1000) + 7200;
    const newToken = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ sub: "u1", exp: futureExp }))}.sig`;

    await (transport as unknown as { handleTokenRefreshed: (token: string) => Promise<void> })
      .handleTokenRefreshed(newToken);

    // Verify activate was called on mockClient (not left disconnected!)
    expect(mockClient.activate).toHaveBeenCalledTimes(1);
    expect(mockClient.connectHeaders["Authorization"]).toBe(`Bearer ${newToken}`);
  });

  it("ignores malformed or Message-wrapper payloads on /user/queue/proctor-session (R1 requirement)", async () => {
    const apiClient = createMockApiClient();
    const mockClient = createMockClient();
    const sessionOpenCalls: unknown[] = [];

    const transport = new ProctorTransport({
      apiClient,
      baseUrl: "http://localhost:8080",
      callbacks: {
        onSessionOpen: (s) => sessionOpenCalls.push(s),
      },
      clientFactory: () => mockClient as unknown as import("@stomp/stompjs").Client,
    });

    transport.connect();
    await mockClient.beforeConnect?.();
    mockClient.onConnect?.();

    // Find the subscription for /user/queue/proctor-session
    const subCall = mockClient.subscribe.mock.calls.find(
      (call) => call[0] === "/user/queue/proctor-session",
    );
    expect(subCall).toBeDefined();
    const sessionCallback = subCall![1] as (msg: { body: string; headers: Record<string, string> }) => void;

    // 1. Simulate malformed Message wrapper payload: { payload: { publicId: ... } }
    sessionCallback({
      body: JSON.stringify({ payload: { publicId: "session-1", status: "ACTIVE" } }),
      headers: { requestId: "req-1" },
    });
    // Should NOT trigger onSessionOpen because publicId is not a top-level string
    expect(sessionOpenCalls).toHaveLength(0);

    // 2. Simulate valid flat ProctorSessionResponse
    sessionCallback({
      body: JSON.stringify({
        publicId: "ps-valid-1",
        sessionPublicId: "session-1",
        status: "ACTIVE",
      }),
      headers: { requestId: "req-2" },
    });
    expect(sessionOpenCalls).toHaveLength(1);
    expect(sessionOpenCalls[0]).toEqual(
      expect.objectContaining({ publicId: "ps-valid-1", status: "ACTIVE" }),
    );
  });
});
