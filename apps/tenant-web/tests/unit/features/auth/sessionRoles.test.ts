import { describe, expect, it } from "vitest";
import { decidePortalLogin, toSessionRoles } from "../../../../features/auth/sessionRoles";

describe("portal session roles", () => {
  it("never keeps STUDENT as a portal role", () => {
    expect(toSessionRoles(["STUDENT"])).toEqual([]);
    expect(toSessionRoles(["HOST_ADMIN", "STUDENT"])).toEqual(["HOST_ADMIN"]);
  });

  it("keeps only the roles that have a workspace in this portal", () => {
    expect(
      toSessionRoles([
        "PLATFORM_ADMIN",
        "PLATFORM_MANAGER",
        "PLATFORM_AUTHOR",
        "ACADEMIC_MANAGER",
        "ACADEMIC_STAFF",
        "HOST_ADMIN",
        "EXAMINER",
        "PROCTOR",
        "OTHER",
      ]),
    ).toEqual(["HOST_ADMIN", "EXAMINER", "PROCTOR"]);
  });
});

describe("decidePortalLogin", () => {
  it.each(["HOST_ADMIN", "EXAMINER", "PROCTOR"])("lets %s in", (role) => {
    expect(decidePortalLogin([role])).toEqual({ kind: "allowed", roles: [role] });
  });

  it.each(["PLATFORM_ADMIN", "PLATFORM_MANAGER", "PLATFORM_AUTHOR", "ACADEMIC_MANAGER", "ACADEMIC_STAFF"])(
    "denies %s, which belongs to the vendor portal",
    (role) => {
      expect(decidePortalLogin([role])).toEqual({ kind: "denied" });
    },
  );

  it("denies an account with no recognised role", () => {
    expect(decidePortalLogin([])).toEqual({ kind: "denied" });
    expect(decidePortalLogin(["OTHER"])).toEqual({ kind: "denied" });
  });

  it("keeps the specific student message for a student-only account", () => {
    expect(decidePortalLogin(["STUDENT"])).toEqual({ kind: "student" });
  });

  it("lets a host through even if the account is also a platform admin or a student", () => {
    expect(decidePortalLogin(["PLATFORM_ADMIN", "HOST_ADMIN"])).toEqual({
      kind: "allowed",
      roles: ["HOST_ADMIN"],
    });
    expect(decidePortalLogin(["HOST_ADMIN", "STUDENT"])).toEqual({
      kind: "allowed",
      roles: ["HOST_ADMIN"],
    });
  });
});
