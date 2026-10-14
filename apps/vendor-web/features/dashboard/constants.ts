import type { BadgeVariant } from "@pte/ui";
import type { TenantStatusResponse } from "@pte/api-client";

/** Single cache identity of the platform admin dashboard. */
export const ADMIN_DASHBOARD_QUERY_KEY = ["adminDashboard"] as const;

/** Server aggregates are cached for 60 seconds (admin TTL). */
export const ADMIN_DASHBOARD_STALE_TIME_MS = 60_000;

export const RECENT_TENANTS_LIMIT = 5;
export const TOP_UTILISATION_LIMIT = 5;
export const OLDEST_APPLICATIONS_LIMIT = 5;
export const OLDEST_TICKETS_LIMIT = 5;
export const PERCENT_SCALE = 100;
export const SEAT_NEAR_LIMIT_PERCENT = 90;

export const ADMIN_DASHBOARD_ROUTES = {
  tenants: "/admin/tenants",
  applications: "/admin/applications",
  supportTickets: "/admin/support-tickets",
  licenses: "/admin/licenses",
  subscriptions: "/admin/licenses",
  licenseCodes: "/admin/license-codes",
  plans: "/admin/plans",
  questions: "/admin/questions",
  platformUsers: "/admin/platform-users",
  applicationDetail: (id: string): string => `/admin/applications/${id}`,
  ticketDetail: (id: string): string => `/admin/support-tickets/${id}`,
  tenantDetail: (id: string): string => `/admin/tenants/${id}`,
} as const;

export const TENANT_STATUS_BADGE_VARIANT: Record<TenantStatusResponse, BadgeVariant> = {
  ACTIVE: "success",
  SUSPENDED: "danger",
};

export const TENANCY_STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  SUSPENDED: "danger",
  active: "success",
  suspended: "danger",
  expiring: "warning",
  expired: "neutral",
  pending: "warning",
};

export const DASHBOARD_GRID_CLASS = "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12";
