/** Matches the API's `OrganizationStatus` enum; platform operators only ever see ACTIVE or SUSPENDED rows. */
export type TenantStatusResponse = "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";

/** Matches admin's real `TenantResponse` record exactly, including its immutable code. */
export interface TenantResponse {
  publicId: string;
  code: string;
  name: string;
  organizationType: string;
  taxCode: string | null;
  status: TenantStatusResponse;
  suspendedUntil: string | null;
  packageName: string;
  studentLimit: number;
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface TenantSuspensionSubscriptionImpact {
  subscriptionPublicId: string;
  planPublicId: string;
  planLabel: string | null;
  expiresAt: string;
  daysLost: number;
  lossSeconds: number;
}

export interface TenantSuspensionImpactResponse {
  tenantPublicId: string;
  suspensionDays: number;
  suspendedUntil: string | null;
  activeSubscriptionCount: number;
  totalDaysLost: number;
  expiringSubscriptions: TenantSuspensionSubscriptionImpact[];
  totalLossSeconds: number;
  remainingSubscriptionCount: number;
  impactDigest: string | null;
}

export interface SuspendTenantRequest {
  days?: number | null;
  impactDigest: string;
}

/**
 * Platform operator creates an organization: approved at once with its first host account for `hostEmail`.
 * There is no plan or student limit: the limit comes from platform settings, packages are granted separately.
 */
export interface DirectOnboardRequest {
  code: string;
  name: string;
  organizationType: string;
  taxCode: string;
  hostEmail: string;
}

/** The host password is emailed to the host, never returned. */
export interface DirectOnboardResponse {
  publicId: string;
  code: string;
  name: string;
  hostUsername: string;
}

/** Matches admin's real `UpdateBrandingRequest` record exactly. Either field may be `null` to clear it. */
export interface UpdateBrandingRequest {
  logoUrl: string | null;
  primaryColor: string | null;
}
