export type TenantStatus = "active" | "expiring" | "expired" | "suspended";

export type TenantPlan = "starter" | "professional" | "enterprise";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  status: TenantStatus;
  seatsUsed: number;
  seatsTotal: number;
  plan: TenantPlan;
  location: string | null;
  activatedAt: string;
  expiresAt: string;
  lastActiveLabel: string;
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
}

/** Raw form values for creating a tenant (before mapping to a Tenant). */
export interface CreateTenantInput {
  name: string;
  slug: string;
  plan: TenantPlan | "";
  location: string;
  maxUsers: string;
  expiresAt: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

/** Per-field validation messages; a field is absent when it is valid. */
export type CreateTenantErrors = Partial<
  Record<keyof CreateTenantInput, string>
>;

/** Result returned after a tenant is created — the one-time onboarding info. */
export interface TenantCreationResult {
  tenant: Tenant;
  loginEmail: string;
  activationCode: string;
  loginUrl: string;
}
