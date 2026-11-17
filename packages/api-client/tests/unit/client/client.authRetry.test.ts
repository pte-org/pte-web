import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../src/client/apiError";
import { createApiClient, type ApiClient, type RefreshedTokens } from "../../../src/client/client";

const BASE_URL = "https://api.example.test";
const NEW_TOKENS: RefreshedTokens = { accessToken: "new-access", refreshToken: "new-refresh", expiresInSeconds: 60 };

function unauthorized(): Response {
  return new Response(JSON.stringify({ success: false, data: null, message: "expired" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

type MethodName = "request" | "upload" | "uploadDownload" | "download" | "openStream";

interface MethodCase {
  name: MethodName;
  path: string;
  success: () => Response;
  invoke: (client: ApiClient) => Promise<unknown>;
  assertResult: (result: unknown) => Promise<void>;
}

function formData(): FormData {
  const form = new FormData();
  form.append("file", new Blob(["input"]), "in.xlsx");
  return form;
}

const CASES: MethodCase[] = [
  {
    name: "request",
    path: "/api/v1/things",
    success: () =>
      new Response(JSON.stringify({ success: true, data: { id: 7 } }), { status: 200, headers: { "Content-Type": "application/json" } }),
    invoke: (client) => client.request("/api/v1/things"),
    assertResult: async (result) => expect(result).toStrictEqual({ id: 7 }),
  },
  {
    name: "upload",
    path: "/api/v1/things/import",
    success: () =>
      new Response(JSON.stringify({ success: true, data: { imported: 3 } }), { status: 200, headers: { "Content-Type": "application/json" } }),
    invoke: (client) => client.upload("/api/v1/things/import", formData()),
    assertResult: async (result) => expect(result).toStrictEqual({ imported: 3 }),
  },
  {
    name: "uploadDownload",
    path: "/api/v1/things/convert",
    success: () =>
      new Response(new Blob(["converted"]), {
        status: 200,
        headers: { "Content-Disposition": 'attachment; filename="out.xlsx"' },
      }),
    invoke: (client) => client.uploadDownload("/api/v1/things/convert", formData()),
    assertResult: async (result) => {
      const download = result as { blob: Blob; filename: string };
      expect(download.filename).toBe("out.xlsx");
      expect(await download.blob.text()).toBe("converted");
    },
  },
  {
    name: "download",
    path: "/api/v1/things/export",
    success: () =>
      new Response(new Blob(["exported"]), {
        status: 200,
        headers: { "Content-Disposition": 'attachment; filename="export.csv"' },
      }),
    invoke: (client) => client.download("/api/v1/things/export"),
    assertResult: async (result) => {
      const download = result as { blob: Blob; filename: string };
      expect(download.filename).toBe("export.csv");
      expect(await download.blob.text()).toBe("exported");
    },
  },
  {
    name: "openStream",
    path: "/api/v1/things/stream",
    success: () => new Response("event-data", { status: 200 }),
    invoke: (client) => client.openStream("/api/v1/things/stream"),
    assertResult: async (result) => {
      const stream = result as ReadableStream<Uint8Array>;
      expect(await new Response(stream).text()).toBe("event-data");
    },
  },
];

function authorizationOf(fetchFn: ReturnType<typeof vi.fn>, call: number): string | null {
  const init = fetchFn.mock.calls[call]?.[1] as RequestInit;
  return new Headers(init.headers).get("Authorization");
}

interface Harness {
  client: ApiClient;
  fetchFn: ReturnType<typeof vi.fn>;
  refreshAccessToken: ReturnType<typeof vi.fn>;
  onUnauthorized: ReturnType<typeof vi.fn>;
}

function harness(fetchFn: ReturnType<typeof vi.fn>, refreshAccessToken: ReturnType<typeof vi.fn>): Harness {
  let token = "old-access";
  const onUnauthorized = vi.fn();
  const client = createApiClient({
    baseUrl: BASE_URL,
    fetchFn,
    getToken: () => token,
    getRefreshToken: () => "refresh-1",
    refreshAccessToken,
    onTokenRefreshed: (tokens) => {
      token = tokens.accessToken;
    },
    onUnauthorized,
  });
  return { client, fetchFn, refreshAccessToken, onUnauthorized };
}

describe("ApiClient 401 -> refresh -> retry", () => {
  it.each(CASES)("$name retries once with the refreshed token", async (testCase) => {
    const fetchFn = vi.fn().mockResolvedValueOnce(unauthorized()).mockResolvedValueOnce(testCase.success());
    const h = harness(fetchFn, vi.fn().mockResolvedValue(NEW_TOKENS));

    const result = await testCase.invoke(h.client);

    await testCase.assertResult(result);
    expect(h.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn.mock.calls[0]?.[0]).toBe(`${BASE_URL}${testCase.path}`);
    expect(fetchFn.mock.calls[1]?.[0]).toBe(`${BASE_URL}${testCase.path}`);
    expect(authorizationOf(fetchFn, 0)).toBe("Bearer old-access");
    expect(authorizationOf(fetchFn, 1)).toBe("Bearer new-access");
    expect(h.onUnauthorized).not.toHaveBeenCalled();
  });

  it.each(CASES)("$name does not refresh again after a second 401 and signs out once", async (testCase) => {
    const fetchFn = vi.fn().mockImplementation(async () => unauthorized());
    const h = harness(fetchFn, vi.fn().mockResolvedValue(NEW_TOKENS));

    const error = await testCase.invoke(h.client).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "unauthorized", status: 401 });
    expect(h.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(h.onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it.each(CASES)("$name fails as a network error and leaves the session when the refresh cannot complete", async (testCase) => {
    const fetchFn = vi.fn().mockImplementation(async () => unauthorized());
    const h = harness(fetchFn, vi.fn().mockRejectedValue(new Error("offline")));

    const error = await testCase.invoke(h.client).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "network", status: 0 });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(h.onUnauthorized).not.toHaveBeenCalled();
  });
});
