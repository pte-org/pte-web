import type { ApiClient } from "../../client/client";
import type { BulkEnrollRequest, BulkEnrollResponse, EnrollmentResponse } from "../../types/scheduling";

export const ENROLLMENT_ENDPOINTS = {
  enrollments: (sessionPublicId: string) => `/api/scheduling/sessions/${sessionPublicId}/enrollments`,
  bulk: (sessionPublicId: string) => `/api/scheduling/sessions/${sessionPublicId}/enrollments/bulk`,
  enrollment: (sessionPublicId: string, enrollmentPublicId: string) =>
    `/api/scheduling/sessions/${sessionPublicId}/enrollments/${enrollmentPublicId}`,
} as const;

export function enrollStudent(
  client: ApiClient,
  sessionPublicId: string,
  studentPublicId: string,
): Promise<EnrollmentResponse> {
  return client.request<EnrollmentResponse>(ENROLLMENT_ENDPOINTS.enrollments(sessionPublicId), {
    method: "POST",
    body: { studentPublicId },
  });
}

export function bulkEnroll(
  client: ApiClient,
  sessionPublicId: string,
  payload: BulkEnrollRequest,
): Promise<BulkEnrollResponse> {
  return client.request<BulkEnrollResponse>(ENROLLMENT_ENDPOINTS.bulk(sessionPublicId), {
    method: "POST",
    body: payload,
  });
}

export function listEnrollments(
  client: ApiClient,
  sessionPublicId: string,
): Promise<EnrollmentResponse[]> {
  return client.request<EnrollmentResponse[]>(ENROLLMENT_ENDPOINTS.enrollments(sessionPublicId));
}

export function unenroll(
  client: ApiClient,
  sessionPublicId: string,
  enrollmentPublicId: string,
): Promise<void> {
  return client.request<void>(ENROLLMENT_ENDPOINTS.enrollment(sessionPublicId, enrollmentPublicId), {
    method: "DELETE",
  });
}
