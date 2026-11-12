import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../src/client/apiError";
import { createApiClient, type RefreshedTokens } from "../../../src/client/client";

const BASE_URL = "https://api.example.test";
const NEW_TOKENS: RefreshedTokens = { accessToken: "new-access", refreshToken: "new-refresh", expiresInSeconds: 60 };

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function unauthorized(): Response {
  return jsonResponse({ success: false, data: null, message: "expired" }, 401);
}

async function captureError(action: () => Promise<unknown>): Promise<ApiError> {
  try {
    await action();
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError; // asserted by the line above
  }
  throw new Error("Expected the API request to fail");
}

interface Harness {
  client: ReturnType<typeof createApiClient>;
  fetchFn: ReturnType<typeof vi.fn>;
  onUnauthorized: ReturnType<typeof vi.fn>;
  onTokenRefreshed: ReturnType<typeof vi.fn>;
  getToken: () => string;
}

function harness(
  refreshAccessToken: ReturnType<typeof vi.fn> | undefined,
  fetchFn: ReturnType<typeof vi.fn>,
  refreshToken: string | null = "refresh-1",
): Harness {
  let token = "old-access";
  const onUnauthorized = vi.fn();
  const onTokenRefreshed = vi.fn((tokens: RefreshedTokens) => {
    token = tokens.accessToken;
  });
  const client = createApiClient({
    baseUrl: BASE_URL,
    fetchFn,
    getToken: () => token,
    getRefreshToken: () => refreshToken,
    refreshAccessToken,
    onUnauthorized,
    onTokenRefreshed,
  });
  return { client, fetchFn, onUnauthorized, onTokenRefreshed, getToken: () => token };
}

describe("ApiClient refresh outcome", () => {
  it("fails as a network error and keeps the session when the refresh cannot be completed", async () => {
    const refresh = vi.fn().mockRejectedValue(new Error("offline"));
    const h = harness(refresh, vi.fn().mockResolvedValue(unauthorized()));

    const error = await captureError(() => h.client.request("/protected"));

    expect(error.kind).toBe("network");
    expect(error.status).toBe(0);
    expect(h.onUnauthorized).not.toHaveBeenCalled();
    expect(h.onTokenRefreshed).not.toHaveBeenCalled();
    expect(h.fetchFn).toHaveBeenCalledTimes(1);
  });

  it("signs out exactly once and does not retry when the server refuses the refresh token", async () => {
    const refresh = vi.fn().mockResolvedValue(null);
    const h = harness(refresh, vi.fn().mockImplementation(async () => unauthorized()));

    const error = await captureError(() => h.client.request("/protected"));

    expect(error.kind).toBe("unauthorized");
    expect(error.status).toBe(401);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(h.onUnauthorized).toHaveBeenCalledTimes(1);
    expect(h.onTokenRefreshed).not.toHaveBeenCalled();
    expect(h.fetchFn).toHaveBeenCalledTimes(1);
  });

  it("runs one refresh for two concurrent 401s and fails both as network errors when it cannot complete", async () => {
    const refresh = vi.fn().mockRejectedValue(new Error("offline"));
    const h = harness(refresh, vi.fn().mockImplementation(async () => unauthorized()));

    const [first, second] = await Promise.all([
      captureError(() => h.client.request("/a")),
      captureError(() => h.client.request("/b")),
    ]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(first).toMatchObject({ kind: "network", status: 0 });
    expect(second).toMatchObject({ kind: "network", status: 0 });
    expect(h.onUnauthorized).not.toHaveBeenCalled();
  });

  it("runs one refresh for two concurrent 401s and retries both with the new token", async () => {
    const refresh = vi.fn().mockResolvedValue(NEW_TOKENS);
    const fetchFn = vi.fn(async (_url: string, init?: RequestInit) => {
      const authorization = new Headers(init?.headers).get("Authorization");
      return authorization === "Bearer new-access" ? jsonResponse({ success: true, data: { ok: true } }, 200) : unauthorized();
    });
    const h = harness(refresh, fetchFn);

    const results = await Promise.all([h.client.request("/a"), h.client.request("/b")]);

    expect(results).toStrictEqual([{ ok: true }, { ok: true }]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledTimes(4);
    expect(h.onUnauthorized).not.toHaveBeenCalled();
  });

  it.each([
    ["there is no refresh token", vi.fn().mockResolvedValue(NEW_TOKENS), null],
    ["no refresh function is configured", undefined, "refresh-1"],
  ])("signs out as before when %s", async (_label, refresh, refreshToken) => {
    const h = harness(refresh, vi.fn().mockResolvedValue(unauthorized()), refreshToken);

    const error = await captureError(() => h.client.request("/protected"));

    expect(error).toMatchObject({ kind: "unauthorized", status: 401 });
    expect(h.onUnauthorized).toHaveBeenCalledTimes(1);
    expect(h.fetchFn).toHaveBeenCalledTimes(1);
    if (refresh) expect(refresh).not.toHaveBeenCalled();
  });

  describe("ensureFreshAccessToken with forceRefresh", () => {
    it("returns the current token and keeps the session when the refresh cannot be completed", async () => {
      const refresh = vi.fn().mockRejectedValue(new Error("offline"));
      const h = harness(refresh, vi.fn());

      const token = await h.client.ensureFreshAccessToken({ forceRefresh: true });

      expect(token).toBe("old-access");
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(h.onUnauthorized).not.toHaveBeenCalled();
    });

    it("returns the current token without signing out itself when the server refuses the refresh", async () => {
      const refresh = vi.fn().mockResolvedValue(null);
      const h = harness(refresh, vi.fn());

      const token = await h.client.ensureFreshAccessToken({ forceRefresh: true });

      expect(token).toBe("old-access");
      expect(h.onUnauthorized).not.toHaveBeenCalled();
      expect(h.onTokenRefreshed).not.toHaveBeenCalled();
    });

    it("returns the new token after a successful refresh", async () => {
      const refresh = vi.fn().mockResolvedValue(NEW_TOKENS);
      const h = harness(refresh, vi.fn());

      const token = await h.client.ensureFreshAccessToken({ forceRefresh: true });

      expect(token).toBe("new-access");
      expect(refresh).toHaveBeenCalledWith("refresh-1");
      expect(h.onTokenRefreshed).toHaveBeenCalledWith(NEW_TOKENS);
    });
  });

  it("ends the session once, without retrying or a network error, when the new tokens cannot be stored", async () => {
    const refresh = vi.fn().mockResolvedValue(NEW_TOKENS);
    const h = harness(refresh, vi.fn().mockImplementation(async () => unauthorized()));
    h.onTokenRefreshed.mockImplementation(() => {
      throw new Error("storage full");
    });

    const error = await captureError(() => h.client.request("/protected"));

    expect(error.kind).toBe("unauthorized");
    expect(error.status).toBe(401);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(h.onTokenRefreshed).toHaveBeenCalledTimes(1);
    expect(h.onUnauthorized).toHaveBeenCalledTimes(1);
    expect(h.fetchFn).toHaveBeenCalledTimes(1);
  });

  it("runs one refresh for two concurrent 401s and fails both as unauthorized when the new tokens cannot be stored", async () => {
    const refresh = vi.fn().mockResolvedValue(NEW_TOKENS);
    const h = harness(refresh, vi.fn().mockImplementation(async () => unauthorized()));
    h.onTokenRefreshed.mockImplementation(() => {
      throw new Error("storage full");
    });

    const [first, second] = await Promise.all([
      captureError(() => h.client.request("/a")),
      captureError(() => h.client.request("/b")),
    ]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(first).toMatchObject({ kind: "unauthorized", status: 401 });
    expect(second).toMatchObject({ kind: "unauthorized", status: 401 });
    expect(h.fetchFn).toHaveBeenCalledTimes(2);
  });

  it("exposes the error the refresh call rejected with as the cause of the network error", async () => {
    const refreshFailure = new Error("offline");
    const refresh = vi.fn().mockRejectedValue(refreshFailure);
    const h = harness(refresh, vi.fn().mockResolvedValue(unauthorized()));

    const error = await captureError(() => h.client.request("/protected"));

    expect(error.kind).toBe("network");
    expect(error.details).toBe(refreshFailure);
  });

  it("still returns the current token from ensureFreshAccessToken when the refresh rejects with a specific error", async () => {
    const refresh = vi.fn().mockRejectedValue(new Error("timeout"));
    const h = harness(refresh, vi.fn());

    const token = await h.client.ensureFreshAccessToken({ forceRefresh: true });

    expect(token).toBe("old-access");
    expect(h.onUnauthorized).not.toHaveBeenCalled();
  });

  it("starts a new refresh for a request made after a transient failure", async () => {
    const refresh = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(NEW_TOKENS);
    const fetchFn = vi.fn(async (_url: string, init?: RequestInit) => {
      const authorization = new Headers(init?.headers).get("Authorization");
      return authorization === "Bearer new-access" ? jsonResponse({ success: true, data: { ok: true } }, 200) : unauthorized();
    });
    const h = harness(refresh, fetchFn);

    const firstError = await captureError(() => h.client.request("/protected"));
    const second = await h.client.request("/protected");

    expect(firstError.kind).toBe("network");
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(second).toStrictEqual({ ok: true });
    expect(h.onUnauthorized).not.toHaveBeenCalled();
  });
});
