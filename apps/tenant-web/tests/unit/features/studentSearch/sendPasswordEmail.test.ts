import { describe, expect, it } from "vitest";
import {
  buildSendPasswordEmailTarget,
  getSendPasswordEmailState,
} from "../../../../features/studentSearch/utils/sendPasswordEmail";

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

describe("send password via email target", () => {
  it("names the student, id and address to mail", () => {
    expect(buildSendPasswordEmailTarget("student-1", "Student One", "student@example.test")).toEqual({
      studentPublicId: "student-1",
      fullName: "Student One",
      email: "student@example.test",
    });
  });

  it("trims the address and yields no target without one", () => {
    expect(buildSendPasswordEmailTarget("student-1", "Student One", "  student@example.test ")?.email).toBe(
      "student@example.test",
    );
    expect(buildSendPasswordEmailTarget("student-1", "Student One", null)).toBeNull();
    expect(buildSendPasswordEmailTarget("student-1", "Student One", " ")).toBeNull();
  });
});
