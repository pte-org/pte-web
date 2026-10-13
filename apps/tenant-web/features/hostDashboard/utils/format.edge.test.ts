import { describe, expect, it } from "vitest";
import { HOST_DASHBOARD_EN } from "../messages/en";
import { HOST_DASHBOARD_VI } from "../messages/vi";
import {
  formatDate,
  formatDateTime,
  formatMessage,
  formatMonthLabel,
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from "./format";

const HCM = "Asia/Ho_Chi_Minh";
/** ICU may put a narrow no-break space before AM/PM; compare with plain spaces. */
const plain = (text: string): string => text.replace(/\s/g, " ");

describe("number formatting per locale", () => {
  it("groups thousands and separates decimals the local way", () => {
    expect(formatNumber(1234567, "en")).toBe("1,234,567");
    expect(formatNumber(1234567, "vi")).toBe("1.234.567");
    expect(formatNumber(1234.5, "en")).toBe("1,234.5");
    expect(formatNumber(1234.5, "vi")).toBe("1.234,5");
  });

  it("formats zero, a negative and a small number", () => {
    expect(formatNumber(0, "vi")).toBe("0");
    expect(formatNumber(-1234, "vi")).toBe("-1.234");
    expect(formatNumber(999, "en")).toBe("999");
  });

  it("formats whole and signed percentages per locale", () => {
    expect(formatPercent(0, "en")).toBe("0%");
    expect(formatPercent(100, "vi")).toBe("100%");
    expect(formatSignedPercent(123.45, "en")).toBe("+123.5%");
    expect(formatSignedPercent(123.45, "vi")).toMatch(/^\+123,5\s?%$/);
    expect(formatSignedPercent(-3, "vi")).toMatch(/^-3\s?%$/);
  });
});

describe("dates in Asia/Ho_Chi_Minh", () => {
  it("shows an ISO instant as UTC+7 wall time", () => {
    expect(plain(formatDateTime("2026-10-12T08:30:00Z", "en", HCM))).toBe("Oct 12, 2026, 3:30 PM");
    expect(formatDateTime("2026-10-12T08:30:00Z", "vi", HCM)).toBe("15:30 12 thg 10, 2026");
  });

  it("moves an instant just before midnight UTC to the next calendar day", () => {
    expect(formatDate("2026-10-12T17:00:00Z", "en", HCM)).toBe("Oct 13, 2026");
    expect(formatDate("2026-10-12T16:59:59Z", "en", HCM)).toBe("Oct 12, 2026");
  });

  it("moves the last evening of a month to the first of the next", () => {
    expect(formatDate("2026-10-31T17:30:00Z", "en", HCM)).toBe("Nov 1, 2026");
    expect(formatDate("2026-10-31T17:30:00Z", "en", "UTC")).toBe("Oct 31, 2026");
    expect(formatDate("2026-10-31T17:30:00Z", "vi", HCM)).toBe("1 thg 11, 2026");
    expect(plain(formatDateTime("2026-10-31T17:30:00Z", "en", HCM))).toBe("Nov 1, 2026, 12:30 AM");
  });

  it("moves New Year's Eve evening into the next year", () => {
    expect(formatDate("2026-12-31T17:00:00Z", "en", HCM)).toBe("Jan 1, 2027");
    expect(formatDate("2026-12-31T16:59:00Z", "en", HCM)).toBe("Dec 31, 2026");
  });

  it("handles a leap day", () => {
    expect(formatDate("2028-02-28T17:00:00Z", "en", HCM)).toBe("Feb 29, 2028");
  });

  it("returns an empty string for blank, garbage and non-date input", () => {
    for (const bad of ["", "   ", "nope", "2026-13-45", "undefined"]) {
      expect(formatDate(bad, "en", HCM), bad).toBe("");
      expect(formatDateTime(bad, "vi", HCM), bad).toBe("");
    }
  });

  it("does not depend on the machine zone when a zone is given", () => {
    const first = formatDateTime("2026-06-15T12:00:00Z", "en", HCM);
    expect(plain(first)).toBe("Jun 15, 2026, 7:00 PM");
  });
});

describe("month labels", () => {
  it("is not shifted by the viewer's zone at either end of the year", () => {
    expect(formatMonthLabel("2026-01", "en")).toBe("Jan 2026");
    expect(formatMonthLabel("2026-12", "en")).toBe("Dec 2026");
    expect(formatMonthLabel("2026-01", "vi")).toBe("thg 1 2026");
    expect(formatMonthLabel("2026-12", "vi")).toBe("thg 12 2026");
  });

  it("returns a malformed key untouched", () => {
    for (const bad of ["", "2026", "2026-1", "26-10", "2026-10-01", "2026-ab", "2026-13", "2026-00"]) {
      expect(formatMonthLabel(bad, "en"), bad).toBe(bad);
    }
  });
});

describe("message templates", () => {
  it("fills the numeric placeholders of a relative day count in both catalogs", () => {
    expect(formatMessage(HOST_DASHBOARD_EN.expiryDays, { days: 231 })).toBe("Expires in 231 days");
    expect(formatMessage(HOST_DASHBOARD_VI.expiryDays, { days: 231 })).toBe("Hết hạn sau 231 ngày");
    expect(formatMessage(HOST_DASHBOARD_EN.attentionUnitDays, { count: 7 })).toBe("7 days");
    expect(formatMessage(HOST_DASHBOARD_VI.attentionUnitDays, { count: 7 })).toBe("7 ngày");
  });

  it("fills percent and used/limit placeholders", () => {
    expect(formatMessage(HOST_DASHBOARD_EN.usageSeatsUsed, { used: "1,234", limit: "5,000" })).toBe("1,234 of 5,000 seats");
    expect(formatMessage(HOST_DASHBOARD_VI.usageSeatsUsed, { used: "1.234", limit: "5.000" })).toBe("1.234 / 5.000 chỗ");
    expect(formatMessage(HOST_DASHBOARD_EN.usageSeatsPercent, { percent: 90 })).toBe("90% used");
  });

  it("does not interpret dollar signs or regex characters in values", () => {
    expect(formatMessage("{name} done", { name: "$& (a+b)" })).toBe("$& (a+b) done");
  });
});
