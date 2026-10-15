import type {
  DashboardUpcomingSession,
  HostExamsData,
  HostGradingData,
  HostLearnersData,
  MonthlyPoint,
} from "@pte/api-client";
import type { Locale, TrendChartDatum } from "@pte/ui";
import {
  ATTEMPTS_SERIES_KEY,
  PERCENT_SCALE,
  SESSION_STATUS_CHART_TONE,
  SESSION_STATUS_MESSAGE_KEYS,
  SESSION_STATUS_ORDER,
  UPCOMING_DISPLAY_LIMIT,
} from "../constants";
import type { ChartSlice, GradingRow, UpcomingSessionRow } from "../types";
import { formatDateTime, formatMonthLabel } from "./format";

/** One datum per month, oldest first; the partial flag of the current month is kept. */
export function buildAttemptsChartData(
  points: readonly MonthlyPoint[],
  locale: Locale,
): TrendChartDatum[] {
  return points.map((point) => ({
    label: formatMonthLabel(point.month, locale),
    partial: point.partial,
    [ATTEMPTS_SERIES_KEY]: point.count,
  }));
}

/** Statuses with sessions only, in lifecycle order (a zero slice would only add legend noise). */
export function buildSessionStatusSlices(byStatus: HostExamsData["byStatus"]): ChartSlice[] {
  return SESSION_STATUS_ORDER.filter((status) => (byStatus[status] ?? 0) > 0).map((status) => ({
    key: status,
    labelKey: SESSION_STATUS_MESSAGE_KEYS[status],
    value: byStatus[status],
    tone: SESSION_STATUS_CHART_TONE[status],
  }));
}

export function countSessions(byStatus: HostExamsData["byStatus"]): number {
  return SESSION_STATUS_ORDER.reduce((sum, status) => sum + (byStatus[status] ?? 0), 0);
}

export interface LearnerSplit {
  total: number;
  assigned: number;
  unassigned: number;
}

/** `unassigned` never exceeds the total, so a stale count cannot produce a negative slice. */
export function buildLearnerSplit(learners: HostLearnersData): LearnerSplit {
  const total = Math.max(learners.total, 0);
  const unassigned = Math.min(Math.max(learners.unassigned, 0), total);
  return { total, assigned: total - unassigned, unassigned };
}

/** Breakdown of the answers still in the grading pipeline; shares are of that backlog only. */
export function buildGradingRows(grading: HostGradingData): GradingRow[] {
  const backlog = grading.pendingAnswers + grading.aiScoringAnswers + grading.failedAnswers;
  const share = (count: number): number =>
    backlog > 0 ? Math.round((count / backlog) * PERCENT_SCALE) : 0;
  return [
    {
      key: "pending",
      labelKey: "gradingPending",
      count: grading.pendingAnswers,
      share: share(grading.pendingAnswers),
      tone: "warning",
    },
    {
      key: "aiScoring",
      labelKey: "gradingAiScoring",
      count: grading.aiScoringAnswers,
      share: share(grading.aiScoringAnswers),
      tone: "success",
    },
    {
      key: "failed",
      labelKey: "gradingFailed",
      count: grading.failedAnswers,
      share: share(grading.failedAnswers),
      tone: "danger",
    },
  ];
}

export function buildUpcomingRows(
  sessions: readonly DashboardUpcomingSession[],
  locale: Locale,
  timeZone?: string,
  limit: number = UPCOMING_DISPLAY_LIMIT,
): UpcomingSessionRow[] {
  return sessions.slice(0, limit).map((session) => ({
    publicId: session.publicId,
    name: session.name,
    status: session.status,
    opens: formatDateTime(session.opensAt, locale, timeZone),
    closes: formatDateTime(session.closesAt, locale, timeZone),
    enrolled: session.enrolled,
    capacity: session.capacity,
  }));
}
