import { describe, expect, it, vi } from "vitest";
import {
  MIN_PASSWORD_LENGTH,
  submitForgotPassword,
  validateNewPassword,
} from "../../../src/utils/passwordReset";

describe("validateNewPassword", () => {
  it("accepts a long enough password that matches its confirmation", () => {
    expect(validateNewPassword("NewPassword456", "NewPassword456")).toBeNull();
  });

  it("reports what is wrong, most basic problem first", () => {
    expect(validateNewPassword("", "")).toBe("REQUIRED");
    expect(validateNewPassword("abc", "abc")).toBe("TOO_SHORT");
    expect(validateNewPassword("a".repeat(MIN_PASSWORD_LENGTH), "b".repeat(MIN_PASSWORD_LENGTH))).toBe("MISMATCH");
  });

  it("needs the confirmation filled in", () => {
    expect(validateNewPassword("NewPassword456", "")).toBe("REQUIRED");
  });
});

describe("submitForgotPassword", () => {
  it("does not call the server for a blank address", async () => {
    const send = vi.fn();

    expect(await submitForgotPassword("   ", send)).toBe("EMAIL_REQUIRED");
    expect(send).not.toHaveBeenCalled();
  });

  it("sends the trimmed address and reports SENT", async () => {
    const send = vi.fn().mockResolvedValue(undefined);

    expect(await submitForgotPassword("  host@x.vn ", send)).toBe("SENT");
    expect(send).toHaveBeenCalledWith("host@x.vn");
  });

  it("reports SENT even when the call fails, so the screen never reveals whether an account exists", async () => {
    const send = vi.fn().mockRejectedValue(new Error("boom"));

    expect(await submitForgotPassword("host@x.vn", send)).toBe("SENT");
  });
});
