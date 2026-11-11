import { describe, expect, it } from "vitest";
import { returnPath, signInHref } from "../../../src/utils/returnPath";

const LOGIN = "/login";

describe("return path after sign-in", () => {
  it("brings the user back to the page that asked for sign-in", () => {
    expect(signInHref(LOGIN, "/question-bank")).toBe("/login?next=%2Fquestion-bank");
    expect(returnPath("?next=%2Fquestion-bank", LOGIN)).toBe("/question-bank");
  });

  it("has nothing to return to from home or an empty query", () => {
    expect(signInHref(LOGIN, "/")).toBe(LOGIN);
    expect(returnPath("", LOGIN)).toBeNull();
  });

  it("never follows another site or loops back to login", () => {
    expect(returnPath("?next=https%3A%2F%2Fevil.test", LOGIN)).toBeNull();
    expect(returnPath("?next=%2F%2Fevil.test", LOGIN)).toBeNull();
    expect(returnPath("?next=%2F%5Cevil.test", LOGIN)).toBeNull();
    expect(returnPath("?next=%2Flogin", LOGIN)).toBeNull();
    expect(signInHref(LOGIN, "//evil.test")).toBe(LOGIN);
  });
});
