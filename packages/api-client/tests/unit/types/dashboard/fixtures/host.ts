import type { HostDashboardResponse } from "../../../../../src/types/dashboard/index";
import {
  ACTIVITY_ID,
  ACTOR_ID,
  DASHBOARD_META_FIXTURE,
  SESSION_ID_1,
  SESSION_ID_2,
  SUBSCRIPTION_ID,
  TREND_FROM_ZERO,
  TREND_GROWING,
  TREND_ZERO,
  failed,
  forbidden,
  monthlyPoints,
  ok,
} from "./common";
// ---------------------------------------------------------------------------------------------
// Host dashboard
// ---------------------------------------------------------------------------------------------

export const HOST_DASHBOARD_OK: HostDashboardResponse = {
  meta: DASHBOARD_META_FIXTURE,
  learners: ok({
    total: 120,
    active: 110,
    suspended: 10,
    newInWindow: TREND_GROWING,
    activeLearners: TREND_GROWING,
    unassigned: 3,
  }),
  quota: ok({ used: 120, limit: 200, remaining: 80 }),
  academics: ok({ organizations: 2, programs: 4, activeClasses: 9 }),
  staff: ok({ proctors: 4, examiners: 6 }),
  exams: ok({
    byStatus: {
      DRAFT: 1,
      READY: 3,
      SCHEDULED: 4,
      OPEN: 1,
      CLOSED: 5,
      CANCELLED: 0,
    },
    created: TREND_GROWING,
    upcoming: [
      {
        publicId: SESSION_ID_1,
        name: "Mock test 1",
        status: "SCHEDULED",
        opensAt: "2026-10-20T01:00:00Z",
        closesAt: "2026-10-20T03:00:00Z",
        enrolled: 30,
        capacity: 40,
      },
      {
        publicId: SESSION_ID_2,
        name: "Mock test 2",
        status: "OPEN",
        opensAt: "2026-10-21T01:00:00Z",
        closesAt: "2026-10-21T03:00:00Z",
        enrolled: 12,
        capacity: 25,
      },
    ],
  }),
  attempts: ok({
    submitted: TREND_GROWING,
    inProgressNow: 2,
    monthlySubmitted: monthlyPoints([3, 5, 8, 13, 21, 18, 24, 30, 28, 35, 41, 7]),
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
        publicId: SUBSCRIPTION_ID,
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
      id: ACTIVITY_ID,
      action: "SESSION_CREATED",
      actorUserId: ACTOR_ID,
      targetType: "EXAM_SESSION",
      occurredAt: "2026-10-12T08:30:00Z",
    },
  ]),
};

/** Every nullable field is null: unlimited-capacity session, unresolved plan, no percentage. */
export const HOST_DASHBOARD_NULLABLES: HostDashboardResponse = {
  ...HOST_DASHBOARD_OK,
  learners: ok({
    total: 12,
    active: 12,
    suspended: 0,
    newInWindow: TREND_FROM_ZERO,
    activeLearners: TREND_FROM_ZERO,
    unassigned: 12,
  }),
  exams: ok({
    byStatus: {
      DRAFT: 0,
      READY: 0,
      SCHEDULED: 1,
      OPEN: 0,
      CLOSED: 0,
      CANCELLED: 0,
    },
    created: TREND_FROM_ZERO,
    upcoming: [
      {
        publicId: SESSION_ID_1,
        name: "Legacy session",
        status: "SCHEDULED",
        opensAt: "2026-10-20T01:00:00Z",
        closesAt: "2026-10-20T03:00:00Z",
        enrolled: 30,
        capacity: null,
      },
    ],
  }),
  subscription: ok({
    current: [
      {
        publicId: SUBSCRIPTION_ID,
        planName: null,
        planType: null,
        startsAt: "2026-06-01T00:00:00Z",
        expiresAt: "2026-10-20T00:00:00Z",
        status: "ACTIVE",
      },
    ],
    nearestExpiryAt: "2026-10-20T00:00:00Z",
    daysToExpiry: 7,
    expiringSoon: true,
  }),
};

/** A brand-new tenant: no subscription, no sessions, empty series and lists. */
export const HOST_DASHBOARD_EMPTY: HostDashboardResponse = {
  meta: { ...DASHBOARD_META_FIXTURE, windowDays: 7 },
  learners: ok({
    total: 0,
    active: 0,
    suspended: 0,
    newInWindow: TREND_ZERO,
    activeLearners: TREND_ZERO,
    unassigned: 0,
  }),
  quota: ok({ used: 0, limit: 0, remaining: 0 }),
  academics: ok({ organizations: 0, programs: 0, activeClasses: 0 }),
  staff: ok({ proctors: 0, examiners: 0 }),
  exams: ok({
    byStatus: {
      DRAFT: 0,
      READY: 0,
      SCHEDULED: 0,
      OPEN: 0,
      CLOSED: 0,
      CANCELLED: 0,
    },
    created: TREND_ZERO,
    upcoming: [],
  }),
  attempts: ok({
    submitted: TREND_ZERO,
    inProgressNow: 0,
    monthlySubmitted: monthlyPoints([]),
  }),
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
};

/** Every section hidden for the caller's role: HTTP stays 200, `data` is null. */
export const HOST_DASHBOARD_FORBIDDEN: HostDashboardResponse = {
  meta: DASHBOARD_META_FIXTURE,
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
};

/** Every section failed to compute: the page still arrives with HTTP 200. */
export const HOST_DASHBOARD_ERROR: HostDashboardResponse = {
  meta: DASHBOARD_META_FIXTURE,
  learners: failed(),
  quota: failed(),
  academics: failed(),
  staff: failed(),
  exams: failed(),
  attempts: failed(),
  grading: failed(),
  subscription: failed(),
  billing: failed(),
  support: failed(),
  recentActivity: failed(),
};

/** Some sections fine, one failed, one hidden: sections are independent. */
export const HOST_DASHBOARD_MIXED: HostDashboardResponse = {
  ...HOST_DASHBOARD_OK,
  grading: failed(),
  subscription: failed(),
  recentActivity: forbidden(),
};

