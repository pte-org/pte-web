import { describe, expect, it } from "vitest";
import { sectionTone } from "../../../lib/chipTones";

describe("sectionTone", () => {
  it("gives each exam section its own colour", () => {
    const tones = ["SPEAKING", "WRITING", "READING", "LISTENING"].map(sectionTone);
    expect(new Set(tones).size).toBe(4);
  });

  it("ignores case", () => {
    expect(sectionTone("speaking")).toBe(sectionTone("SPEAKING"));
  });

  it("is neutral for an unknown or missing section", () => {
    expect(sectionTone(null)).toBe("neutral");
    expect(sectionTone(undefined)).toBe("neutral");
    expect(sectionTone("SOMETHING_ELSE")).toBe("neutral");
  });
});
