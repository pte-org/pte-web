import { describe, expect, it } from "vitest";
import { isStudentOnlyAccount, toSessionRoles } from "../../../../features/auth/sessionRoles";

describe("portal session roles", () => {
  it("never keeps STUDENT as a portal role", () => {
    expect(toSessionRoles(["STUDENT"])).toEqual([]);
    expect(toSessionRoles(["HOST_ADMIN", "STUDENT"])).toEqual(["HOST_ADMIN"]);
  });

  it("keeps every staff role and drops unknown ones", () => {
    expect(
      toSessionRoles(["PLATFORM_ADMIN", "PLATFORM_AUTHOR", "HOST_ADMIN", "EXAMINER", "PROCTOR", "OTHER"]),
    ).toEqual(["PLATFORM_ADMIN", "PLATFORM_AUTHOR", "HOST_ADMIN", "EXAMINER", "PROCTOR"]);
  });

  it("recognises a student-only account so login can refuse it with a specific message", () => {
    expect(isStudentOnlyAccount(["STUDENT"])).toBe(true);
  });

  it("does not flag staff accounts, unknown accounts or staff who also hold STUDENT", () => {
    expect(isStudentOnlyAccount(["HOST_ADMIN"])).toBe(false);
    expect(isStudentOnlyAccount(["HOST_ADMIN", "STUDENT"])).toBe(false);
    expect(isStudentOnlyAccount([])).toBe(false);
    expect(isStudentOnlyAccount(["OTHER"])).toBe(false);
  });
});
