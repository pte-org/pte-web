import type { ApiClient } from "../../client/client";
import type { StudentEnrollmentResponse } from "../../types/scheduling";

export const STUDENT_ENROLLMENT_ENDPOINTS = {
  enrollments: (studentPublicId: string) => `/api/scheduling/students/${studentPublicId}/enrollments`,
} as const;

/**
 * A student's enrollment history across sessions, tenant-scoped server-side.
 * Consumed by `admin`'s (FE's) Class-transfer flow to surface a
 * pending-exam-request warning — read-only, never blocks the transfer.
 */
export function listStudentEnrollments(
  client: ApiClient,
  studentPublicId: string,
): Promise<StudentEnrollmentResponse[]> {
  return client.request<StudentEnrollmentResponse[]>(
    STUDENT_ENROLLMENT_ENDPOINTS.enrollments(studentPublicId),
  );
}
