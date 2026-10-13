import type { ActivationSource, PlanType } from "../billing";
import type { QuestionPool, QuestionStatus } from "../question";
import type { TicketCategory } from "../support";
import type { TenantStatusResponse } from "../tenant";
import type {
  DashboardMeta,
  DashboardSection,
  MonthlyAmount,
  MonthlyPoint,
  TrendValue,
} from "./common";

/**
 * Platform admin dashboard contract. Mirrors pte-api `AdminDashboardResponse` /
 * `AdminSectionData`. A section the caller's role may not see arrives as `FORBIDDEN` with
 * `data: null` (HTTP stays 200): academic roles only receive `questionBank`. The tenant
 * province map is not part of this contract yet.
 */

/**
 * Tenant counts are current values (status has no history, so no trend). `byOrganizationType` is
 * keyed by the stored organization type. `monthlyCreated` has 12 buckets, oldest first, ending
 * with the current partial month.
 */
export interface AdminTenantsData {
  total: number;
  active: number;
  suspended: number;
  byOrganizationType: Record<string, number>;
  newInWindow: TrendValue;
  monthlyCreated: MonthlyPoint[];
}

/** `utilisationPct` is `students / seatLimit * 100` rounded to one decimal by the backend. */
export interface DashboardSeatUtilisation {
  tenantId: string;
  code: string;
  name: string;
  students: number;
  seatLimit: number;
  utilisationPct: number;
}

/**
 * `totalStudents` and `totalSeats` are current values (seat usage has no history).
 * `activeLearners` counts distinct students who started an attempt in the window, platform-wide.
 * `topUtilisation` lists the fullest tenants.
 */
export interface AdminLearnersData {
  totalStudents: number;
  totalSeats: number;
  activeLearners: TrendValue;
  topUtilisation: DashboardSeatUtilisation[];
}

/** `planName` and `subscriptionExpiresAt` are null when the tenant has no usable subscription. */
export interface DashboardRecentTenant {
  tenantId: string;
  code: string;
  name: string;
  organizationType: string;
  status: TenantStatusResponse;
  planName: string | null;
  studentCount: number;
  seatLimit: number;
  subscriptionExpiresAt: string | null;
  createdAt: string;
}

/** Newest tenants first, wrapped in `items`. */
export interface AdminRecentTenantsData {
  items: DashboardRecentTenant[];
}

export interface DashboardPendingApplication {
  applicationId: string;
  orgName: string;
  orgType: string;
  requestedCode: string;
  receivedAt: string;
}

/** `oldestPending` is oldest first (longest waiting). */
export interface AdminApplicationsData {
  pending: number;
  receivedInWindow: TrendValue;
  oldestPending: DashboardPendingApplication[];
}

/**
 * Counts by derived state (an issued code past its expiry counts as `expired`); no code value is
 * ever returned. `expiringSoon` covers issued codes ending within `expiringSoonDays`.
 */
export interface AdminLicensesData {
  issuedValid: number;
  redeemed: number;
  revoked: number;
  expired: number;
  expiringSoon: number;
  expiringSoonDays: number;
  redeemedInWindow: TrendValue;
}

/**
 * `active` counts usable subscriptions now; `expiringSoon` those ending within
 * `expiringSoonDays`. `activatedBySource` splits the subscriptions activated in the window by
 * source (every source present).
 */
export interface AdminSubscriptionsData {
  active: number;
  expiringSoon: number;
  expiringSoonDays: number;
  activatedInWindow: TrendValue;
  activatedBySource: Record<ActivationSource, number>;
}

/** Plan catalogue counts; `byType` holds every plan type (0 when none). */
export interface AdminPlansData {
  active: number;
  draft: number;
  archived: number;
  byType: Record<PlanType, number>;
}

/** Safe ticket reference (no description, submitter or notes); `tenantName` is null when unresolvable. */
export interface DashboardOldestTicket {
  ticketId: string;
  tenantId: string;
  tenantName: string | null;
  category: TicketCategory;
  openedAt: string;
}

/** Platform-wide ticket counts; `oldestOpen` lists tickets still in the OPEN state, oldest first. */
export interface AdminSupportData {
  open: number;
  inProgress: number;
  openedInWindow: TrendValue;
  oldestOpen: DashboardOldestTicket[];
}

/**
 * One currency. `current`/`previous` are the paid amounts of the current and previous window as
 * JSON numbers (backend `BigDecimal`): format with `Intl.NumberFormat` for `currency`, never sum
 * across currencies. `changePct` is null when `previous` is zero. `monthly` has 12 buckets,
 * oldest first, ending with the current partial month.
 *
 * Precision limit: JSON numbers are exact only up to 2^53 and only while the platform's
 * currencies have no fractional digits (VND today, whole amounts). Before enabling a currency
 * with fractional digits the backend must switch these fields (and `MonthlyAmount.amount`) to
 * strings or minor units, and these types must follow.
 */
export interface DashboardCurrencyRevenue {
  currency: string;
  current: number;
  previous: number;
  changePct: number | null;
  paidOrders: TrendValue;
  monthly: MonthlyAmount[];
}

/**
 * Online revenue only: PAID orders, never license-code activations. `source` names that basis
 * (`ONLINE_ORDERS`). `paidOrders` counts paid orders of all currencies; `currencies` is ordered
 * by code and lists every currency with a paid order in the series or either window.
 */
export interface AdminRevenueData {
  source: string;
  paidOrders: TrendValue;
  currencies: DashboardCurrencyRevenue[];
}

/**
 * Question bank health, platform-wide. `byStatus`, `byPool` and `approvedByPool` hold all of
 * their enum keys (0 when empty); `bySection` has the four `PteSection` keys but also carries any
 * non-standard section name found in stored data, hence a string-keyed record. `approvedByPool` counts APPROVED questions only,
 * so practice items are never mistaken for exam stock. `createdInWindow` is a created-at count:
 * the bank stores no approval time, so there is no approval trend.
 */
export interface AdminQuestionBankData {
  total: number;
  byStatus: Record<QuestionStatus, number>;
  bySection: Record<string, number>;
  byPool: Record<QuestionPool, number>;
  approvedByPool: Record<QuestionPool, number>;
  createdInWindow: TrendValue;
}

export interface AdminDashboardResponse {
  meta: DashboardMeta;
  tenants: DashboardSection<AdminTenantsData>;
  learners: DashboardSection<AdminLearnersData>;
  recentTenants: DashboardSection<AdminRecentTenantsData>;
  applications: DashboardSection<AdminApplicationsData>;
  licenses: DashboardSection<AdminLicensesData>;
  subscriptions: DashboardSection<AdminSubscriptionsData>;
  plans: DashboardSection<AdminPlansData>;
  support: DashboardSection<AdminSupportData>;
  revenue: DashboardSection<AdminRevenueData>;
  questionBank: DashboardSection<AdminQuestionBankData>;
}
