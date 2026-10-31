import { describe, expect, it } from "vitest";
import type { ChatUsageDayResponse } from "@pte/api-client";
import { activeDays, chartRows, failedTone, isSameRange, usagePresets } from "./presentation";

function day(overrides: Partial<ChatUsageDayResponse> = {}): ChatUsageDayResponse {
  return {
    date: "2026-10-29",
    messages: 0,
    ok: 0,
    refused: 0,
    failed: 0,
    tokensIn: 0,
    tokensOut: 0,
    tokensThinking: 0,
    estimatedCostUsd: 0,
    ...overrides,
  };
}

describe("activeDays", () => {
  it("keeps only the days that had messages", () => {
    const days = [day({ date: "2026-10-01" }), day({ date: "2026-10-02", messages: 3 }), day({ date: "2026-10-03" })];

    expect(activeDays(days).map((d) => d.date)).toEqual(["2026-10-02"]);
  });

  it("is empty when nobody chatted", () => {
    expect(activeDays([day(), day({ date: "2026-10-30" })])).toEqual([]);
  });
});

describe("chartRows", () => {
  it("labels each day dd/MM and splits it into answered, refused and failed", () => {
    const rows = chartRows([day({ date: "2026-10-02", messages: 6, ok: 3, refused: 2, failed: 1 })]);

    expect(rows).toEqual([{ label: "02/10", ok: 3, refused: 2, failed: 1 }]);
  });

  it("adds the year to the labels when the range crosses a year so labels stay unique", () => {
    const rows = chartRows([day({ date: "2025-12-31" }), day({ date: "2026-12-31" })]);

    expect(rows.map((r) => r.label)).toEqual(["31/12/2025", "31/12/2026"]);
  });

  it("is empty for no days", () => {
    expect(chartRows([])).toEqual([]);
  });
});

describe("failedTone", () => {
  it.each([
    [0, "neutral"],
    [10, "neutral"],
    [10.1, "danger"],
    [30, "danger"],
  ] as const)("a failed rate of %s%% is %s", (rate, tone) => {
    expect(failedTone(rate)).toBe(tone);
  });
});

describe("usagePresets", () => {
  // 2026-10-29 03:00 UTC is 10:00 on the same day in Vietnam.
  const now = new Date("2026-10-29T03:00:00Z");

  it("offers the last 7 days, the last 30 days and this month, ending today in Vietnam", () => {
    expect(usagePresets(now)).toEqual([
      { key: "last7", from: "2026-10-23", to: "2026-10-29" },
      { key: "last30", from: "2026-09-30", to: "2026-10-29" },
      { key: "thisMonth", from: "2026-10-01", to: "2026-10-29" },
    ]);
  });

  it("uses the Vietnam calendar day, which is already tomorrow late in the evening UTC", () => {
    const late = new Date("2026-10-29T20:00:00Z"); // 03:00 on the 30th in Vietnam
    expect(usagePresets(late)[2]).toEqual({ key: "thisMonth", from: "2026-10-01", to: "2026-10-30" });
  });
});

describe("isSameRange", () => {
  it("compares both ends", () => {
    expect(isSameRange({ from: "2026-10-01", to: "2026-10-29" }, { from: "2026-10-01", to: "2026-10-29" })).toBe(true);
    expect(isSameRange({ from: "2026-10-01", to: "2026-10-29" }, { from: "2026-10-02", to: "2026-10-29" })).toBe(false);
  });
});
