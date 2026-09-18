export type TenantApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PlanType = "EXAM_PACKAGE" | "STUDENT_CAPACITY";
export type PlanStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type ActivationSource = "PAYMENT" | "LICENSE_CODE";
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";
export type LicenseCodeStatus = "ISSUED" | "REDEEMED" | "REVOKED" | "EXPIRED";

export interface TenantApplicationResponse {
  publicId: string;
  orgName: string;
  orgType: string;
  requestedCode: string;
  contactEmail: string;
  contactPhone: string | null;
  taxCode: string | null;
  status: TenantApplicationStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
}

export interface SubmitApplicationRequest {
  orgName: string;
  orgType: string;
  requestedCode: string;
  contactEmail: string;
  contactPhone?: string;
  taxCode: string;
}

export interface RejectApplicationRequest {
  reason: string;
}

export interface PlanResponse {
  publicId: string;
  name: string;
  description: string | null;
  type: PlanType;
  price: string;
  currency: string;
  durationDays: number | null;
  maxStudentsPerSession: number | null;
  extraStudentSlots: number | null;
  status: PlanStatus;
}

export interface PlanRequest {
  name: string;
  description?: string;
  type: PlanType;
  price: string;
  currency: string;
  durationDays?: number | null;
  maxStudentsPerSession?: number | null;
  extraStudentSlots?: number | null;
}

export interface SubscriptionResponse {
  publicId: string;
  planId: string;
  licenseKey: string;
  startsAt: string;
  expiresAt: string;
  maxStudentsPerSession: number;
  status: SubscriptionStatus;
  activationSource: ActivationSource;
}

export interface OrderResponse {
  publicId: string;
  tenantId: string;
  planId: string;
  /** Backend Long. Treat as display data; do not perform arithmetic in JS. */
  orderCode: number;
  amount: string;
  currency: string;
  status: OrderStatus;
  paymentLinkUrl: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface CreateOrderRequest {
  planId: string;
}

export interface LicenseCodeResponse {
  publicId: string;
  code: string;
  planId: string;
  status: LicenseCodeStatus;
  issuedBy: string;
  issuedAt: string;
  codeExpiresAt: string | null;
  redeemedByTenantId: string | null;
  redeemedAt: string | null;
  subscriptionId: string | null;
  revokeReason: string | null;
}

export interface IssueLicenseCodeRequest {
  planId: string;
  codeExpiresAt?: string | null;
}

export interface RevokeLicenseCodeRequest {
  reason: string;
}

export interface RedeemLicenseCodeRequest {
  code: string;
}

export interface SubscriptionActivationResponse {
  kind: "SUBSCRIPTION" | "STUDENT_CAPACITY";
  tenantId: string;
  planId: string;
  licenseKey: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  maxStudentsPerSession: number | null;
  grantedStudentSlots: number | null;
  status: SubscriptionStatus | null;
  activationSource: ActivationSource | null;
}

export interface PlatformSettingResponse {
  publicId: string;
  key: string;
  value: string;
  description: string | null;
}

export interface PlatformSettingRequest {
  value: string;
  description?: string;
}

export interface StudentQuotaResponse {
  current: number;
  limit: number;
  adding: number;
  remaining: number;
  allowed: boolean;
}

export interface StudentImportPreviewRequest {
  adding: number;
}
