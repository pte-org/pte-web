import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@pte/api-client";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const store = vi.hoisted(() => ({
  session: null as StoredSession | null,
  clear: vi.fn(),
  save: vi.fn(),
}));

vi.mock("../../../src/hooks/sessionStorage", () => ({
  sessionStorage: {
    getAccessToken: (): string | null => store.session?.accessToken ?? null,
    retrieve: (): StoredSession | null => store.session,
    save: (session: StoredSession): void => {
      store.save(session);
      store.session = session;
    },
    clear: (): void => store.clear(),
  },
}));

vi.mock("../../../src/hooks/sessionLifecycle", () => ({
  getSessionGeneration: (): number => 1,
}));

import { createSessionApiClient } from "../../../src/hooks/createSessionApiClient";

const BASE_URL = "https://api.example.test";
const REFRESH_URL = `${BASE_URL}/api/v1/auth/refresh`;
const PROTECTED_URL = `${BASE_URL}/api/v1/protected`;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Answers 401 to the protected endpoint and `refreshAnswer` to the refresh endpoint. */
function stubFetch(refreshAnswer: () => Promise<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit): Promise<Response> => {
    if (url === REFRESH_URL) return refreshAnswer();
    const authorization = new Headers(init?.headers).get("Authorization");
    if (authorization === "Bearer new-access") return json({ success: true, data: { ok: true } }, 200);
    return json({ success: false, data: null, message: "expired" }, 401);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function refreshCalls(fetchMock: ReturnType<typeof vi.fn>): Array<[string, RequestInit]> {
  return (fetchMock.mock.calls as Array<[string, RequestInit]>).filter(([url]) => url === REFRESH_URL);
}

async function failureOf(action: () => Promise<unknown>): Promise<ApiError> {
  const error = await action().catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError; // asserted by the line above
}

beforeEach(() => {
  store.session = { accessToken: "old-access", refreshToken: "refresh-1", expiresAt: Date.now() + 1000 };
  store.clear.mockClear();
  store.save.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createSessionApiClient refresh classification", () => {
  it.each([401, 400, 403, 404, 422])("clears the session when the refresh endpoint answers %i", async (status) => {
    const fetchMock = stubFetch(async () => json({ success: false, message: "INVALID_REFRESH_TOKEN" }, status));
    const client = createSessionApiClient(BASE_URL);

    const error = await failureOf(() => client.request("/api/v1/protected"));

    expect(error).toMatchObject({ kind: "unauthorized", status: 401 });
    expect(store.clear).toHaveBeenCalledTimes(1);
    expect(refreshCalls(fetchMock)).toHaveLength(1);
    expect(store.save).not.toHaveBeenCalled();
  });

  it.each([408, 429, 500, 503])("keeps the session and fails as a network error when the refresh endpoint answers %i", async (status) => {
    const fetchMock = stubFetch(async () => json({ success: false, message: "later" }, status));
    const client = createSessionApiClient(BASE_URL);

    const error = await failureOf(() => client.request("/api/v1/protected"));

    expect(error).toMatchObject({ kind: "network", status: 0 });
    expect(store.clear).not.toHaveBeenCalled();
    expect(store.save).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls.filter(([url]) => url === PROTECTED_URL)).toHaveLength(1);
  });

  it("keeps the session when the refresh call itself rejects", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    const client = createSessionApiClient(BASE_URL);

    const error = await failureOf(() => client.request("/api/v1/protected"));

    expect(error).toMatchObject({ kind: "network", status: 0 });
    expect(store.clear).not.toHaveBeenCalled();
  });

  it("keeps the session when a 200 refresh answer carries no tokens", async () => {
    stubFetch(async () => json({ data: {} }, 200));
    const client = createSessionApiClient(BASE_URL);

    const error = await failureOf(() => client.request("/api/v1/protected"));

    expect(error).toMatchObject({ kind: "network", status: 0 });
    expect(store.clear).not.toHaveBeenCalled();
    expect(store.save).not.toHaveBeenCalled();
  });

  it("saves the new tokens and retries the request with them on a valid enveloped 200", async () => {
    const fetchMock = stubFetch(async () =>
      json({ data: { accessToken: "new-access", refreshToken: "new-refresh", expiresInSeconds: 900 } }, 200),
    );
    const client = createSessionApiClient(BASE_URL);

    const result = await client.request("/api/v1/protected");

    expect(result).toStrictEqual({ ok: true });
    expect(store.save).toHaveBeenCalledTimes(1);
    expect(store.save).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "new-access", refreshToken: "new-refresh" }),
    );
    expect(store.clear).not.toHaveBeenCalled();

    const protectedCalls = fetchMock.mock.calls.filter(([url]) => url === PROTECTED_URL) as Array<[string, RequestInit]>;
    expect(protectedCalls).toHaveLength(2);
    expect(new Headers(protectedCalls[0]?.[1].headers).get("Authorization")).toBe("Bearer old-access");
    expect(new Headers(protectedCalls[1]?.[1].headers).get("Authorization")).toBe("Bearer new-access");
  });

  it("accepts a bare (non-enveloped) 200 refresh body", async () => {
    stubFetch(async () => json({ accessToken: "new-access", refreshToken: "new-refresh", expiresInSeconds: 900 }, 200));
    const client = createSessionApiClient(BASE_URL);

    const result = await client.request("/api/v1/protected");

    expect(result).toStrictEqual({ ok: true });
    expect(store.save).toHaveBeenCalledWith(expect.objectContaining({ accessToken: "new-access" }));
  });

  it("sends the refresh as a POST with a JSON body and no Authorization header", async () => {
    const fetchMock = stubFetch(async () =>
      json({ data: { accessToken: "new-access", refreshToken: "new-refresh", expiresInSeconds: 900 } }, 200),
    );
    const client = createSessionApiClient(BASE_URL);

    await client.request("/api/v1/protected");

    const calls = refreshCalls(fetchMock);
    expect(calls).toHaveLength(1);
    const init = calls[0]?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toStrictEqual({ refreshToken: "refresh-1" });
    const headers = new Headers(init.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.has("Authorization")).toBe(false);
  });
});
