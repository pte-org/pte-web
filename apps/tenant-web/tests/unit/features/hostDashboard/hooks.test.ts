import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  locale: "en" as "en" | "vi",
  labels: { program: "Program", class: "Class", isLoading: false },
}));

vi.mock("@pte/ui", () => ({
  useLocale: () => ({ locale: hoisted.locale }),
}));

vi.mock("@/features/orgLabels/useOrgLabels", () => ({
  useOrgLabels: () => hoisted.labels,
}));

import { useHostDashboardText } from "@/features/hostDashboard/hooks/useHostDashboardText";
import {
  formatDate,
  formatDateTime,
  formatMessage,
  formatMonthLabel,
  formatNumber,
  formatPercent,
  formatSignedPercent,
  keyForCount,
} from "@/features/hostDashboard/utils/format";

describe("features/hostDashboard - Hooks & Format Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.locale = "en";
  });

  describe("useHostDashboardText", () => {
    it("returns formatted text in English", () => {
      let text!: ReturnType<typeof useHostDashboardText>;
      renderToStaticMarkup(createElement(() => {
        text = useHostDashboardText();
        return null;
      }));

      expect(text.locale).toBe("en");
      expect(text.messages.kpiTitle).toBeDefined();
      expect(typeof text.format).toBe("function");
    });

    it("returns formatted text in Vietnamese", () => {
      hoisted.locale = "vi";
      let text!: ReturnType<typeof useHostDashboardText>;
      renderToStaticMarkup(createElement(() => {
        text = useHostDashboardText();
        return null;
      }));

      expect(text.locale).toBe("vi");
      expect(text.messages.kpiTitle).toBeDefined();
    });
  });

  describe("format utils", () => {
    it("formatMessage replaces placeholders correctly", () => {
      expect(formatMessage("Hello {name}", { name: "Antigravity" })).toBe("Hello Antigravity");
      expect(formatMessage("Unmatched {unknown}")).toBe("Unmatched {unknown}");
      expect(formatMessage("No values")).toBe("No values");
    });

    it("keyForCount picks singular or plural key", () => {
      expect(keyForCount(1, "attentionUnitDay", "attentionUnitDays")).toBe(
        "attentionUnitDay",
      );
      expect(keyForCount(5, "attentionUnitDay", "attentionUnitDays")).toBe(
        "attentionUnitDays",
      );
      expect(keyForCount(0, "attentionUnitDay", "attentionUnitDays")).toBe(
        "attentionUnitDays",
      );
    });

    it("formatNumber formats number according to locale", () => {
      expect(formatNumber(1234567, "en")).toBe("1,234,567");
      expect(formatNumber(1234567, "vi")).toContain("1");
    });

    it("formatSignedPercent formats signed percentage", () => {
      expect(formatSignedPercent(12.5, "en")).toContain("+12.5%");
      expect(formatSignedPercent(-5, "en")).toContain("-5%");
      expect(formatSignedPercent(0, "en")).toContain("0%");
    });

    it("formatPercent formats standard percentage without sign", () => {
      expect(formatPercent(75, "en")).toContain("75%");
    });

    it("formatDate and formatDateTime handle valid and invalid dates", () => {
      const iso = "2026-04-15T10:30:00.000Z";
      expect(formatDate(iso, "en", "UTC")).toContain("2026");
      expect(formatDate("invalid-iso", "en")).toBe("");

      expect(formatDateTime(iso, "en", "UTC")).toContain("2026");
      expect(formatDateTime("invalid-iso", "en")).toBe("");
    });

    it("formatMonthLabel formats yyyy-MM strings or returns input when invalid", () => {
      expect(formatMonthLabel("2026-10", "en")).toContain("Oct");
      expect(formatMonthLabel("2026-10", "en")).toContain("2026");
      expect(formatMonthLabel("invalid-month", "en")).toBe("invalid-month");
      expect(formatMonthLabel("2026-13", "en")).toBe("2026-13"); // month > 12
    });
  });
});
