import { describe, expect, it } from "vitest";
import type { ChatUsageDayResponse } from "@pte/api-client";
import { defaultUsageRange, formatUsd, summarizeChatUsage } from "./summarize";

function day(overrides: Partial<ChatUsageDayResponse> = {}): ChatUsageDayResponse {
  return {
    date: "2026-10-29",
    messages: 0,
    ok: 0,
    refused: 0,
    failed: 0,
    cacheHits: 0,
    tokensIn: 0,
    tokensOut: 0,
    tokensThinking: 0,
    estimatedCostUsd: 0,
    ...overrides,
  };
}

describe("summarizeChatUsage", () => {
  it("is all zeros for no days", () => {
    expect(summarizeChatUsage([])).toEqual({
      messages: 0,
      ok: 0,
      refused: 0,
      failed: 0,
      cacheHits: 0,
      tokensIn: 0,
      tokensOut: 0,
      tokensThinking: 0,
      estimatedCostUsd: 0,
      cacheHitRate: 0,
      failedRate: 0,
    });
  });

  it("adds up every day", () => {
    const summary = summarizeChatUsage([
      day({ messages: 10, ok: 7, refused: 2, failed: 1, cacheHits: 3, tokensIn: 100, tokensOut: 200, tokensThinking: 5, estimatedCostUsd: 0.25 }),
      day({ date: "2026-10-30", messages: 10, ok: 10, tokensIn: 50, tokensOut: 60, estimatedCostUsd: 0.5 }),
    ]);

    expect(summary).toMatchObject({
      messages: 20,
      ok: 17,
      refused: 2,
      failed: 1,
      cacheHits: 3,
      tokensIn: 150,
      tokensOut: 260,
      tokensThinking: 5,
    });
    expect(summary.estimatedCostUsd).toBeCloseTo(0.75, 6);
  });

  it("works out the rates as percentages of all messages", () => {
    const summary = summarizeChatUsage([day({ messages: 8, cacheHits: 2, failed: 1 })]);

    expect(summary.cacheHitRate).toBe(25);
    expect(summary.failedRate).toBe(12.5);
  });

  it("never divides by zero", () => {
    const summary = summarizeChatUsage([day({ messages: 0 }), day({ messages: 0 })]);

    expect(summary.cacheHitRate).toBe(0);
    expect(summary.failedRate).toBe(0);
  });
});

describe("defaultUsageRange", () => {
  it("covers the last thirty days up to and including today", () => {
    expect(defaultUsageRange(new Date("2026-10-29T10:00:00Z"))).toEqual({ from: "2026-09-30", to: "2026-10-29" });
  });

  it("uses the Vietnam calendar day, which can already be tomorrow in UTC", () => {
    // 20:00 UTC on the 29th is 03:00 on the 30th in Vietnam.
    expect(defaultUsageRange(new Date("2026-10-29T20:00:00Z"))).toEqual({ from: "2026-10-01", to: "2026-10-30" });
  });
});

describe("formatUsd", () => {
  it("shows dollars with up to four decimals, since a day of chat costs cents", () => {
    expect(formatUsd(0.1234, "en")).toBe("$0.1234");
    expect(formatUsd(12, "en")).toBe("$12.00");
    expect(formatUsd(0, "en")).toBe("$0.00");
  });

  it("follows the locale's separators", () => {
    expect(formatUsd(1234.5, "en")).toBe("$1,234.50");
    expect(formatUsd(1234.5, "vi")).toMatch(/1\.234,50/);
  });
});
