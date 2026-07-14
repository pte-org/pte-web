export const DASHBOARD_TEXT = {
  GREETING: "Good morning, Administrator",
  GREETING_SUBTITLE: "Here is today's system activity overview.",
  ADD_TENANT: "Add Tenant",
  NOTICE_TITLE: "System Notice",
  NOTICE_TEXT:
    "The system is operating normally. The next scheduled maintenance window is Sunday, 00:00 - 04:00 (GMT+7).",
  RECENT_TITLE: "Recently Updated Tenants",
  VIEW_ALL: "View all ->",
  STAT_TOTAL: "Total Tenants",
  STAT_LEARNERS: "Active Learners",
  STAT_EXPIRING: "Tenants Expiring Soon",
  STAT_EXPIRING_NOTE: "Renewal required",
  ROW_DETAIL: "View details",
} as const;

export const DASHBOARD_MAP_TEXT = {
  TITLE: "Tenant Distribution",
  SUBTITLE: "Locations of active tenants across Vietnam.",
  MAPPED_LABEL: "Mapped",
  EMPTY:
    "New tenants will appear on the map after a province or city is selected in the tenant creation form.",
  ARIA_LABEL: "Vietnam map showing tenant locations",
  TENANT_UNIT: "tenant",
} as const;

export const DASHBOARD_TENANT_DETAIL_TEXT = {
  TITLE: "Tenant Details",
  NAME: "Tenant Name",
  SLUG: "Slug",
  LOGIN_EMAIL: "Login Email",
  PLAN: "Plan",
  STATUS: "Status",
  SEATS: "Seats Used/Total",
  ACTIVATED: "Activated On",
  EXPIRES: "Expires On",
  LOCATION: "Location",
  CLOSE: "Close",
  EMPTY_VALUE: "-",
} as const;

export const recentCountLabel = (shown: number, total: number): string =>
  shown === 0
    ? `Showing 0 of ${total} tenants`
    : `Showing 1-${shown} of ${total} tenants`;

export const RECENT_TABLE_HEADERS = {
  NAME: "Tenant Name",
  PLAN: "Plan",
  ACTIVATED: "Activated On",
  STATUS: "Status",
  ACTIONS: "Actions",
} as const;
