import type { ApiClient } from "../../client/client";
import type { StudentImportPreviewRequest, StudentQuotaResponse } from "../../types/billing";

export const STUDENT_QUOTA_ENDPOINTS = {
  quota: "/api/v1/tenant/quota",
  importPreview: "/api/v1/students/import/preview",
} as const;

export function getStudentQuota(client: ApiClient): Promise<StudentQuotaResponse> {
  return client.request(STUDENT_QUOTA_ENDPOINTS.quota);
}

export function previewStudentImport(
  client: ApiClient,
  payload: StudentImportPreviewRequest,
): Promise<StudentQuotaResponse> {
  return client.request(STUDENT_QUOTA_ENDPOINTS.importPreview, { method: "POST", body: payload });
}
