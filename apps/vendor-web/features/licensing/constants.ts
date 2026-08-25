import type { BadgeVariant } from "@pte/ui";
import type { GrantQuotaInput, LicenseStatus } from "./types";

export const LICENSING_TEXT = {
  TITLE: "Licenses",
  SUBTITLE: "Track and renew organization licenses.",
  EXPORT: "Export report",
  ACTION_RENEW: "Renew",
  ACTION_HISTORY: "View History",
  ACTION_EXPORT_PDF: "Export PDF",
  STAT_TOTAL: "Total licenses",
  STAT_ACTIVE: "Active",
  STAT_SUSPENDED: "Suspended",
  STAT_TOTAL_SEATS: "Total student seats",
} as const;

export const LICENSE_TABLE_HEADERS = {
  TENANT: "Organization",
  PLAN: "Plan",
  STATUS: "Status",
  SEATS: "Student Limit",
  ACTIONS: "Actions",
} as const;

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  active: "Active",
  suspended: "Suspended",
};

export const LICENSE_STATUS_VARIANT: Record<LicenseStatus, BadgeVariant> = {
  active: "success",
  suspended: "neutral",
};

export const GRANT_QUOTA_TEXT = {
  TITLE: "Grant Quota",
  PACKAGE_LABEL: "Package",
  PACKAGE_PLACEHOLDER: "Select a package",
  AMOUNT_LABEL: "Additional Seats",
  AMOUNT_PLACEHOLDER: "e.g. 100",
  AMOUNT_HELPER: "Added on top of the current student limit.",
  NOTE_LABEL: "Note",
  NOTE_PLACEHOLDER: "Optional reason for this grant...",
  CANCEL: "Cancel",
  SUBMIT: "Grant Quota",
  CONFLICT:
    "This tenant's quota was just changed by someone else. Please review the current value and try again.",
} as const;

export const GRANT_QUOTA_ERRORS = {
  REQUIRED: "This field is required.",
  AMOUNT_INVALID: "Enter a whole number of at least 1.",
} as const;

export const EMPTY_GRANT_QUOTA: GrantQuotaInput = {
  packageName: "",
  amount: "",
  note: "",
};

export const QUOTA_HISTORY_TEXT = {
  TITLE: "Quota History",
  EMPTY: "No quota transactions yet.",
  CLOSE: "Close",
} as const;

// No ACTOR column: `actorUserId` is a raw UUID (admin has no user-identity
// lookup — iam owns that), so showing it as-is would just be unreadable
// noise, not a real "granted by" name.
export const QUOTA_HISTORY_TABLE_HEADERS = {
  DATE: "Date",
  ACTION: "Action",
  PACKAGE: "Package",
  AMOUNT: "Amount",
  NOTE: "Note",
} as const;

export const QUOTA_ACTION_TYPE_LABELS = {
  GRANTED: "Granted",
  DEDUCTED: "Deducted",
  REVOKED: "Revoked",
} as const;

export const QUOTA_ACTION_TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All actions" },
  { value: "GRANTED", label: QUOTA_ACTION_TYPE_LABELS.GRANTED },
  { value: "DEDUCTED", label: QUOTA_ACTION_TYPE_LABELS.DEDUCTED },
  { value: "REVOKED", label: QUOTA_ACTION_TYPE_LABELS.REVOKED },
];
