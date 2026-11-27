import { describe, expect, it } from "vitest";
import { ApiError } from "@pte/api-client";
import { getAuthFailureMessage } from "../../../../features/auth/authErrors";
import { AUTH_ERROR_TEXT_VI } from "../../../../features/auth/authVietnamese";

const FALLBACK = "Không đổi được mật khẩu.";

const apiError = (status: number, kind: ApiError["kind"], code?: string): ApiError =>
  new ApiError(kind, status, "Server says something in English", undefined, { code });

describe("getAuthFailureMessage", () => {
  it("maps connection, throttling, server and expired-link failures to Vietnamese", () => {
    expect(getAuthFailureMessage(apiError(0, "network"), FALLBACK, "vi", AUTH_ERROR_TEXT_VI))
      .toBe(AUTH_ERROR_TEXT_VI.networkError);
    expect(getAuthFailureMessage(apiError(429, "unknown"), FALLBACK, "vi", AUTH_ERROR_TEXT_VI))
      .toBe(AUTH_ERROR_TEXT_VI.rateLimited);
    expect(getAuthFailureMessage(apiError(500, "server"), FALLBACK, "vi", AUTH_ERROR_TEXT_VI))
      .toBe(AUTH_ERROR_TEXT_VI.serviceUnavailable);
    expect(getAuthFailureMessage(apiError(400, "validation", "INVALID_PASSWORD_RESET_TOKEN"), FALLBACK, "vi",
      AUTH_ERROR_TEXT_VI)).toBe(AUTH_ERROR_TEXT_VI.invalidLink);
  });

  it("shows the screen's own Vietnamese text instead of an untranslated server sentence", () => {
    expect(getAuthFailureMessage(apiError(400, "validation"), FALLBACK, "vi", AUTH_ERROR_TEXT_VI)).toBe(FALLBACK);
    expect(getAuthFailureMessage(new Error("boom"), FALLBACK, "vi", AUTH_ERROR_TEXT_VI)).toBe(FALLBACK);
  });

  it("keeps English on the shared API catalog", () => {
    const message = getAuthFailureMessage(apiError(400, "validation", "INVALID_PASSWORD_RESET_TOKEN"), "Failed.",
      "en", AUTH_ERROR_TEXT_VI);
    expect(message).toContain("reset link");
  });
});
