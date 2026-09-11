import type { ApiClient } from "../../client/client";
import type { AssignLecturerRequest, LecturerAssignmentResponse } from "../../types/admin/assignment";

function basePath(organizationPublicId: string, programPublicId: string, classPublicId: string): string {
  return `/api/admin/organizations/${organizationPublicId}/programs/${programPublicId}/classes/${classPublicId}/lecturers`;
}

export const LECTURER_ASSIGNMENT_ENDPOINTS = {
  lecturers: basePath,
  lecturer: (organizationPublicId: string, programPublicId: string, classPublicId: string, assignmentPublicId: string) =>
    `${basePath(organizationPublicId, programPublicId, classPublicId)}/${assignmentPublicId}`,
} as const;

export function listLecturerAssignments(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): Promise<LecturerAssignmentResponse[]> {
  return client.request<LecturerAssignmentResponse[]>(
    LECTURER_ASSIGNMENT_ENDPOINTS.lecturers(organizationPublicId, programPublicId, classPublicId),
  );
}

export function assignLecturer(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
  payload: AssignLecturerRequest,
): Promise<LecturerAssignmentResponse> {
  return client.request<LecturerAssignmentResponse>(
    LECTURER_ASSIGNMENT_ENDPOINTS.lecturers(organizationPublicId, programPublicId, classPublicId),
    { method: "POST", body: payload },
  );
}

export function unassignLecturer(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
  assignmentPublicId: string,
): Promise<void> {
  return client.request<void>(
    LECTURER_ASSIGNMENT_ENDPOINTS.lecturer(organizationPublicId, programPublicId, classPublicId, assignmentPublicId),
    { method: "DELETE" },
  );
}
