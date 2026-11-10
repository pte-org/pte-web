import type { ChatFailureCountsResponse, ChatUsageDayResponse } from "@pte/api-client";
import type { TrendChartDatum } from "@pte/ui";

export interface UsageRange {
  from: string;
  to: string;
}

/** A failed rate above this share of all messages is worth the admin's attention. */
const FAILED_ALERT_PERCENT = 10;

/** Days with no messages say nothing; the table hides them unless the admin asks for all of them. */
export function activeDays(days: readonly ChatUsageDayResponse[]): ChatUsageDayResponse[] {
  return days.filter((day) => day.messages > 0);
}

function shortDate(isoDate: string, withYear: boolean): string {
  const [year, month, dayOfMonth] = isoDate.split("-");
  return withYear ? `${dayOfMonth}/${month}/${year}` : `${dayOfMonth}/${month}`;
}

/** One stacked bar per day (answered, refused, failed). The year is added when the range spans two, so labels stay unique. */
export function chartRows(days: readonly ChatUsageDayResponse[]): TrendChartDatum[] {
  const years = new Set(days.map((day) => day.date.slice(0, 4)));
  const withYear = years.size > 1;
  return days.map((day) => ({
    label: shortDate(day.date, withYear),
    ok: day.ok,
    refused: day.refused,
    failed: day.failed,
  }));
}

export type FailureReasonKey = keyof ChatFailureCountsResponse;

/** The order reasons are listed in when two have the same count; the likeliest causes to act on come first. */
const FAILURE_REASON_ORDER: readonly FailureReasonKey[] = [
  "timeout",
  "rateLimited",
  "authFailed",
  "unavailable",
  "truncated",
  "other",
];

/** The reasons a day's messages failed for, only those that happened, the most common first. */
export function failureReasons(
  failures: ChatFailureCountsResponse,
): Array<{ key: FailureReasonKey; count: number }> {
  return FAILURE_REASON_ORDER.map((key) => ({ key, count: failures[key] }))
    .filter((reason) => reason.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function failedTone(failedRate: number): "neutral" | "danger" {
  return failedRate > FAILED_ALERT_PERCENT ? "danger" : "neutral";
}

/** Quick ranges, all ending today on the Vietnam calendar, the day the backend groups the report by. */
