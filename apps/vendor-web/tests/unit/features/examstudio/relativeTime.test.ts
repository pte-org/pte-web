import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "../../../../features/examstudio/relativeTime";

const NOW = new Date("2026-11-03T12:00:00Z");

describe("formatRelativeTime", () => {
  it("counts back in the largest whole unit", () => {
    expect(formatRelativeTime("2026-11-03T09:00:00Z", NOW, "en")).toBe("3 hours ago");
    expect(formatRelativeTime("2026-11-03T11:30:00Z", NOW, "en")).toBe("30 minutes ago");
    expect(formatRelativeTime("2026-10-29T12:00:00Z", NOW, "en")).toBe("5 days ago");
  });

  it("says yesterday for one day back", () => {
    expect(formatRelativeTime("2026-11-02T12:00:00Z", NOW, "en")).toBe("yesterday");
  });

  it("says now for the last few seconds", () => {
    expect(formatRelativeTime("2026-11-03T11:59:40Z", NOW, "en")).toBe("now");
  });

  it("returns nothing for a value that is not a time", () => {
    expect(formatRelativeTime("not a date", NOW, "en")).toBe("");
  });
});
