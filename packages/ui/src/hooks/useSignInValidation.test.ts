import { describe, expect, it } from "vitest";
import { validateSignInField, type SignInValidationMessages } from "./useSignInValidation";

const MESSAGES: SignInValidationMessages = {
  usernameRequired: "USERNAME_REQUIRED",
  usernameInvalidEmail: "USERNAME_INVALID_EMAIL",
  passwordRequired: "PASSWORD_REQUIRED",
};

describe("validateSignInField", () => {
  it.each(["", "   ", "\t"])("requires an email (%j)", (value) => {
    expect(validateSignInField("username", value, MESSAGES)).toBe("USERNAME_REQUIRED");
  });

  it.each(["host", "host@", "host@school", "host admin@school.vn", "@school.vn"])(
    "rejects an invalid email (%j)",
    (value) => {
      expect(validateSignInField("username", value, MESSAGES)).toBe("USERNAME_INVALID_EMAIL");
    },
  );

  it("accepts a valid email, ignoring surrounding whitespace", () => {
    expect(validateSignInField("username", "host@school.edu.vn", MESSAGES)).toBeUndefined();
    expect(validateSignInField("username", "  host@school.vn  ", MESSAGES)).toBeUndefined();
  });

  it("requires a password but applies no length rule", () => {
    expect(validateSignInField("password", "", MESSAGES)).toBe("PASSWORD_REQUIRED");
    expect(validateSignInField("password", "a", MESSAGES)).toBeUndefined();
  });
});
