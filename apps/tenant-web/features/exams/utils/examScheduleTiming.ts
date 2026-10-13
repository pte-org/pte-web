import type { ExamSession } from "../types";

export type ExamScheduleTimingState =
  | "NOT_APPLICABLE"
  | "CLOSE_TIME_UNCHANGED"
  | "CLOSE_TIME_EXTENDED"
  | "CLOSE_TIME_SHORTENED"
  | "CLOSE_TIME_NOT_IN_FUTURE";

type ScheduleTimingSession = Pick<ExamSession, "status" | "opensAt">;

const toTimestamp = (value: string): number | null => {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const hasExamStarted = (session: ScheduleTimingSession, now: number): boolean => {
  if (session.status === "OPEN") return true;
  if (session.status !== "SCHEDULED") return false;

  const opensAt = toTimestamp(session.opensAt);
  return opensAt !== null && opensAt <= now;
};

export const getExamScheduleTimingState = (
  session: ScheduleTimingSession,
  previousClosesAt: string,
  nextClosesAt: string,
  now = Date.now(),
): ExamScheduleTimingState => {
  if (!hasExamStarted(session, now)) return "NOT_APPLICABLE";

  const previousClose = toTimestamp(previousClosesAt);
  const nextClose = toTimestamp(nextClosesAt);
  if (previousClose === null || nextClose === null) return "NOT_APPLICABLE";
  if (nextClose <= now) return "CLOSE_TIME_NOT_IN_FUTURE";
  if (nextClose < previousClose) return "CLOSE_TIME_SHORTENED";
  if (nextClose > previousClose) return "CLOSE_TIME_EXTENDED";
  return "CLOSE_TIME_UNCHANGED";
};

export const formatExamScheduleDateTime = (value: string, locale: "vi" | "en"): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
