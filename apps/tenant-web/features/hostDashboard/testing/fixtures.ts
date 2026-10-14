import type { DashboardSection, HostDashboardResponse, TrendValue } from "@pte/api-client";

/** Test-only builders for the host dashboard payload (never imported by production code). */

export const ok = <T>(data: T): DashboardSection<T> => ({ status: "OK", data });
export const failed = <T>(): DashboardSection<T> => ({ status: "ERROR", data: null });
export const forbidden = <T>(): DashboardSection<T> => ({ status: "FORBIDDEN", data: null });

export const TREND_GROWING: TrendValue = { current: 40, previous: 20, changePct: 100 };
export const TREND_SHRINKING: TrendValue = { current: 10, previous: 20, changePct: -50 };
export const TREND_FLAT: TrendValue = { current: 20, previous: 20, changePct: 0 };
export const TREND_FROM_ZERO: TrendValue = { current: 12, previous: 0, changePct: null };
export const TREND_ZERO: TrendValue = { current: 0, previous: 0, changePct: null };

export function makeDashboard(overrides: Partial<HostDashboardResponse> = {}): HostDashboardResponse {
  return {
    meta: {
      generatedAt: "2026-10-13T03:00:00Z",
      windowDays: 30,
      windowStart: "2026-09-13T03:00:00Z",
      windowEnd: "2026-10-13T03:00:00Z",
      zone: "Asia/Ho_Chi_Minh",
    },
    learners: ok({
      total: 1200,
      active: 1100,
      suspended: 100,
      newInWindow: TREND_GROWING,
      activeLearners: TREND_GROWING,
      unassigned: 30,
    }),
    quota: ok({ used: 120, limit: 200, remaining: 80 }),
    academics: ok({ organizations: 2, programs: 4, activeClasses: 9 }),
    staff: ok({ proctors: 4, examiners: 6 }),
    exams: ok({
      byStatus: { DRAFT: 1, PREPARING: 0, READY: 3, SCHEDULED: 4, OPEN: 1, CLOSED: 5, CANCELLED: 0 },
      created: TREND_SHRINKING,
      upcoming: [
        {
          publicId: "11111111-1111-4111-8111-111111111111",
          name: "Mock test 1",
          status: "SCHEDULED",
          opensAt: "2026-10-20T01:00:00Z",
          closesAt: "2026-10-20T03:00:00Z",
          enrolled: 30,
          capacity: 40,
        },
      ],
    }),
    attempts: ok({
      submitted: TREND_FLAT,
      inProgressNow: 2,
      monthlySubmitted: [
        { month: "2026-09", count: 30, partial: false },
        { month: "2026-10", count: 7, partial: true },
      ],
    }),
    grading: ok({
      pendingAnswers: 5,
      aiScoringAnswers: 1,
      failedAnswers: 2,
      closedSessionsAwaitingFinalisation: 1,
      reportsAwaitingPublication: 2,
    }),
    subscription: ok({
      current: [
        {
          publicId: "33333333-3333-4333-8333-333333333333",
          planName: "Exam package 100",
          planType: "EXAM_PACKAGE",
          startsAt: "2026-06-01T00:00:00Z",
          expiresAt: "2027-06-01T00:00:00Z",
          status: "ACTIVE",
        },
      ],
      nearestExpiryAt: "2027-06-01T00:00:00Z",
      daysToExpiry: 231,
      expiringSoon: false,
    }),
    billing: ok({ pendingOrders: 1 }),
    support: ok({ open: 2, inProgress: 1, resolvedAwaitingClose: 3 }),
    recentActivity: ok([
      {
        id: "88888888-8888-4888-8888-888888888888",
        action: "ExamPublished",
        actorUserId: "99999999-9999-4999-8999-999999999999",
        targetType: "ExamSession",
        occurredAt: "2026-10-12T08:30:00Z",
      },
    ]),
    ...overrides,
  };
}
