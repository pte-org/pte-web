import { describe, expect, it } from "vitest";
import { resolveVendorLoginDestination } from "../../../../features/auth/loginRoles";

describe("resolveVendorLoginDestination", () => {
  it.each(["PLATFORM_ADMIN", "PLATFORM_MANAGER", "ACADEMIC_MANAGER", "ACADEMIC_STAFF"])(
    "sends %s to the admin dashboard",
    (role) => {
      expect(resolveVendorLoginDestination([role])).toBe("/admin");
    },
  );

  it("sends a host to the host dashboard", () => {
    expect(resolveVendorLoginDestination(["HOST_ADMIN"])).toBe("/host");
  });

  it("prefers the admin dashboard when the account is both", () => {
    expect(resolveVendorLoginDestination(["HOST_ADMIN", "PLATFORM_ADMIN"])).toBe("/admin");
  });

  it.each(["EXAMINER", "PROCTOR", "STUDENT"])(
    "has no destination for %s, which belongs to another portal",
    (role) => {
      expect(resolveVendorLoginDestination([role])).toBeNull();
    },
  );

  it("has no destination for an account without a recognised role", () => {
    expect(resolveVendorLoginDestination([])).toBeNull();
    expect(resolveVendorLoginDestination(["OTHER"])).toBeNull();
  });
});
