import type { TenantPlan } from "../tenancy/types";

/** Matches admin's real `TenantStatus` — no contract-date fields exist to derive expiring/expired from. */
export type LicenseStatus = "active" | "suspended";

/** A tenant's current package allocation, viewed through the Licensing lens. */
export interface License {
  tenantId: string;
  tenantName: string;
  plan: TenantPlan;
  status: LicenseStatus;
  seatsTotal: number;
}

export interface LicenseStats {
  total: string;
  active: string;
  suspended: string;
  totalSeats: string;
}

/** Raw form values for granting quota — mirrors admin's real `GrantQuotaRequest`. */
export interface GrantQuotaInput {
  packageName: TenantPlan | "";
  amount: string;
  note: string;
}

export type GrantQuotaErrors = Partial<Record<keyof GrantQuotaInput, string>>;
