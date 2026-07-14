import type { TenantPlan } from "../tenancy/types";

export type LicenseStatus = "active" | "expiring" | "expired";

export interface License {
  id: string;
  tenantName: string;
  plan: TenantPlan;
  status: LicenseStatus;
  seatsUsed: number;
  seatsTotal: number;
  issuedAt: string;
  expiresAt: string;
}

export interface LicenseStats {
  total: string;
  active: string;
  expiring: string;
  expired: string;
}
