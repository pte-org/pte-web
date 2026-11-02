import { describe, expect, it } from "vitest";
import { accentOf } from "../../../../features/questionbank/questionDetailStyles";

describe("accentOf", () => {
  it("gives each exam section its own colour", () => {
    const tints = ["SPEAKING", "WRITING", "READING", "LISTENING"].map(
      (section) => accentOf(section).tint,
    );
    expect(new Set(tints).size).toBe(4);
  });

  it("ignores case", () => {
    expect(accentOf("speaking")).toEqual(accentOf("SPEAKING"));
  });

  it("is neutral for an unknown or missing section", () => {
    expect(accentOf(null)).toEqual(accentOf("SOMETHING_ELSE"));
    expect(accentOf(undefined).tint).toContain("--surface-subtle");
  });
});
