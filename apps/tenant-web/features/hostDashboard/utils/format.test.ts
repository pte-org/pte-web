import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatMessage,
  formatMonthLabel,
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from "./format";

const ISO = "2026-10-20T01:00:00Z";
const HCM = "Asia/Ho_Chi_Minh";

describe("formatMessage", () => {
  it("fills placeholders with strings and numbers", () => {
    expect(formatMessage("{count} new in {days} days", { count: 5, days: "30" })).toBe("5 new in 30 days");
  });

  it("fills a repeated placeholder everywhere", () => {
    expect(formatMessage("{days} vs {days}", { days: 7 })).toBe("7 vs 7");
  });

  it("leaves a placeholder without a value untouched", () => {
    expect(formatMessage("{count} of {total}", { count: 1 })).toBe("1 of {total}");
  });

  it("returns the template when no values are given", () => {
    expect(formatMessage("{count} items")).toBe("{count} items");
  });

  it("keeps a zero value (falsy but present)", () => {
    expect(formatMessage("{count} left", { count: 0 })).toBe("0 left");
  });
});

describe("number formatting", () => {
  it("groups thousands per locale", () => {
    expect(formatNumber(1234, "en")).toBe("1,234");
    expect(formatNumber(1234, "vi")).toBe("1.234");
  });

  it("formats zero", () => {
    expect(formatNumber(0, "en")).toBe("0");
  });

  it("formats a signed change with one decimal at most", () => {
    expect(formatSignedPercent(12.5, "en")).toBe("+12.5%");
    expect(formatSignedPercent(-3, "en")).toBe("-3%");
    expect(formatSignedPercent(100, "en")).toBe("+100%");
    expect(formatSignedPercent(12.34, "en")).toBe("+12.3%");
  });

  it("shows zero change without a sign", () => {
    expect(formatSignedPercent(0, "en")).toBe("0%");
  });

  it("uses the Vietnamese decimal comma", () => {
    expect(formatSignedPercent(12.5, "vi")).toMatch(/^\+12,5\s?%$/);
  });

  it("formats a whole percent", () => {
    expect(formatPercent(97, "en")).toBe("97%");
    expect(formatPercent(97.4, "en")).toBe("97%");
  });
});

describe("date formatting", () => {
  it("renders an instant in the given zone", () => {
    const text = formatDateTime(ISO, "en", HCM);
    expect(text).toContain("2026");
    expect(text).toMatch(/8:00/);
  });

  it("renders the same instant on another day in a far zone", () => {
    expect(formatDate("2026-10-19T20:00:00Z", "en", HCM)).toContain("20");
    expect(formatDate("2026-10-19T20:00:00Z", "en", "UTC")).toContain("19");
  });

  it("returns an empty string for an invalid instant", () => {
    expect(formatDateTime("not a date", "en", HCM)).toBe("");
    expect(formatDate("", "vi", HCM)).toBe("");
  });

  it("falls back to the browser zone when the zone name is unknown", () => {
    expect(formatDateTime(ISO, "en", "Not/AZone")).toContain("2026");
  });

  it("formats in the Vietnamese locale", () => {
    expect(formatDate(ISO, "vi", HCM)).toContain("2026");
  });

  it("labels a month with its year so labels stay unique across years", () => {
    expect(formatMonthLabel("2026-10", "en")).toBe("Oct 2026");
    expect(formatMonthLabel("2025-10", "en")).not.toBe(formatMonthLabel("2026-10", "en"));
  });

  it("is not shifted by the viewer's zone at a month boundary", () => {
    expect(formatMonthLabel("2026-01", "en")).toBe("Jan 2026");
  });

  it("returns a malformed month unchanged", () => {
    expect(formatMonthLabel("2026-13", "en")).toBe("2026-13");
    expect(formatMonthLabel("2026-00", "en")).toBe("2026-00");
    expect(formatMonthLabel("October", "en")).toBe("October");
  });
});
