import { describe, expect, it } from "vitest";
import type { ChatUsageDayResponse } from "@pte/api-client";
import { activeDays, chartRows, failedTone, failureReasons } from "./presentation";

function day(overrides: Partial<ChatUsageDayResponse> = {}): ChatUsageDayResponse {
  return {
    date: "2026-10-29",
    messages: 0,
    ok: 0,
    refused: 0,
    failed: 0,
    failures: { timeout: 0, rateLimited: 0, authFailed: 0, unavailable: 0, truncated: 0, other: 0 },
    tokensIn: 0,
    tokensOut: 0,
    tokensThinking: 0,
    estimatedCostUsd: 0,
    ...overrides,
  };
}

describe("failureReasons", () => {
  it("lists only the reasons that happened, most common first", () => {
    const failures = { timeout: 1, rateLimited: 0, authFailed: 0, unavailable: 3, truncated: 0, other: 2 };

    expect(failureReasons(failures)).toEqual([
      { key: "unavailable", count: 3 },
      { key: "other", count: 2 },
      { key: "timeout", count: 1 },
    ]);
  });

  it("keeps the fixed order when counts tie", () => {
    const failures = { timeout: 2, rateLimited: 2, authFailed: 2, unavailable: 0, truncated: 0, other: 0 };

    expect(failureReasons(failures).map((reason) => reason.key)).toEqual(["timeout", "rateLimited", "authFailed"]);
  });

  it("is empty when nothing failed", () => {
    expect(failureReasons(day().failures)).toEqual([]);
  });
});

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
