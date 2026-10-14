import type {
  AdminDashboardResponse,
  DashboardSection,
  TrendValue,
} from "@pte/api-client";

export const ok = <T>(data: T): DashboardSection<T> => ({ status: "OK", data });
export const failed = <T>(): DashboardSection<T> => ({ status: "ERROR", data: null });
export const forbidden = <T>(): DashboardSection<T> => ({ status: "FORBIDDEN", data: null });

export const TREND_GROWING: TrendValue = { current: 40, previous: 20, changePct: 100 };
export const TREND_SHRINKING: TrendValue = { current: 10, previous: 20, changePct: -50 };
export const TREND_FLAT: TrendValue = { current: 20, previous: 20, changePct: 0 };
export const TREND_FROM_ZERO: TrendValue = { current: 12, previous: 0, changePct: null };
export const TREND_ZERO: TrendValue = { current: 0, previous: 0, changePct: null };

export function makeAdminDashboard(
  overrides: Partial<AdminDashboardResponse> = {},
): AdminDashboardResponse {
  return {
    meta: {
      generatedAt: "2026-10-14T03:00:00Z",
      windowDays: 30,
      windowStart: "2026-09-14T03:00:00Z",
      windowEnd: "2026-10-14T03:00:00Z",
      zone: "Asia/Ho_Chi_Minh",
    },
    tenants: ok({
      total: 50,
      active: 45,
      suspended: 5,
      byOrganizationType: { UNIVERSITY: 30, CENTER: 20 },
      newInWindow: TREND_GROWING,
      monthlyCreated: [
        { month: "2026-09", count: 4, partial: false },
        { month: "2026-10", count: 2, partial: true },
      ],
    }),
    learners: ok({
      totalStudents: 1500,
      totalSeats: 2000,
      activeLearners: TREND_GROWING,
      topUtilisation: [
        {
          tenantId: "t-1",
          code: "T1",
          name: "Tenant Alpha",
          students: 190,
          seatLimit: 200,
          utilisationPct: 95.0,
        },
      ],
    }),
    recentTenants: ok({
      items: [
        {
          tenantId: "t-1",
          code: "T1",
          name: "Tenant Alpha",
          organizationType: "UNIVERSITY",
          status: "ACTIVE",
          planName: "Pro Tier",
          studentCount: 190,
          seatLimit: 200,
          subscriptionExpiresAt: "2027-01-01T00:00:00Z",
          createdAt: "2026-10-01T00:00:00Z",
        },
      ],
    }),
    applications: ok({
      pending: 3,
      receivedInWindow: TREND_GROWING,
      oldestPending: [
        {
          applicationId: "app-1",
          orgName: "Beta College",
          orgType: "COLLEGE",
          requestedCode: "BETA",
          receivedAt: "2026-10-05T00:00:00Z",
        },
      ],
    }),
    licenses: ok({
      issuedValid: 120,
      redeemed: 80,
      revoked: 2,
      expired: 10,
      expiringSoon: 4,
      expiringSoonDays: 14,
      redeemedInWindow: TREND_GROWING,
    }),
    subscriptions: ok({
      active: 40,
      expiringSoon: 5,
      expiringSoonDays: 30,
      activatedInWindow: TREND_GROWING,
      activatedBySource: {
        PAYMENT: 25,
        LICENSE_CODE: 15,
      },
    }),
    plans: ok({
      active: 6,
      draft: 1,
      archived: 2,
      byType: {
        EXAM_PACKAGE: 4,
        STUDENT_CAPACITY: 2,
      },
    }),
    support: ok({
      open: 4,
      inProgress: 2,
      openedInWindow: TREND_GROWING,
      oldestOpen: [
        {
          ticketId: "tick-1",
          tenantId: "t-1",
          tenantName: "Tenant Alpha",
          category: "BUG",
          openedAt: "2026-10-10T00:00:00Z",
        },
      ],
    }),
    revenue: ok({
      source: "ONLINE_ORDERS",
      paidOrders: TREND_GROWING,
      currencies: [
        {
          currency: "VND",
          current: 50000000,
          previous: 30000000,
          changePct: 66.7,
          paidOrders: TREND_GROWING,
          monthly: [
            { month: "2026-09", amount: 30000000, partial: false },
            { month: "2026-10", amount: 20000000, partial: true },
          ],
        },
      ],
    }),
    questionBank: ok({
      total: 1000,
      byStatus: {
        DRAFT: 100,
        PENDING_APPROVAL: 50,
        APPROVED: 800,
        ARCHIVED: 50,
      },
      bySection: {
        SPEAKING: 300,
        WRITING: 200,
        READING: 250,
        LISTENING: 250,
      },
      byPool: {
        EXAM: 600,
        PRACTICE: 400,
      },
      approvedByPool: {
        EXAM: 500,
        PRACTICE: 300,
      },
      createdInWindow: TREND_GROWING,
    }),
    ...overrides,
  };
}
