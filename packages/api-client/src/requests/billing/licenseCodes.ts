import type { ApiClient, PagedResult } from "../../client/client";
import type {
  AdminLicenseCodeSummary,
  IssueLicenseCodeRequest,
  LicenseCodeResponse,
  LicenseCodeStatus,
  LicenseIssueReceipt,
  LicenseRevokePreviewResponse,
  LicenseRevokeResponse,
  LicenseCodeRevealResponse,
  ConfirmLicenseRevokeRequest,
  RedeemLicenseCodeRequest,
  SubscriptionActivationResponse,
} from "../../types/billing";

export const LICENSE_CODE_ENDPOINTS = {
  issue: "/api/v1/admin/license-codes",
  adminList: "/api/v1/admin/license-codes",
  adminDetail: (publicId: string) => "/api/v1/admin/license-codes/" + encodeURIComponent(publicId),
  lookup: "/api/v1/admin/license-codes/lookup",
  reveal: (publicId: string) =>
    "/api/v1/admin/license-codes/" + encodeURIComponent(publicId) + "/reveal",
  licenseCodes: "/api/v1/license-codes",
  revokePreview: (publicId: string) =>
    "/api/v1/admin/license-codes/" + encodeURIComponent(publicId) + "/revoke-preview",
  revoke: (publicId: string) =>
    "/api/v1/admin/license-codes/" + encodeURIComponent(publicId) + "/revoke",
  redeem: "/api/v1/license-code-redemptions",
} as const;

export interface AdminLicenseCodeListParams {
  page?: number;
  size?: number;
  status?: LicenseCodeStatus;
  planId?: string;
  tenantId?: string;
}

export function listAdminLicenseCodes(
  client: ApiClient,
  params: AdminLicenseCodeListParams = {},
): Promise<PagedResult<AdminLicenseCodeSummary>> {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 25),
  });
  if (params.status) query.set("status", params.status);
  if (params.planId) query.set("planId", params.planId);
  if (params.tenantId) query.set("tenantId", params.tenantId);
  return client.request(`${LICENSE_CODE_ENDPOINTS.adminList}?${query.toString()}`);
}

export function getAdminLicenseCode(
  client: ApiClient,
  publicId: string,
): Promise<AdminLicenseCodeSummary> {
  return client.request(LICENSE_CODE_ENDPOINTS.adminDetail(publicId));
}

/** Direct, non-cacheable lookup: the request body is intentionally not a mutation variable. */
export function lookupLicenseCode(
  client: ApiClient,
  code: string,
): Promise<AdminLicenseCodeSummary> {
  return client.request(LICENSE_CODE_ENDPOINTS.lookup, {
    method: "POST",
    cache: "no-store",
    headers: { "Cache-Control": "no-store" },
    body: { code },
  });
}

/** Direct, non-cacheable secret reveal. Do not wrap this in useQuery/useMutation. */
export function revealLicenseCode(
  client: ApiClient,
  publicId: string,
): Promise<LicenseCodeRevealResponse> {
  return client.request(LICENSE_CODE_ENDPOINTS.reveal(publicId), {
    method: "POST",
    cache: "no-store",
    headers: { "Cache-Control": "no-store" },
  });
}

/** @deprecated The server route is retired; use listAdminLicenseCodes instead. */
export function listLicenseCodes(client: ApiClient): Promise<LicenseCodeResponse[]> {
  return client.request(LICENSE_CODE_ENDPOINTS.licenseCodes);
}

export function issueLicenseCode(
  client: ApiClient,
  payload: IssueLicenseCodeRequest,
  idempotencyKey: string,
): Promise<LicenseIssueReceipt> {
  return client.request(LICENSE_CODE_ENDPOINTS.issue, {
    method: "POST", body: payload, headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function revokeLicenseCode(
  client: ApiClient,
  publicId: string,
  payload: ConfirmLicenseRevokeRequest,
): Promise<LicenseRevokeResponse> {
  return client.request(LICENSE_CODE_ENDPOINTS.revoke(publicId), { method: "POST", body: payload });
}

export function previewLicenseCodeRevoke(
  client: ApiClient,
  publicId: string,
): Promise<LicenseRevokePreviewResponse> {
  return client.request(LICENSE_CODE_ENDPOINTS.revokePreview(publicId));
}

export function redeemLicenseCode(
  client: ApiClient,
  payload: RedeemLicenseCodeRequest,
): Promise<SubscriptionActivationResponse> {
  return client.request(LICENSE_CODE_ENDPOINTS.redeem, { method: "POST", body: payload });
}
