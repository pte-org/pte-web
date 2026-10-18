/** Matches admin's real `TenantStatus` enum (`ACTIVE`/`SUSPENDED` only). */
export type TenantStatusResponse = "ACTIVE" | "SUSPENDED";

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

/** Matches admin's real `OnboardTenantRequest` record exactly. */
export interface OnboardTenantRequest {
  code: string;
  name: string;
  organizationType: string;
  taxCode: string;
  packageName: string;
  studentLimit: number;
}

/** Matches admin's real `UpdateBrandingRequest` record exactly. Either field may be `null` to clear it. */
export interface UpdateBrandingRequest {
  logoUrl: string | null;
  primaryColor: string | null;
}
