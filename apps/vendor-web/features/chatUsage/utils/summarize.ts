import type { ChatUsageDayResponse } from "@pte/api-client";
import { CHAT_USAGE_RANGE_DAYS } from "../constants";

export interface ChatUsageSummary {
  messages: number;
  ok: number;
  refused: number;
  failed: number;
  cacheHits: number;
  tokensIn: number;
  tokensOut: number;
  tokensThinking: number;
  estimatedCostUsd: number;
  /** Percent of all messages that were answered from the shared cache. */
  cacheHitRate: number;
  /** Percent of all messages that failed after the provider call. */
  failedRate: number;
}

const PERCENT = 100;
const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const USD_MIN_FRACTION_DIGITS = 2;
const USD_MAX_FRACTION_DIGITS = 4;

export function summarizeChatUsage(days: readonly ChatUsageDayResponse[]): ChatUsageSummary {
  const total = {
    messages: 0,
    ok: 0,
    refused: 0,
    failed: 0,
    cacheHits: 0,
    tokensIn: 0,
    tokensOut: 0,
    tokensThinking: 0,
    estimatedCostUsd: 0,
  };
  for (const day of days) {
    total.messages += day.messages;
    total.ok += day.ok;
    total.refused += day.refused;
    total.failed += day.failed;
    total.cacheHits += day.cacheHits;
    total.tokensIn += day.tokensIn;
    total.tokensOut += day.tokensOut;
    total.tokensThinking += day.tokensThinking;
    total.estimatedCostUsd += day.estimatedCostUsd;
  }
  const rate = (part: number): number => (total.messages === 0 ? 0 : (part / total.messages) * PERCENT);
  return { ...total, cacheHitRate: rate(total.cacheHits), failedRate: rate(total.failed) };
}

/** yyyy-MM-dd of an instant on the Vietnam calendar, the day the backend groups the report by. */
export function vietnamDate(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: VIETNAM_TIME_ZONE }).format(instant);
}

/** The last {@link CHAT_USAGE_RANGE_DAYS} days, ending today in Vietnam. */
export function defaultUsageRange(now: Date): { from: string; to: string } {
  const to = vietnamDate(now);
  const from = vietnamDate(new Date(now.getTime() - (CHAT_USAGE_RANGE_DAYS - 1) * MS_PER_DAY));
  return { from, to };
}

export function formatUsd(amount: number, locale: "en" | "vi"): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: USD_MIN_FRACTION_DIGITS,
    maximumFractionDigits: USD_MAX_FRACTION_DIGITS,
  }).format(amount);
}
