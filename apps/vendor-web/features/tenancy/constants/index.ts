import type { BadgeVariant, ProgressTone } from "@aptis/ui";
import type {
  CreateTenantInput,
  TenantPlan,
  TenantStatus,
  TenantStatusFilter,
} from "../types";

export const TENANCY_TEXT = {
  TITLE: "Tenants",
  SUBTITLE: "Manage organizations that use the platform.",
  ADD_TENANT: "Add Tenant",
  SEARCH_PLACEHOLDER: "Search by name or slug",
  DATE_PLACEHOLDER: "Select date range",
  SEATS_ARIA: "Seats used",
  ACTION_SUSPEND: "Suspend",
  EMPTY_TITLE: "No tenants yet",
  EMPTY_TEXT:
    "Start by adding the first partner or school to set up a managed learning environment.",
} as const;

export const TENANT_TABLE_HEADERS = {
  NAME: "Tenant Name",
  SLUG: "Slug",
  STATUS: "Status",
  SEATS: "Seats (used/total)",
  EXPIRES: "Expires On",
  LAST_ACTIVE: "Last Active",
  ACTIONS: "Actions",
} as const;

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  active: "Active",
  expiring: "Expiring soon",
  expired: "Expired",
  suspended: "Suspended",
};

export const TENANT_STATUS_VARIANT: Record<TenantStatus, BadgeVariant> = {
  active: "success",
  expiring: "warning",
  expired: "danger",
  suspended: "neutral",
};

export const TENANT_PLAN_LABELS: Record<TenantPlan, string> = {
  starter: "Starter (500 users)",
  professional: "Professional (1000 users)",
  enterprise: "Enterprise (Unlimited)",
};

export const STATUS_FILTER_OPTIONS: {
  value: TenantStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "expiring", label: "Expiring soon" },
  { value: "expired", label: "Expired" },
  { value: "suspended", label: "Suspended" },
];

export const SYSTEM_HEALTH_TEXT = {
  TITLE: "System Health",
  API_ERROR_RATE: "API Error Rate",
  AI_QUEUE: "AI Queue Depth",
  AI_QUEUE_UNIT: "exams",
  DELIVERY_ERRORS: "Delivery Errors",
  DELIVERY_ERRORS_UNIT: "errors",
  SERVER_STATUS: "Server Status",
  OPERATIONAL: "All systems operational.",
  VIEW_LOGS: "View Logs",
} as const;

export const SUSPEND_MODAL_TEXT = {
  TITLE: "Confirm Suspension",
  WARNING:
    "This action will temporarily stop access for users under this tenant. The license will remain frozen until reactivated.",
  CONFIRM_PROMPT: "To confirm, enter the exact tenant name:",
  INPUT_LABEL: "Tenant name",
  INPUT_PLACEHOLDER: "Enter tenant name to confirm",
  CANCEL: "Cancel",
  CONFIRM: "Suspend",
} as const;

export const CREATE_TENANT_TEXT = {
  TITLE: "Add Tenant",
  SECTION_GENERAL: "General Information",
  SECTION_CONTACT: "Primary Contact (First Admin)",
  NAME_LABEL: "Tenant Name",
  NAME_PLACEHOLDER: "Enter school or organization name...",
  SLUG_LABEL: "Slug (System Identifier)",
  SLUG_PREFIX: "aptis.vn/",
  SLUG_PLACEHOLDER: "organization-name",
  SLUG_HELPER:
    "Use lowercase letters, numbers, and hyphens only.",
  PLAN_LABEL: "Plan",
  PLAN_PLACEHOLDER: "Select a plan",
  MAX_USERS_LABEL: "Maximum users",
  MAX_USERS_PLACEHOLDER: "e.g. 500",
  MAX_USERS_HELPER: "Leave blank to use the selected plan limit.",
  EXPIRES_LABEL: "Expiration Date",
  CONTACT_NAME_LABEL: "Full Name",
  CONTACT_NAME_PLACEHOLDER: "Alex Nguyen",
  CONTACT_PHONE_LABEL: "Phone Number",
  CONTACT_PHONE_PLACEHOLDER: "09xx xxx xxx",
  CONTACT_EMAIL_LABEL: "Admin Email",
  CONTACT_EMAIL_PLACEHOLDER: "admin@organization.com",
  CONTACT_EMAIL_HELPER: "The tenant admin account will be created from this email.",
  CANCEL: "Cancel",
  SUBMIT: "Create Tenant",
} as const;

export const TENANT_CREATED_TEXT = {
  TITLE: "Tenant Created Successfully",
  SUBTITLE:
    "The new tenant has been initialized and is ready to use. Please save the login information below.",
  NAME_LABEL: "Tenant Name",
  ACTIVATION_LABEL: "Activation Code",
  LOGIN_URL_LABEL: "Login URL",
  NOTICE:
    "This login information is shown only once. The tenant administrator must use the activation code to set a password on first login.",
  CLOSE: "Close",
  COPY_ALL: "Copy all information",
  COPY_ARIA: "Copy",
} as const;

export const CREATE_TENANT_LOCATION_TEXT = {
  LABEL: "Province/City",
  PLACEHOLDER: "Select a location",
} as const;

export const TENANT_LOGIN_CREDENTIAL_TEXT = {
  EMAIL_LABEL: "Login Email",
  PASSWORD_LABEL: "Temporary Password",
} as const;

export const CREATE_TENANT_ERRORS = {
  REQUIRED: "This field is required.",
  SLUG_INVALID: "Use lowercase letters, numbers, and hyphens only.",
  EMAIL_INVALID: "Please enter a valid email address.",
} as const;

export const CREATE_TENANT_CONFLICT_TEXT = {
  DUPLICATE_SLUG: "This tenant code already exists. Please use another slug.",
  DUPLICATE_EMAIL:
    "This admin email is already used by another tenant. Please use another email.",
  CONFLICT:
    "The tenant slug, admin email, or contract code already exists. Please check the information and try again.",
} as const;

export const PLAN_SELECT_OPTIONS: { value: TenantPlan; label: string }[] = [
  { value: "starter", label: TENANT_PLAN_LABELS.starter },
  { value: "professional", label: TENANT_PLAN_LABELS.professional },
  { value: "enterprise", label: TENANT_PLAN_LABELS.enterprise },
];

export interface TenantLocationOption {
  value: string;
  label: string;
  x: number;
  y: number;
}

export const TENANT_LOCATION_OPTIONS: TenantLocationOption[] = [
  { value: "ha-noi", label: "Hanoi", x: 112, y: 70 },
  { value: "hai-phong", label: "Hai Phong", x: 132, y: 78 },
  { value: "da-nang", label: "Da Nang", x: 118, y: 168 },
  { value: "khanh-hoa", label: "Khanh Hoa", x: 138, y: 230 },
  { value: "lam-dong", label: "Lam Dong", x: 118, y: 246 },
  { value: "ho-chi-minh", label: "Ho Chi Minh City", x: 108, y: 285 },
  { value: "can-tho", label: "Can Tho", x: 90, y: 310 },
];

/** Default seat cap per plan when "max users" is left blank. */
export const DEFAULT_SEATS_BY_PLAN: Record<TenantPlan, number> = {
  starter: 500,
  professional: 1000,
  enterprise: 5000,
};

export const EMPTY_CREATE_TENANT: CreateTenantInput = {
  name: "",
  slug: "",
  plan: "",
  location: "",
  maxUsers: "",
  expiresAt: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

/** Seat-usage colour thresholds: amber >=80% used, red when full. */
export const SEAT_WARN_RATIO = 0.8;

export const seatTone = (used: number, total: number): ProgressTone => {
  if (total <= 0 || used >= total) return "danger";
  if (used / total >= SEAT_WARN_RATIO) return "warning";
  return "success";
};
