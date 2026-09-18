export type TenantStatus = "active" | "expiring" | "expired" | "suspended";

export type TenantPlan = "starter" | "professional" | "enterprise";

/**
 * Display model for the dashboard/tenancy screens. Only `id`, `code`, `name`,
 * `organizationType`, `status`, `plan`, and `seatsTotal` are backed by the
 * real admin service (`TenantResponse` has `publicId, code, name,
 * organizationType, status, packageName, studentLimit`). `slug` is a
 * client-only display convenience derived from `name`, never round-tripped.
 * `contactEmail`, `seatsUsed`, `location`, `activatedAt`, `expiresAt`, and
 * `lastActiveLabel` have no backend support today (no contact/contract-date
 * fields, no usage-tracking) — they are always placeholder values, kept only
 * so the dashboard map/detail views (which predate this fix and are out of
 * this phase's scope) keep compiling against real data instead of guessing.
 */
export interface Tenant {
  id: string;
  code: string;
  name: string;
  slug: string;
  organizationType: string;
  taxCode: string | null;
  contactEmail: string | null;
  status: TenantStatus;
  seatsUsed: number;
  seatsTotal: number;
  plan: TenantPlan;
  location: string | null;
  activatedAt: string;
  expiresAt: string;
  lastActiveLabel: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface SystemHealth {
  apiErrorRate: string;
  aiQueueDepth: number;
  deliveryErrors: number;
  operational: boolean;
}

export type TenantStatusFilter = TenantStatus | "all";

export interface TenantFilter {
  query: string;
  status: TenantStatusFilter;
  plan: TenantPlan | "all";
  organizationType: string | "all";
  capacity: TenantCapacityFilter;
}

export type TenantCapacityFilter = "all" | "0-100" | "101-500" | "501+";

/**
 * Raw form values for creating a tenant — one field per real
 * `OnboardTenantRequest` field, nothing else (the backend has no
 * slug/location/contact/contract-date fields to receive them).
 */
export interface CreateTenantInput {
  code: string;
  name: string;
  organizationType: string;
  taxCode: string;
  plan: TenantPlan | "";
  studentLimit: string;
}

/** Per-field validation messages; a field is absent when it is valid. */
export type CreateTenantErrors = Partial<Record<keyof CreateTenantInput, string>>;

export type FacilityType = "MAIN" | "BRANCH" | "TEST_CENTER";

export type OrganizationStatus = "active" | "suspended";

/** A branch/facility under a Tenant — matches admin's real `OrganizationResponse`. */
export interface Organization {
  id: string;
  name: string;
  address: string | null;
  facilityType: FacilityType;
  status: OrganizationStatus;
}

/** Raw form values for the branding editor — empty string means "unset". */
export interface BrandingInput {
  logoUrl: string;
  primaryColor: string;
}

export type LoginAccountStatus = "active" | "suspended";

/** The Host's HOST_ADMIN login account for a Tenant — matches iam's `UserResponse`. */
export interface LoginAccount {
  id: string;
  email: string;
  fullName: string;
  tenantId: string | null;
  status: LoginAccountStatus;
  roles: string[];
  studentCode: string | null;
  className: string | null;
  phone: string | null;
  dateOfBirth: string | null;
}

export interface CreateLoginAccountInput {
  email: string;
  fullName: string;
  password: string;
}

export type CreateLoginAccountErrors = Partial<Record<keyof CreateLoginAccountInput, string>>;

export interface ResetPasswordInput {
  newPassword: string;
}

export type ResetPasswordErrors = Partial<Record<keyof ResetPasswordInput, string>>;
