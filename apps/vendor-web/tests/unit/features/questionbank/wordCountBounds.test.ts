import { describe, expect, it } from "vitest";
import { wordCountBoundsError } from "../../../../features/questionbank/wordCountBounds";

describe("word count bounds", () => {
  it("accepts equal, ordered, single or empty limits", () => {
    expect(wordCountBoundsError("200", "300")).toBeNull();
    expect(wordCountBoundsError("50", "50")).toBeNull();
    expect(wordCountBoundsError("0", "10")).toBeNull();
    expect(wordCountBoundsError("100", "")).toBeNull();
    expect(wordCountBoundsError("", "100")).toBeNull();
    expect(wordCountBoundsError("", "")).toBeNull();
  });

  it("rejects a minimum above the maximum", () => {
    expect(wordCountBoundsError("300", "200")).not.toBeNull();
  });

  it("rejects negative and non-integer limits, even when only one is given", () => {
    expect(wordCountBoundsError("-1", "10")).not.toBeNull();
    expect(wordCountBoundsError("", "-5")).not.toBeNull();
    expect(wordCountBoundsError("10.5", "20")).not.toBeNull();
    expect(wordCountBoundsError("abc", "20")).not.toBeNull();
  });
});
