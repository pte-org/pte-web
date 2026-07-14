import type { BadgeVariant } from "@aptis/ui";
import type { LicenseStatus } from "./types";

export const LICENSING_TEXT = {
  TITLE: "Licenses",
  SUBTITLE: "Track and renew organization licenses.",
  EXPORT: "Export report",
  ACTION_RENEW: "Renew",
  ACTION_EXPORT_PDF: "Export PDF",
  STAT_TOTAL: "Total licenses",
  STAT_ACTIVE: "Active",
  STAT_EXPIRING: "Expiring soon (30 days)",
  STAT_EXPIRED: "Expired",
} as const;

export const LICENSE_TABLE_HEADERS = {
  TENANT: "Organization",
  PLAN: "Plan",
  STATUS: "Status",
  SEATS: "Seats (used/total)",
  ISSUED: "Issued On",
  EXPIRES: "Expires On",
  ACTIONS: "Actions",
} as const;

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  active: "Active",
  expiring: "Expiring soon",
  expired: "Expired",
};

export const LICENSE_STATUS_VARIANT: Record<LicenseStatus, BadgeVariant> = {
  active: "success",
  expiring: "warning",
  expired: "danger",
};
