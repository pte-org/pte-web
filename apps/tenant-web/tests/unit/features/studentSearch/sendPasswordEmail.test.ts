import { describe, expect, it } from "vitest";
import { getSendPasswordEmailState } from "../../../../features/studentSearch/utils/sendPasswordEmail";

describe("send password via email availability", () => {
  it("is available for a student with an email", () => {
    expect(getSendPasswordEmailState({ email: "student@example.test" })).toEqual({
      enabled: true,
      reason: null,
    });
  });

  it("is unavailable, with a reason, when the student has no email", () => {
    expect(getSendPasswordEmailState({ email: "" })).toEqual({ enabled: false, reason: "NO_EMAIL" });
    expect(getSendPasswordEmailState({ email: "   " })).toEqual({ enabled: false, reason: "NO_EMAIL" });
    expect(getSendPasswordEmailState({ email: null })).toEqual({ enabled: false, reason: "NO_EMAIL" });
  });
});
