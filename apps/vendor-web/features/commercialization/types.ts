export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PlanStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type PlanFamily = "EXAM_PACKAGE" | "STUDENT_CAPACITY";
export type LicenseCodeStatus = "ISSUED" | "REDEEMED" | "REVOKED" | "EXPIRED";

export interface TenantApplication {
  id: string;
  reference: string;
  organizationName: string;
  organizationType: string;
  representative: string;
  email: string;
  phone: string;
  tenantCode: string;
  submittedAt: string;
  status: ApplicationStatus;
  note?: string;
}

export interface CommercialPlan {
  id: string;
  name: string;
  family: PlanFamily;
  status: PlanStatus;
  price: string;
  duration: string;
  capacity: string;
  description: string;
}

export interface LicenseCode {
  id: string;
  code: string;
  plan: string;
  tenant: string;
  status: LicenseCodeStatus;
  issuedAt: string;
  expiresAt: string;
}
