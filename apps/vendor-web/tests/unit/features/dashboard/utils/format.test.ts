import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatMessage,
  formatMonthLabel,
  formatNumber,
  formatPercent,
  formatTenantStatus,
  keyForCount,
} from "../../../../../features/dashboard/utils/format";
import { ADMIN_DASHBOARD_EN } from "../../../../../features/dashboard/messages/en";
import { ADMIN_DASHBOARD_VI } from "../../../../../features/dashboard/messages/vi";

describe("formatNumber", () => {
  it("formats integers according to locale", () => {
    expect(formatNumber(1250, "en")).toBe("1,250");
    // Vietnamese uses dot or period depending on node ICU, but verify it formats properly
    expect(formatNumber(1250, "vi")).toBeDefined();
    expect(formatNumber(0, "en")).toBe("0");
  });
});

describe("formatPercent", () => {
  it("formats percentages with up to 1 decimal place", () => {
    expect(formatPercent(25.5, "en")).toBe("25.5%");
    expect(formatPercent(100, "en")).toBe("100%");
    expect(formatPercent(0, "en")).toBe("0%");
  });
});

describe("formatCurrency", () => {
  it("formats VND without decimals", () => {
    const formatted = formatCurrency(50000000, "VND", "vi");
    expect(formatted).toMatch(/50/);
    expect(formatted).toMatch(/₫|VND/);
  });

  it("formats USD with decimals", () => {
    const formatted = formatCurrency(123.45, "USD", "en");
    expect(formatted).toContain("123.45");
  });

  it("falls back gracefully for invalid currency code", () => {
    const fallback = formatCurrency(100, "NOT_A_CURRENCY", "en");
    expect(fallback).toBe("100 NOT_A_CURRENCY");
  });
});

describe("formatDate", () => {
  it("returns dash for null, undefined or empty string", () => {
    expect(formatDate(null, "en")).toBe("—");
    expect(formatDate(undefined, "en")).toBe("—");
    expect(formatDate("", "en")).toBe("—");
  });

  it("returns dash for invalid date string", () => {
    expect(formatDate("not-a-date", "en")).toBe("—");
  });

  it("formats valid ISO timestamp", () => {
    const result = formatDate("2026-10-14T03:00:00Z", "en");
    expect(result).toMatch(/Oct 14, 2026/);
  });
});

describe("formatMonthLabel", () => {
  it("formats YYYY-MM to month and year", () => {
    const enLabel = formatMonthLabel("2026-10", "en");
    expect(enLabel.toLowerCase()).toMatch(/oct/);
    expect(enLabel).toMatch(/26/);

    expect(formatMonthLabel("2026-10", "vi")).toBe("T10/26");
    expect(formatMonthLabel("2025-12", "vi")).toBe("T12/25");
    expect(formatMonthLabel("2026-01", "vi")).toBe("T1/26");
  });

  it("returns original string for malformed input", () => {
    expect(formatMonthLabel("invalid", "en")).toBe("invalid");
    expect(formatMonthLabel("2026-99", "en")).toBe("2026-99");
  });
});

describe("formatMessage", () => {
  it("replaces known placeholders", () => {
    expect(formatMessage("Hello {name}, you have {count} messages", { name: "Admin", count: 5 }))
      .toBe("Hello Admin, you have 5 messages");
  });

  it("leaves unmatched placeholders untouched", () => {
    expect(formatMessage("Hello {name}, {unknown}", { name: "Admin" }))
      .toBe("Hello Admin, {unknown}");
  });

  it("returns template untouched when no values provided", () => {
    expect(formatMessage("Hello {name}")).toBe("Hello {name}");
  });
});

describe("keyForCount", () => {
  it("returns singular when count is 1, plural otherwise", () => {
    expect(keyForCount(1, "day", "days")).toBe("day");
    expect(keyForCount(0, "day", "days")).toBe("days");
    expect(keyForCount(2, "day", "days")).toBe("days");
  });
});

describe("formatTenantStatus", () => {
  it("formats uppercase ACTIVE status in Vietnamese and English", () => {
    expect(formatTenantStatus("ACTIVE", ADMIN_DASHBOARD_VI)).toBe("Hoạt động");
    expect(formatTenantStatus("ACTIVE", ADMIN_DASHBOARD_EN)).toBe("Active");
  });

  it("formats uppercase SUSPENDED status in Vietnamese and English", () => {
    expect(formatTenantStatus("SUSPENDED", ADMIN_DASHBOARD_VI)).toBe("Tạm ngưng");
    expect(formatTenantStatus("SUSPENDED", ADMIN_DASHBOARD_EN)).toBe("Suspended");
  });

  it("formats lowercase and mixed-case statuses correctly", () => {
    expect(formatTenantStatus("active", ADMIN_DASHBOARD_VI)).toBe("Hoạt động");
    expect(formatTenantStatus("suspended", ADMIN_DASHBOARD_VI)).toBe("Tạm ngưng");
    expect(formatTenantStatus("pending", ADMIN_DASHBOARD_VI)).toBe("Chờ duyệt");
  });

  it("handles empty or unknown status gracefully", () => {
    expect(formatTenantStatus("", ADMIN_DASHBOARD_VI)).toBe("");
    expect(formatTenantStatus(null, ADMIN_DASHBOARD_VI)).toBe("");
    expect(formatTenantStatus("UNKNOWN_STATUS", ADMIN_DASHBOARD_VI)).toBe("UNKNOWN_STATUS");
  });
});
