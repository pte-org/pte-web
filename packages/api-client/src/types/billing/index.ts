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
  /** Backend BigDecimal may be serialized as a JSON number or a decimal string. */
  price: string | number;
  currency: string;
  durationDays: number | null;
  maxStudentsPerSession: number | null;
  extraStudentSlots: number | null;
  status: PlanStatus;
  /** Missing on older servers: destructive actions must fail closed. */
  canDeleteDraft?: boolean;
  canArchive?: boolean;
  deleteBlockReason?: string | null;
  archiveBlockReason?: string | null;
  version: number;
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

export interface PlanUpdateRequest extends PlanRequest {
  expectedVersion: number;
}

export interface PlanTransitionRequest {
  expectedVersion: number;
}

export interface SubscriptionResponse {
  publicId: string;
  planId: string;
  /** Always masked (e.g. "•••• AB12") — see `revealLicenseKey` for the full value. */
  licenseKey: string;
  startsAt: string;
  expiresAt: string;
  maxStudentsPerSession: number;
  status: SubscriptionStatus;
  activationSource: ActivationSource;
}

export interface RevealLicenseKeyRequest {
  password: string;
}

export interface LicenseKeyResponse {
  licenseKey: string;
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

/** Safe admin row; the bearer is never a property of this page/detail type. */
export interface AdminLicenseCodeSummary {
  publicId: string;
  maskedCode: string;
  persistedStatus: LicenseCodeStatus;
  effectiveStatus: LicenseCodeStatus;
  planPublicId: string;
  planName: string;
  planType: PlanType | null;
  issuedAt: string;
  codeExpiresAt: string | null;
  redeemedAt: string | null;
  recipientPublicId: string | null;
  recipientName: string | null;
  subscriptionPublicId: string | null;
  /** Organization an admin grant was issued for; null for a legacy bearer code. */
  boundTenantId: string | null;
  contractReference: string | null;
  subscriptionStartsAt: string | null;
  subscriptionExpiresAt: string | null;
}

/**
 * Body for previewing an admin grant; omit `startsAt` to preview the default continuation. Omit `planId` to
 * read only the organization's hosts (plan fields come back null).
 */
export interface LicenseGrantPreviewRequest {
  tenantId: string;
  planId?: string;
  startsAt?: string;
}

export interface LicenseGrantHost {
  username: string;
  email: string | null;
  fullName: string | null;
}

/** Exam fields are null for a student-capacity plan; `renewsLicenseKey` is masked. */
export interface LicenseGrantPreviewResponse {
  tenantId: string;
  planId: string | null;
  planName: string | null;
  planType: PlanType | null;
  hosts: LicenseGrantHost[];
  defaultStartsAt: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  maxStudentsPerSession: number | null;
  extraStudentSlots: number | null;
  renewsLicenseKey: string | null;
  renewsExpiresAt: string | null;
}

/** Omit `startsAt` to let the server continue the latest lane of the same plan exactly. */
export interface LicenseGrantRequest {
  tenantId: string;
  planId: string;
  startsAt?: string;
  contractReference: string;
  note?: string;
}

/** The bearer code is never returned; `licenseKey` is masked. */
export interface LicenseGrantResponse {
  licenseCodePublicId: string;
  tenantId: string;
  planId: string;
  kind: "SUBSCRIPTION" | "STUDENT_CAPACITY";
  subscriptionPublicId: string | null;
  licenseKey: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  maxStudentsPerSession: number | null;
  grantedStudentSlots: number | null;
  contractReference: string | null;
  replayed: boolean;
}

export interface LicenseCodeRevealResponse {
  /** Secret-bearing response; callers must keep it out of query/mutation caches. */
  code: string;
}

export interface LicenseIssueReceipt {
  publicId: string;
  planId: string;
  persistedStatus: LicenseCodeStatus;
  status: LicenseCodeStatus;
  issuedAt: string;
  codeExpiresAt: string | null;
  replayed: boolean;
}

export interface LicenseRevokePreviewResponse {
  publicId: string;
  planId: string;
  effectiveState: LicenseCodeStatus;
  impactCategory: "CODE_ONLY" | "EXAM_SUBSCRIPTION";
  subscriptionPublicId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  tenantPublicId: string | null;
  scheduledCount: number;
  openCount: number;
  closedCount: number;
  scheduledSessionPublicIds: string[];
  previewExpiresAt: string;
  scopeDigest: string;
}

export interface ConfirmLicenseRevokeRequest {
  reason: string;
  scopeDigest: string;
  previewExpiresAt: string;
  expectedEffectiveState: LicenseCodeStatus;
  expectedPlanId: string;
  expectedSubscriptionPublicId: string | null;
  expectedSubscriptionStatus: SubscriptionStatus | null;
  cancelSubscription: boolean;
  cancelScheduledScope: boolean;
  preserveOpenClosed: boolean;
}

export interface LicenseRevokeResponse {
  publicId: string;
  status: LicenseCodeStatus;
  impactCategory: "CODE_ONLY" | "EXAM_SUBSCRIPTION";
  subscriptionPublicId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionCancelled: boolean;
  scheduledCancelledCount: number;
  openPreservedCount: number;
  closedPreservedCount: number;
  cancelledSessionPublicIds: string[];
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

export type PlatformSettingValueType = "INTEGER" | "DURATION_HOURS";

export interface PlatformSettingResponse {
  publicId: string;
  key: string;
  value: string;
  description: string | null;
  category: string;
  type: PlatformSettingValueType;
  defaultValue: string;
  unit: string | null;
  minimum: number | null;
  maximum: number | null;
  editable: boolean;
  requiresRestart: boolean;
  scope: string;
  impact: string;
  updatedAt: string | null;
}

export interface PlatformSettingRequest {
  value: string;
  description?: string;
}

export interface PlatformSettingChangeRequest {
  key: string;
  value: string;
}

export interface PlatformSettingBatchRequest {
  settings: PlatformSettingChangeRequest[];
}

export interface PlatformOrderResponse {
  publicId: string;
  tenantId: string;
  planId: string;
  orderCode: number;
  amount: string | number;
  currency: string;
  status: OrderStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface PlatformSubscriptionResponse {
  publicId: string;
  tenantId: string;
  planId: string;
  maskedLicenseKey: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  maxStudentsPerSession: number | null;
  status: SubscriptionStatus;
  activationSource: ActivationSource;
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
