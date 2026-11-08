import { describe, expect, it } from "vitest";
import { ApiError, type ApiErrorKind } from "@pte/api-client";
import { getLoginErrorMessage } from "../../../../features/auth/loginError";
import { AUTH_TEXT } from "../../../../features/auth/constants";

describe("login error messages", () => {
  it.each<[ApiErrorKind, number, string]>([
    ["unauthorized", 401, AUTH_TEXT.INVALID_CREDENTIALS],
    ["validation", 400, AUTH_TEXT.INVALID_CREDENTIALS],
    ["network", 0, AUTH_TEXT.NETWORK_ERROR],
    ["unknown", 429, AUTH_TEXT.RATE_LIMITED],
    ["server", 503, AUTH_TEXT.SERVICE_UNAVAILABLE],
    ["forbidden", 403, AUTH_TEXT.GENERIC_ERROR],
  ])("maps %s/%i without exposing diagnostic copy", (kind, status, expected) => {
    const error = new ApiError(kind, status, "INTERNAL_DIAGNOSTIC", undefined, {
      code: "ACCOUNT_LOOKUP_DETAIL", userMessage: "Private account detail",
    });
    expect(getLoginErrorMessage(error)).toBe(expected);
  });

  it("uses the caller's localized copy for rejected credentials", () => {
    const text = { ...AUTH_TEXT, INVALID_CREDENTIALS: "Tên đăng nhập hoặc mật khẩu không đúng." };
    expect(getLoginErrorMessage(new ApiError("unauthorized", 401, "INVALID_LOGIN"), text))
      .toBe(text.INVALID_CREDENTIALS);
  });

  it("does not expose raw exception messages", () => {
    expect(getLoginErrorMessage(new Error("Provider secret diagnostic"))).toBe(AUTH_TEXT.GENERIC_ERROR);
  });
});
