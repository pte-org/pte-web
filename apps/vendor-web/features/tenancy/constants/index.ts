import type { BadgeVariant } from "@aptis/ui";
import type {
  CreateOrganizationInput,
  CreateTenantInput,
  FacilityType,
  OrganizationStatus,
  TenantPlan,
  TenantStatus,
  TenantStatusFilter,
} from "../types";

export const TENANCY_TEXT = {
  TITLE: "Tenants",
  SUBTITLE: "Manage organizations that use the platform.",
  ADD_TENANT: "Add Tenant",
  SEARCH_PLACEHOLDER: "Search by name or slug",
  ACTION_SUSPEND: "Suspend",
  ACTION_REACTIVATE: "Reactivate",
  EMPTY_TITLE: "No tenants yet",
  EMPTY_TEXT:
    "Start by adding the first partner or school to set up a managed learning environment.",
} as const;

export const TENANT_TABLE_HEADERS = {
  NAME: "Tenant Name",
  TYPE: "Organization Type",
  PLAN: "Plan",
  STUDENT_LIMIT: "Student Limit",
  STATUS: "Status",
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
  NAME_LABEL: "Tenant Name",
  NAME_PLACEHOLDER: "Enter school or organization name...",
  ORG_TYPE_LABEL: "Organization Type",
  ORG_TYPE_PLACEHOLDER: "Select a type",
  PLAN_LABEL: "Plan",
  PLAN_PLACEHOLDER: "Select a plan",
  STUDENT_LIMIT_LABEL: "Student Limit",
  STUDENT_LIMIT_PLACEHOLDER: "e.g. 500",
  CANCEL: "Cancel",
  SUBMIT: "Create Tenant",
} as const;

export const ORGANIZATION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "SCHOOL", label: "School" },
  { value: "UNIVERSITY", label: "University" },
  { value: "TRAINING_CENTER", label: "Training Center" },
  { value: "CORPORATE", label: "Corporate" },
];

export const TENANT_CREATED_TEXT = {
  TITLE: "Tenant Created Successfully",
  SUBTITLE: "The new tenant has been added to the platform.",
  NAME_LABEL: "Tenant Name",
  ORG_TYPE_LABEL: "Organization Type",
  PLAN_LABEL: "Plan",
  STUDENT_LIMIT_LABEL: "Student Limit",
  CLOSE: "Close",
} as const;

export const CREATE_TENANT_ERRORS = {
  REQUIRED: "This field is required.",
  STUDENT_LIMIT_INVALID: "Enter a whole number of at least 1.",
} as const;

export const CREATE_TENANT_CONFLICT_TEXT = {
  DUPLICATE_NAME: "This tenant name already exists. Please use another name.",
  CONFLICT:
    "The tenant name already exists. Please check the information and try again.",
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

export const EMPTY_CREATE_TENANT: CreateTenantInput = {
  name: "",
  organizationType: "",
  plan: "",
  studentLimit: "",
};

export const TENANT_DETAIL_TEXT = {
  BACK_TO_TENANTS: "Back to Tenants",
  BRANDING_TITLE: "White-Label Branding",
  BRANDING_SUBTITLE: "Shown to this tenant's users across the platform.",
  LOGO_URL_LABEL: "Logo URL",
  LOGO_URL_PLACEHOLDER: "https://example.com/logo.png",
  LOGO_URL_HELPER:
    "Paste a link to an already-hosted image. File upload isn't available yet.",
  PRIMARY_COLOR_LABEL: "Primary Color",
  PRIMARY_COLOR_PLACEHOLDER: "#1A2B3C",
  PRIMARY_COLOR_INVALID: "Enter a 6-digit hex color like #1A2B3C.",
  SAVE_BRANDING: "Save Branding",
  BRANDING_SAVED: "Branding saved.",
  ORGANIZATIONS_TITLE: "Organizations",
  ORGANIZATIONS_SUBTITLE: "Branches and facilities under this tenant.",
  ADD_ORGANIZATION: "Add Organization",
  EMPTY_ORGANIZATIONS_TITLE: "No organizations yet",
  EMPTY_ORGANIZATIONS_TEXT:
    "Add the first branch or facility for this tenant.",
} as const;

export const ORGANIZATION_TABLE_HEADERS = {
  NAME: "Name",
  FACILITY_TYPE: "Facility Type",
  ADDRESS: "Address",
  STATUS: "Status",
  ACTIONS: "Actions",
} as const;

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  MAIN: "Main Campus",
  BRANCH: "Branch",
  TEST_CENTER: "Test Center",
};

export const FACILITY_TYPE_OPTIONS: { value: FacilityType; label: string }[] = [
  { value: "MAIN", label: FACILITY_TYPE_LABELS.MAIN },
  { value: "BRANCH", label: FACILITY_TYPE_LABELS.BRANCH },
  { value: "TEST_CENTER", label: FACILITY_TYPE_LABELS.TEST_CENTER },
];

export const ORGANIZATION_STATUS_LABELS: Record<OrganizationStatus, string> = {
  active: "Active",
  suspended: "Suspended",
};

export const ORGANIZATION_STATUS_VARIANT: Record<OrganizationStatus, BadgeVariant> = {
  active: "success",
  suspended: "neutral",
};

export const CREATE_ORGANIZATION_TEXT = {
  TITLE: "Add Organization",
  NAME_LABEL: "Name",
  NAME_PLACEHOLDER: "Enter branch or facility name...",
  ADDRESS_LABEL: "Address",
  ADDRESS_PLACEHOLDER: "Optional",
  FACILITY_TYPE_LABEL: "Facility Type",
  FACILITY_TYPE_PLACEHOLDER: "Select a type",
  CANCEL: "Cancel",
  SUBMIT: "Add Organization",
} as const;

export const CREATE_ORGANIZATION_ERRORS = {
  REQUIRED: "This field is required.",
} as const;

export const EMPTY_CREATE_ORGANIZATION: CreateOrganizationInput = {
  name: "",
  address: "",
  facilityType: "",
};
