import type { BadgeVariant } from "@pte/ui";
import type {
  CreateLoginAccountInput,
  CreateTenantInput,
  FacilityType,
  LoginAccountStatus,
  OrganizationStatus,
  ResetPasswordInput,
  TenantPlan,
  TenantStatus,
  TenantStatusFilter,
} from "../types";

// react-query cache-key roots — one per entity, kept out of api/index.ts so
// no call site ever inlines the label as a raw string (avoids typo-driven
// cache-key drift and namespace collisions).
export const TENANTS_QUERY_KEY = ["tenants"] as const;
export const SYSTEM_HEALTH_QUERY_KEY = ["systemHealth"] as const;
export const TENANT_QUERY_KEY = ["tenant"] as const;
export const ORGANIZATIONS_QUERY_KEY = ["organizations"] as const;
export const LOGIN_ACCOUNT_QUERY_KEY = ["loginAccount"] as const;

export const TENANCY_TEXT = {
  TITLE: "Tenants",
  SUBTITLE: "Manage tenant identity, access, plans, licenses, and student capacity.",
  ADD_TENANT: "Add Tenant",
  SEARCH_PLACEHOLDER: "Search by tenant name, code, or tax code",
  ACTION_VIEW_DETAILS: "View details",
  ACTION_GRANT_QUOTA: "Grant quota",
  ACTION_VIEW_QUOTA_HISTORY: "View quota history",
  ACTION_SUSPEND: "Suspend",
  ACTION_REACTIVATE: "Reactivate",
  EMPTY_TITLE: "No tenants yet",
  EMPTY_TEXT:
    "Start by adding the first partner or school to set up a managed learning environment.",
  EMPTY_VALUE: "—",
} as const;

export const TENANT_TABLE_HEADERS = {
  CODE: "Tenant Code",
  NAME: "Tenant Name",
  TYPE: "Organization Type",
  TAX_CODE: "Tax Code",
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
  { value: "suspended", label: "Suspended" },
];

export const PLAN_FILTER_OPTIONS: { value: TenantPlan | "all"; label: string }[] = [
  { value: "all", label: "All plans" },
  ...Object.entries(TENANT_PLAN_LABELS).map(([value, label]) => ({
    value: value as TenantPlan,
    label,
  })),
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
  EMPTY_VALUE: "—",
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
  CODE_LABEL: "Tenant Code",
  CODE_PLACEHOLDER: "e.g. fpt-university",
  CODE_HELPER: "3–32 lowercase letters, numbers, or hyphens. This code cannot change later.",
  NAME_LABEL: "Tenant Name",
  NAME_PLACEHOLDER: "Enter school or organization name...",
  ORG_TYPE_LABEL: "Organization Type",
  ORG_TYPE_PLACEHOLDER: "Select a type",
  TAX_CODE_LABEL: "Tax Code",
  TAX_CODE_PLACEHOLDER: "Enter the organization's tax code",
  TAX_CODE_HELPER: "Required for organization verification.",
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

export const ORGANIZATION_TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All organization types" },
  ...ORGANIZATION_TYPE_OPTIONS,
];

export const CAPACITY_FILTER_OPTIONS: {
  value: "all" | "0-100" | "101-500" | "501+";
  label: string;
}[] = [
  { value: "all", label: "All student limits" },
  { value: "0-100", label: "Up to 100 students" },
  { value: "101-500", label: "101–500 students" },
  { value: "501+", label: "501+ students" },
];

export const TENANT_STATS_TEXT = {
  TOTAL: "Total tenants",
  ACTIVE: "Active tenants",
  SUSPENDED: "Suspended tenants",
  STUDENT_SEATS: "Total student seats",
} as const;

export const TENANT_OVERVIEW_TEXT = {
  TITLE: "Tenant overview",
  SUBTITLE: "Tenant status and capacity at a glance.",
} as const;

export const TENANT_CREATED_TEXT = {
  TITLE: "Tenant Created Successfully",
  SUBTITLE: "The new tenant has been added to the platform.",
  CODE_LABEL: "Tenant Code",
  NAME_LABEL: "Tenant Name",
  ORG_TYPE_LABEL: "Organization Type",
  TAX_CODE_LABEL: "Tax Code",
  PLAN_LABEL: "Plan",
  STUDENT_LIMIT_LABEL: "Student Limit",
  EMPTY_VALUE: "—",
  CLOSE: "Close",
} as const;

export const CREATE_TENANT_ERRORS = {
  REQUIRED: "This field is required.",
  CODE_INVALID: "Use 3–32 lowercase letters, numbers, or hyphens.",
  STUDENT_LIMIT_INVALID: "Enter a whole number of at least 1.",
} as const;

export const CREATE_TENANT_CONFLICT_TEXT = {
  DUPLICATE_CODE: "This tenant code already exists. Please use another code.",
  DUPLICATE_NAME: "This tenant name already exists. Please use another name.",
  TENANT_CONFLICT:
    "The tenant code or name already exists. Please check the information and try again.",
  CONFLICT: "The tenant name already exists. Please check the information and try again.",
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
  code: "",
  name: "",
  organizationType: "",
  taxCode: "",
  plan: "",
  studentLimit: "",
};

export const TENANT_DETAIL_TEXT = {
  BACK_TO_TENANTS: "Back to Tenants",
  SUMMARY_SUBTITLE: (organizationType: string, plan: string, seats: number) =>
    `${organizationType} · ${plan} · ${seats} students`,
  EMPTY_VALUE: "—",
  INFORMATION_TITLE: "Tenant information",
  ID_LABEL: "Tenant ID",
  CODE_LABEL: "Tenant code",
  NAME_LABEL: "Tenant name",
  ORGANIZATION_TYPE_LABEL: "Organization type",
  TAX_CODE_LABEL: "Tax code",
  PLAN_LABEL: "Plan",
  STUDENT_LIMIT_LABEL: "Student limit",
  STATUS_LABEL: "Status",
  BRANDING_TITLE: "White-Label Branding",
  BRANDING_SUBTITLE: "Shown to this tenant's users across the platform.",
  LOGO_URL_LABEL: "Logo URL",
  LOGO_URL_PLACEHOLDER: "https://example.com/logo.png",
  LOGO_URL_HELPER: "Paste a link to an already-hosted image. File upload isn't available yet.",
  PRIMARY_COLOR_LABEL: "Primary Color",
  PRIMARY_COLOR_PLACEHOLDER: "#1A2B3C",
  PRIMARY_COLOR_INVALID: "Enter a 6-digit hex color like #1A2B3C.",
  SAVE_BRANDING: "Save Branding",
  BRANDING_SAVED: "Branding saved.",
  ORGANIZATIONS_TITLE: "Organization",
  ORGANIZATIONS_SUBTITLE: "The organization assigned to this tenant.",
  EMPTY_ORGANIZATIONS_TITLE: "Organization not provisioned",
  EMPTY_ORGANIZATIONS_TEXT: "A default organization is created automatically with the tenant.",
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

export const ORGANIZATION_STATUS_LABELS: Record<OrganizationStatus, string> = {
  active: "Active",
  suspended: "Suspended",
};

export const ORGANIZATION_STATUS_VARIANT: Record<OrganizationStatus, BadgeVariant> = {
  active: "success",
  suspended: "neutral",
};

export const LOGIN_ACCOUNT_TEXT = {
  TITLE: "Login Account",
  SUBTITLE: "The Host's own login for this tenant.",
  EMPTY_TITLE: "No login account yet",
  EMPTY_TEXT: "Create the Host's first login so they can sign in.",
  CREATE_LOGIN: "Create Login",
  RESET_PASSWORD: "Reset Password",
  EMAIL_LABEL: "Email",
  FULL_NAME_LABEL: "Full name",
  USER_ID_LABEL: "User ID",
  USERNAME_LABEL: "Username",
  TENANT_ID_LABEL: "Tenant ID",
  ROLES_LABEL: "Roles",
  STUDENT_CODE_LABEL: "Student code",
  CLASS_NAME_LABEL: "Class name",
  PHONE_LABEL: "Phone",
  DATE_OF_BIRTH_LABEL: "Date of birth",
  PASSWORD_STATE_LABEL: "First-login password change",
  PASSWORD_STATE_REQUIRED: "Required",
  PASSWORD_STATE_NOT_REQUIRED: "Not required",
  EMPTY_VALUE: "—",
  RESET_SUCCESS: "Password reset. Relay it to the Host directly — it won't be shown again.",
} as const;

export const LOGIN_ACCOUNT_STATUS_LABELS: Record<LoginAccountStatus, string> = {
  active: "Active",
  suspended: "Suspended",
};

export const LOGIN_ACCOUNT_STATUS_VARIANT: Record<LoginAccountStatus, BadgeVariant> = {
  active: "success",
  suspended: "neutral",
};

export const CREATE_LOGIN_ACCOUNT_TEXT = {
  TITLE: "Create Login",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "host@example.com",
  FULL_NAME_LABEL: "Full Name",
  FULL_NAME_PLACEHOLDER: "Enter the Host's name...",
  PASSWORD_LABEL: "Initial Password",
  PASSWORD_HELPER: "At least 8 characters. Relay it to the Host directly.",
  CANCEL: "Cancel",
  SUBMIT: "Create Login",
  CONFLICT: "This email is already in use. Please use another email.",
} as const;

export const CREATE_LOGIN_ACCOUNT_ERRORS = {
  REQUIRED: "This field is required.",
  EMAIL_INVALID: "Enter a valid email address.",
  PASSWORD_TOO_SHORT: "Enter at least 8 characters.",
} as const;

export const EMPTY_CREATE_LOGIN_ACCOUNT: CreateLoginAccountInput = {
  email: "",
  fullName: "",
  password: "",
};

export const RESET_PASSWORD_TEXT = {
  TITLE: "Reset Password",
  PASSWORD_LABEL: "New Password",
  PASSWORD_HELPER: "At least 8 characters. Relay it to the Host directly.",
  CANCEL: "Cancel",
  SUBMIT: "Reset Password",
} as const;

export const RESET_PASSWORD_ERRORS = {
  PASSWORD_TOO_SHORT: "Enter at least 8 characters.",
} as const;

export const EMPTY_RESET_PASSWORD: ResetPasswordInput = {
  newPassword: "",
};
