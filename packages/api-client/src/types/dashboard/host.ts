import type { PlanType, SubscriptionStatus } from "../billing";
import type { SessionStatus } from "../scheduling";
import type { DashboardMeta, DashboardSection, MonthlyPoint, TrendValue } from "./common";

/**
 * Host (tenant) dashboard contract. Mirrors pte-api `HostDashboardResponse` / `HostSectionData`.
 * Every section is independent: render by `section.status`, never assume `data` is present.
 */

/**
 * `total`/`active`/`suspended` are current student counts. `activeLearners` counts distinct
 * students who started an attempt inside the window (there is no login timestamp), and
 * `unassigned` counts students not placed in any active class.
 */
export interface HostLearnersData {
  total: number;
  active: number;
  suspended: number;
  newInWindow: TrendValue;
  activeLearners: TrendValue;
  unassigned: number;
}

/** Student seat usage of the tenant: `remaining = limit - used`. */
export interface HostQuotaData {
  used: number;
  limit: number;
  remaining: number;
}

export interface HostAcademicsData {
  organizations: number;
  programs: number;
  activeClasses: number;
}

/** Active, non-deleted exam staff. */
export interface HostStaffData {
  proctors: number;
  examiners: number;
}

/** A joinable session; `capacity` is null for legacy rows. Dates are ISO-8601 strings. */
export interface DashboardUpcomingSession {
  publicId: string;
  name: string;
  status: SessionStatus;
  opensAt: string;
  closesAt: string;
  enrolled: number;
  capacity: number | null;
}

/** `byStatus` holds every session status (0 when none); `upcoming` is a short list. */
export interface HostExamsData {
  byStatus: Record<SessionStatus, number>;
  created: TrendValue;
  upcoming: DashboardUpcomingSession[];
}

/**
 * `monthlySubmitted` has 12 buckets, oldest first, ending with the current month which is flagged
 * `partial` (still in progress).
 */
export interface HostAttemptsData {
  submitted: TrendValue;
  inProgressNow: number;
  monthlySubmitted: MonthlyPoint[];
}

/** Grading backlog (point-in-time counts, no trend). */
export interface HostGradingData {
  pendingAnswers: number;
  aiScoringAnswers: number;
  failedAnswers: number;
  closedSessionsAwaitingFinalisation: number;
  reportsAwaitingPublication: number;
}

/** One usable subscription. `planName` and `planType` are null when the plan can no longer be resolved. */
export interface DashboardSubscription {
  publicId: string;
  planName: string | null;
  planType: PlanType | null;
  startsAt: string;
  expiresAt: string;
  status: SubscriptionStatus;
}

/**
 * Usable subscriptions, soonest expiry first. `nearestExpiryAt` and `daysToExpiry` (whole days
 * from now) are null when there is no subscription.
 */
export interface HostSubscriptionData {
  current: DashboardSubscription[];
  nearestExpiryAt: string | null;
  daysToExpiry: number | null;
  expiringSoon: boolean;
}

/** Orders awaiting payment as a count only: no payment link or provider data is ever returned. */
export interface HostBillingData {
  pendingOrders: number;
}

/** The tenant's own support tickets by workflow state. */
export interface HostSupportData {
  open: number;
  inProgress: number;
  resolvedAwaitingClose: number;
}

/**
 * One audit entry reduced to display-ready fields (no summary text, target id or IP). Distinct
 * from `AuditLogResponse`: it has `id` and `occurredAt` instead of `publicId` and `createdAt`.
 */
export interface DashboardActivityItem {
  id: string;
  action: string;
  actorUserId: string;
  targetType: string;
  occurredAt: string;
}

export interface HostDashboardResponse {
  meta: DashboardMeta;
  learners: DashboardSection<HostLearnersData>;
  quota: DashboardSection<HostQuotaData>;
  academics: DashboardSection<HostAcademicsData>;
  staff: DashboardSection<HostStaffData>;
  exams: DashboardSection<HostExamsData>;
  attempts: DashboardSection<HostAttemptsData>;
  grading: DashboardSection<HostGradingData>;
  subscription: DashboardSection<HostSubscriptionData>;
  billing: DashboardSection<HostBillingData>;
  support: DashboardSection<HostSupportData>;
  recentActivity: DashboardSection<DashboardActivityItem[]>;
}
