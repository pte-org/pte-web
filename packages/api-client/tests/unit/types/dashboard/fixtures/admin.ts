import type { AdminDashboardResponse } from "../../../../../src/types/dashboard/index";
import {
  APPLICATION_ID,
  DASHBOARD_META_FIXTURE,
  TENANT_ID_1,
  TENANT_ID_2,
  TICKET_ID,
  TREND_FROM_ZERO,
  TREND_GROWING,
  TREND_ZERO,
  failed,
  forbidden,
  monthlyAmounts,
  monthlyPoints,
  ok,
} from "./common";
// ---------------------------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------------------------

export const ADMIN_DASHBOARD_OK: AdminDashboardResponse = {
  meta: DASHBOARD_META_FIXTURE,
  tenants: ok({
    total: 14,
    active: 12,
    suspended: 2,
    byOrganizationType: { UNIVERSITY: 8, TRAINING_CENTER: 4, SCHOOL: 2 },
    newInWindow: TREND_GROWING,
    monthlyCreated: monthlyPoints([0, 1, 0, 2, 1, 3, 1, 2, 0, 1, 2, 1]),
  }),
  learners: ok({
    totalStudents: 640,
    totalSeats: 1000,
    activeLearners: TREND_GROWING,
    topUtilisation: [
      {
        tenantId: TENANT_ID_1,
        code: "FPT",
        name: "FPT University",
        students: 180,
        seatLimit: 200,
        utilisationPct: 90,
      },
      {
        tenantId: TENANT_ID_2,
        code: "HUST",
        name: "Hanoi University",
        students: 95,
        seatLimit: 150,
        utilisationPct: 63.3,
      },
    ],
  }),
  recentTenants: ok({
    items: [
      {
        tenantId: TENANT_ID_1,
        code: "FPT",
        name: "FPT University",
        organizationType: "UNIVERSITY",
        status: "ACTIVE",
        planName: "Capacity 200",
        studentCount: 180,
        seatLimit: 200,
        subscriptionExpiresAt: "2027-06-01T00:00:00Z",
        createdAt: "2026-09-01T00:00:00Z",
      },
    ],
  }),
  applications: ok({
    pending: 3,
    receivedInWindow: TREND_GROWING,
    oldestPending: [
      {
        applicationId: APPLICATION_ID,
        orgName: "Sao Mai Center",
        orgType: "TRAINING_CENTER",
        requestedCode: "SAOMAI",
        receivedAt: "2026-10-01T09:00:00Z",
      },
    ],
  }),
  licenses: ok({
    issuedValid: 20,
    redeemed: 11,
    revoked: 1,
    expired: 2,
    expiringSoon: 3,
    expiringSoonDays: 14,
    redeemedInWindow: TREND_GROWING,
  }),
  subscriptions: ok({
    active: 12,
    expiringSoon: 2,
    expiringSoonDays: 30,
    activatedInWindow: TREND_GROWING,
    activatedBySource: { PAYMENT: 5, LICENSE_CODE: 3 },
  }),
  plans: ok({
    active: 4,
    draft: 1,
    archived: 2,
    byType: { EXAM_PACKAGE: 3, STUDENT_CAPACITY: 4 },
  }),
  support: ok({
    open: 4,
    inProgress: 2,
    openedInWindow: TREND_GROWING,
    oldestOpen: [
      {
        ticketId: TICKET_ID,
        tenantId: TENANT_ID_1,
        tenantName: "FPT University",
        category: "BUG",
        openedAt: "2026-10-02T04:00:00Z",
      },
    ],
  }),
  revenue: ok({
    source: "ONLINE_ORDERS",
    paidOrders: TREND_GROWING,
    currencies: [
      {
        currency: "USD",
        current: 250,
        previous: 100,
        changePct: 150,
        paidOrders: TREND_GROWING,
        monthly: monthlyAmounts([0, 0, 50, 0, 100, 0, 0, 75, 0, 100, 250, 0]),
      },
      {
        currency: "VND",
        current: 1500000,
        previous: 1000000,
        changePct: 50,
        paidOrders: TREND_GROWING,
        monthly: monthlyAmounts([0, 0, 500000, 0, 1000000, 0, 0, 750000, 0, 1000000, 1500000, 0]),
      },
    ],
  }),
  questionBank: ok({
    total: 10,
    byStatus: { DRAFT: 1, PENDING_APPROVAL: 2, APPROVED: 6, ARCHIVED: 1 },
    bySection: { LISTENING: 2, SPEAKING: 3, READING: 4, WRITING: 1 },
    byPool: { EXAM: 8, PRACTICE: 2 },
    approvedByPool: { EXAM: 5, PRACTICE: 1 },
    createdInWindow: TREND_GROWING,
  }),
};

/** Every nullable field is null: a tenant without a plan, an orphaned ticket, a first-month currency. */
export const ADMIN_DASHBOARD_NULLABLES: AdminDashboardResponse = {
  ...ADMIN_DASHBOARD_OK,
  recentTenants: ok({
    items: [
      {
        tenantId: TENANT_ID_2,
        code: "NEW",
        name: "Brand New Tenant",
        organizationType: "SCHOOL",
        status: "SUSPENDED",
        planName: null,
        studentCount: 0,
        seatLimit: 0,
        subscriptionExpiresAt: null,
        createdAt: "2026-10-12T00:00:00Z",
      },
    ],
  }),
  support: ok({
    open: 1,
    inProgress: 0,
    openedInWindow: TREND_FROM_ZERO,
    oldestOpen: [
      {
        ticketId: TICKET_ID,
        tenantId: TENANT_ID_2,
        tenantName: null,
        category: "CONTENT_COMPLAINT",
        openedAt: "2026-10-02T04:00:00Z",
      },
    ],
  }),
  revenue: ok({
    source: "ONLINE_ORDERS",
    paidOrders: TREND_FROM_ZERO,
    currencies: [
      {
        currency: "VND",
        current: 500000,
        previous: 0,
        changePct: null,
        paidOrders: TREND_FROM_ZERO,
        monthly: monthlyAmounts([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500000]),
      },
    ],
  }),
};

/** A fresh platform: no tenants, no pending work, no revenue. */
export const ADMIN_DASHBOARD_EMPTY: AdminDashboardResponse = {
  meta: { ...DASHBOARD_META_FIXTURE, windowDays: 90 },
  tenants: ok({
    total: 0,
    active: 0,
    suspended: 0,
    byOrganizationType: {},
    newInWindow: TREND_ZERO,
    monthlyCreated: monthlyPoints([]),
  }),
  learners: ok({ totalStudents: 0, totalSeats: 0, activeLearners: TREND_ZERO, topUtilisation: [] }),
  recentTenants: ok({ items: [] }),
  applications: ok({ pending: 0, receivedInWindow: TREND_ZERO, oldestPending: [] }),
  licenses: ok({
    issuedValid: 0,
    redeemed: 0,
    revoked: 0,
    expired: 0,
    expiringSoon: 0,
    expiringSoonDays: 14,
    redeemedInWindow: TREND_ZERO,
  }),
  subscriptions: ok({
    active: 0,
    expiringSoon: 0,
    expiringSoonDays: 30,
    activatedInWindow: TREND_ZERO,
    activatedBySource: { PAYMENT: 0, LICENSE_CODE: 0 },
  }),
  plans: ok({ active: 0, draft: 0, archived: 0, byType: { EXAM_PACKAGE: 0, STUDENT_CAPACITY: 0 } }),
  support: ok({ open: 0, inProgress: 0, openedInWindow: TREND_ZERO, oldestOpen: [] }),
  revenue: ok({ source: "ONLINE_ORDERS", paidOrders: TREND_ZERO, currencies: [] }),
  questionBank: ok({
    total: 0,
    byStatus: { DRAFT: 0, PENDING_APPROVAL: 0, APPROVED: 0, ARCHIVED: 0 },
    bySection: { LISTENING: 0, SPEAKING: 0, READING: 0, WRITING: 0 },
    byPool: { EXAM: 0, PRACTICE: 0 },
    approvedByPool: { EXAM: 0, PRACTICE: 0 },
    createdInWindow: TREND_ZERO,
  }),
};

/** An academic role: only the question bank is visible, everything else is hidden. */
export const ADMIN_DASHBOARD_FORBIDDEN: AdminDashboardResponse = {
  ...ADMIN_DASHBOARD_OK,
  tenants: forbidden(),
  learners: forbidden(),
  recentTenants: forbidden(),
  applications: forbidden(),
  licenses: forbidden(),
  subscriptions: forbidden(),
  plans: forbidden(),
  support: forbidden(),
  revenue: forbidden(),
};

/** Every section failed to compute: the page still arrives with HTTP 200. */
export const ADMIN_DASHBOARD_ERROR: AdminDashboardResponse = {
  meta: DASHBOARD_META_FIXTURE,
  tenants: failed(),
  learners: failed(),
  recentTenants: failed(),
  applications: failed(),
  licenses: failed(),
  subscriptions: failed(),
  plans: failed(),
  support: failed(),
  revenue: failed(),
  questionBank: failed(),
};
