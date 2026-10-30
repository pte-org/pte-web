import type { ApiClient } from "../../client/client";
import type {
  LicenseGrantPreviewRequest,
  LicenseGrantPreviewResponse,
  LicenseGrantRequest,
  LicenseGrantResponse,
} from "../../types/billing";

export const LICENSE_GRANT_ENDPOINTS = {
  grant: "/api/v1/admin/license-grants",
  preview: "/api/v1/admin/license-grants/preview",
} as const;

/** Read-only: what the grant would create, plus the organization's current hosts. */
export function previewLicenseGrant(
  client: ApiClient,
  payload: LicenseGrantPreviewRequest,
): Promise<LicenseGrantPreviewResponse> {
  return client.request(LICENSE_GRANT_ENDPOINTS.preview, { method: "POST", body: payload });
}

/** Grants and activates in one request; reuse the same key when retrying the same grant. */
export function grantLicense(
  client: ApiClient,
  payload: LicenseGrantRequest,
  idempotencyKey: string,
): Promise<LicenseGrantResponse> {
  return client.request(LICENSE_GRANT_ENDPOINTS.grant, {
    method: "POST", body: payload, headers: { "Idempotency-Key": idempotencyKey },
  });
}
