import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../src/client/apiError";
import { createApiClient } from "../../../src/client/client";
import { getUserFacingApiErrorMessage, setUserMessageLanguage } from "../../../src/client/errorMessage";

const BASE_URL = "https://api.example.test";

const limited = (retryAfter: string | null = "1"): Response =>
  new Response(JSON.stringify({ success: false, data: null, message: "Rate limit exceeded. Try again shortly." }), {
    status: 429,
    headers: retryAfter === null ? undefined : { "Retry-After": retryAfter },
  });

const ok = (): Response =>
  new Response(JSON.stringify({ success: true, data: { id: 7 } }), { status: 200 });

const clientWith = (fetchFn: ReturnType<typeof vi.fn>) =>
  createApiClient({ baseUrl: BASE_URL, fetchFn, getToken: () => "token" });

describe("ApiClient request rate limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("waits the time the server names and asks again, so a brief limit never reaches the person", async () => {
    const fetchFn = vi.fn().mockResolvedValueOnce(limited()).mockResolvedValueOnce(ok());
    const pending = clientWith(fetchFn).request("/api/v1/things");

    await vi.advanceTimersByTimeAsync(1000);

    await expect(pending).resolves.toStrictEqual({ id: 7 });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("gives up after two more tries and reports the limit", async () => {
    const fetchFn = vi.fn().mockImplementation(async () => limited());
    const pending = clientWith(fetchFn).request("/api/v1/things");
    const outcome = pending.catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(5000);

    const error = await outcome;
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(429);
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it("does not wait on a rejection that names no short wait", async () => {
    const withoutHeader = vi.fn().mockResolvedValue(limited(null));
    await expect(clientWith(withoutHeader).request("/api/v1/things")).rejects.toMatchObject({ status: 429 });
    expect(withoutHeader).toHaveBeenCalledTimes(1);

    const tooLong = vi.fn().mockResolvedValue(limited("60"));
    await expect(clientWith(tooLong).request("/api/v1/things")).rejects.toMatchObject({ status: 429 });
    expect(tooLong).toHaveBeenCalledTimes(1);
  });
});

describe("user-facing text of a rate limit", () => {
  it("says the system is busy instead of a generic failure", () => {
    const error = new ApiError("unknown", 429, "Rate limit exceeded. Try again shortly.");
    expect(getUserFacingApiErrorMessage(error)).toContain("busy");
    expect(getUserFacingApiErrorMessage(error, "We could not load this.")).toContain("busy");
  });
});

describe("user-facing text in Vietnamese", () => {
  afterEach(() => setUserMessageLanguage("en"));

  it("follows the language chosen for the app, for the general messages", () => {
    setUserMessageLanguage("vi");
    expect(getUserFacingApiErrorMessage(new ApiError("unknown", 429, "x"))).toBe(
      "Hệ thống đang bận. Vui lòng đợi vài giây rồi thử lại.",
    );
    expect(getUserFacingApiErrorMessage(new ApiError("unknown", 418, "x"))).toContain("Không thể thực hiện");
    expect(getUserFacingApiErrorMessage(new ApiError("network", 0, "x"))).toContain("Không thể kết nối");
    expect(getUserFacingApiErrorMessage(new ApiError("server", 500, "x"))).toContain("Máy chủ");
    expect(getUserFacingApiErrorMessage(new Error("boom"))).toContain("Không thể thực hiện");
  });

  it("still prefers the screen's own fallback text", () => {
    setUserMessageLanguage("vi");
    expect(getUserFacingApiErrorMessage(new ApiError("unknown", 418, "x"), "Không tải được lớp.")).toBe(
      "Không tải được lớp.",
    );
  });
});
