import { describe, expect, it } from "vitest";
import { formatTemplateTimestamp } from "../../../../features/scoretemplate/templateInfo";

describe("formatTemplateTimestamp", () => {
  it("shows a dash when there is no time", () => {
    expect(formatTemplateTimestamp(null, "en")).toBe("—");
    expect(formatTemplateTimestamp(undefined, "vi")).toBe("—");
    expect(formatTemplateTimestamp("not a date", "en")).toBe("—");
  });

  it("shows the date and the time", () => {
    expect(formatTemplateTimestamp("2026-11-03T07:05:00Z", "en")).toMatch(/2026/);
  });
});
