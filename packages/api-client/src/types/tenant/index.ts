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
  packageName: string;
  studentLimit: number;
  logoUrl: string | null;
  primaryColor: string | null;
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
