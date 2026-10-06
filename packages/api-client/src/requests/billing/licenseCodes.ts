import type { ApiClient } from "../../client/client";
import type {
  IssueLicenseCodeRequest,
  LicenseCodeResponse,
  LicenseIssueReceipt,
  LicenseRevokePreviewResponse,
  LicenseRevokeResponse,
  ConfirmLicenseRevokeRequest,
  RedeemLicenseCodeRequest,
  SubscriptionActivationResponse,
} from "../../types/billing";

export const LICENSE_CODE_ENDPOINTS = {
  issue: "/api/v1/admin/license-codes",
  licenseCodes: "/api/v1/license-codes",
  revokePreview: (publicId: string) =>
    "/api/v1/admin/license-codes/" + encodeURIComponent(publicId) + "/revoke-preview",
  revoke: (publicId: string) =>
    "/api/v1/admin/license-codes/" + encodeURIComponent(publicId) + "/revoke",
  redeem: "/api/v1/license-code-redemptions",
} as const;

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
