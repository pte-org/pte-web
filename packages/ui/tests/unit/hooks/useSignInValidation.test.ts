import { describe, expect, it } from "vitest";
import { validateSignInField, type SignInValidationMessages } from "../../../src/hooks/useSignInValidation";

const MESSAGES: SignInValidationMessages = {
  usernameRequired: "USERNAME_REQUIRED",
  passwordRequired: "PASSWORD_REQUIRED",
};

describe("validateSignInField", () => {
  it.each(["", "   ", "\t"])("requires a username (%j)", (value) => {
    expect(validateSignInField("username", value, MESSAGES)).toBe("USERNAME_REQUIRED");
  });

  it.each(["acme.k7m2p9qx", "  acme.k7m2p9qx  ", "host@school.edu.vn", "admin@platform.local", "host"])(
    "accepts a generated username or an email without enforcing a format (%j)",
    (value) => {
      expect(validateSignInField("username", value, MESSAGES)).toBeUndefined();
    },
  );

  it("requires a password but applies no length rule", () => {
    expect(validateSignInField("password", "", MESSAGES)).toBe("PASSWORD_REQUIRED");
    expect(validateSignInField("password", "a", MESSAGES)).toBeUndefined();
  });
});
