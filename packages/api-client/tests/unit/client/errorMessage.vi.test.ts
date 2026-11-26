import { afterEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../src/client/apiError";
import {
  USER_FACING_ERROR_MESSAGES,
  getUserFacingApiErrorMessage,
  setUserMessageLanguage,
} from "../../../src/client/errorMessage";
import { USER_FACING_ERROR_MESSAGES_VI } from "../../../src/client/userMessagesVi";

const coded = (code: string, userMessage?: string, kind: ApiError["kind"] = "conflict"): ApiError =>
  new ApiError(kind, 409, code, undefined, { code, userMessage });

describe("Vietnamese wording of coded errors", () => {
  afterEach(() => setUserMessageLanguage("en"));

  it("covers every code the English catalog covers, except those whose text carries values from the server", () => {
    const withServerValues = ["SESSION_WINDOW_OUTSIDE_SUBSCRIPTION", "SESSION_CAPACITY_EXCEEDS_SUBSCRIPTION"];
    const missing = Object.keys(USER_FACING_ERROR_MESSAGES).filter(
      (code) => !USER_FACING_ERROR_MESSAGES_VI[code] && !withServerValues.includes(code),
    );
    expect(missing).toEqual([]);
  });

  it("has real text for every code", () => {
    for (const [code, message] of Object.entries(USER_FACING_ERROR_MESSAGES_VI)) {
      expect(message.trim().length, code).toBeGreaterThan(10);
      expect(message, code).not.toMatch(/[{}]/);
    }
  });

  it("replaces the English text the server sends with a coded error", () => {
    const error = coded("SESSION_CAPACITY_EXCEEDED", "The selected audience is larger than this exam's capacity.");

    expect(getUserFacingApiErrorMessage(error)).toBe("The selected audience is larger than this exam's capacity.");

    setUserMessageLanguage("vi");
    expect(getUserFacingApiErrorMessage(error)).toBe("Số học viên đã chọn vượt sức chứa của kỳ thi.");
  });

  it("keeps the server's own text for a code it has no Vietnamese wording for (it fills in values)", () => {
    setUserMessageLanguage("vi");
    const error = coded("SESSION_SUBSCRIPTION_NOT_STARTED", "This exam cannot open yet: its subscription starts on 1 Dec.");

    expect(getUserFacingApiErrorMessage(error)).toBe("This exam cannot open yet: its subscription starts on 1 Dec.");
  });
});
