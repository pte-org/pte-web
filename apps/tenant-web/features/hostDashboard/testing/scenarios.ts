import type { DashboardActivityItem, HostDashboardResponse, MonthlyPoint } from "@pte/api-client";
import { SYSTEM_ACTOR_ID } from "../constants";
import { TREND_ZERO, forbidden, makeDashboard, ok } from "./fixtures";

/** Identifiers that must never be shown as text. */
export const ACTOR_UUID = "99999999-9999-4999-8999-999999999999";
export const SESSION_ID = "11111111-1111-4111-8111-111111111111";
export const UNKNOWN_ACTION = "Legacy_Sync_Job_42";

/** Twelve calendar months ending at 2026-10 (the last one still in progress). */
export function twelveMonths(counts: readonly number[] = []): MonthlyPoint[] {
  const months = [
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03",
    "2026-04",
    "2026-05",
    "2026-06",
    "2026-07",
    "2026-08",
    "2026-09",
    "2026-10",
  ];
  return months.map((month, index) => ({
    month,
    count: counts[index] ?? 0,
    partial: index === months.length - 1,
  }));
}

/**
 * Everything populated, with an item in every needs-attention source, a session without a
 * capacity, an unknown audit code and a system actor.
 */
export function richDashboard(): HostDashboardResponse {
  const base = makeDashboard();
  return makeDashboard({
    quota: ok({ used: 95, limit: 100, remaining: 5 }),
    subscription: ok({
      current: [
        {
          publicId: "33333333-3333-4333-8333-333333333333",
          planName: "Exam package 100",
          planType: "EXAM_PACKAGE",
          startsAt: "2026-06-01T00:00:00Z",
          expiresAt: "2026-10-20T00:00:00Z",
          status: "ACTIVE",
        },
      ],
      nearestExpiryAt: "2026-10-20T00:00:00Z",
      daysToExpiry: 7,
      expiringSoon: true,
    }),
    exams:
      base.exams.status === "OK"
        ? ok({
            ...base.exams.data,
            upcoming: [
              ...base.exams.data.upcoming,
              {
                publicId: "22222222-2222-4222-8222-222222222222",
                name: "Open-ended session",
                status: "OPEN",
                opensAt: "2026-10-21T01:00:00Z",
                closesAt: "not-a-date",
                enrolled: 12,
                capacity: null,
              },
            ],
          })
        : base.exams,
    attempts: ok({
      submitted: { current: 1234, previous: 1000, changePct: 23.4 },
      inProgressNow: 5,
      monthlySubmitted: twelveMonths([5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]),
    }),
    recentActivity: ok([
      activityItem({ id: "act-1", action: "ExamPublished", actorUserId: ACTOR_UUID }),
      activityItem({ id: "act-2", action: UNKNOWN_ACTION, actorUserId: ACTOR_UUID }),
      activityItem({ id: "act-3", action: "ClassCreated", actorUserId: SYSTEM_ACTOR_ID }),
    ]),
  });
}

/** A payload where every number is zero and every list is empty (a brand-new tenant). */
export function zeroDashboard(): HostDashboardResponse {
  return makeDashboard({
    learners: ok({
      total: 0,
      active: 0,
      suspended: 0,
      newInWindow: TREND_ZERO,
      activeLearners: TREND_ZERO,
      unassigned: 0,
    }),
    quota: ok({ used: 0, limit: 100, remaining: 100 }),
    academics: ok({ organizations: 0, programs: 0, activeClasses: 0 }),
    staff: ok({ proctors: 0, examiners: 0 }),
    exams: ok({
      byStatus: { DRAFT: 0, PREPARING: 0, READY: 0, SCHEDULED: 0, OPEN: 0, CLOSED: 0, CANCELLED: 0 },
      created: TREND_ZERO,
      upcoming: [],
    }),
    attempts: ok({ submitted: TREND_ZERO, inProgressNow: 0, monthlySubmitted: twelveMonths() }),
    grading: ok({
      pendingAnswers: 0,
      aiScoringAnswers: 0,
      failedAnswers: 0,
      closedSessionsAwaitingFinalisation: 0,
      reportsAwaitingPublication: 0,
    }),
    subscription: ok({ current: [], nearestExpiryAt: null, daysToExpiry: null, expiringSoon: false }),
    billing: ok({ pendingOrders: 0 }),
    support: ok({ open: 0, inProgress: 0, resolvedAwaitingClose: 0 }),
    recentActivity: ok([]),
  });
}

/** Every section FORBIDDEN (a role that may see none of the host aggregate). */
export function allForbiddenDashboard(): HostDashboardResponse {
  return makeDashboard({
    learners: forbidden(),
    quota: forbidden(),
    academics: forbidden(),
    staff: forbidden(),
    exams: forbidden(),
    attempts: forbidden(),
    grading: forbidden(),
    subscription: forbidden(),
    billing: forbidden(),
    support: forbidden(),
    recentActivity: forbidden(),
  });
}

export function activityItem(
  input: Pick<DashboardActivityItem, "id" | "action" | "actorUserId"> & Partial<DashboardActivityItem>,
): DashboardActivityItem {
  return {
    targetType: "ExamSession",
    occurredAt: "2026-10-12T08:30:00Z",
    ...input,
  };
}

export { SYSTEM_ACTOR_ID };
