import type { ApiClient } from "../../client/client";
import type { AssignProctorRequest, ProctorAssignmentResponse } from "../../types/scheduling";

export const PROCTOR_ASSIGNMENT_ENDPOINTS = {
  assignments: (sessionPublicId: string) => `/api/scheduling/sessions/${sessionPublicId}/proctors`,
  assignment: (sessionPublicId: string, assignmentPublicId: string) =>
    `/api/scheduling/sessions/${sessionPublicId}/proctors/${assignmentPublicId}`,
} as const;

export function assignProctor(
  client: ApiClient,
  sessionPublicId: string,
  payload: AssignProctorRequest,
): Promise<ProctorAssignmentResponse> {
  return client.request<ProctorAssignmentResponse>(PROCTOR_ASSIGNMENT_ENDPOINTS.assignments(sessionPublicId), {
    method: "POST",
    body: payload,
  });
}

export function listProctorAssignments(
  client: ApiClient,
  sessionPublicId: string,
): Promise<ProctorAssignmentResponse[]> {
  return client.request<ProctorAssignmentResponse[]>(PROCTOR_ASSIGNMENT_ENDPOINTS.assignments(sessionPublicId));
}

export function unassignProctor(
  client: ApiClient,
  sessionPublicId: string,
  assignmentPublicId: string,
): Promise<void> {
  return client.request<void>(PROCTOR_ASSIGNMENT_ENDPOINTS.assignment(sessionPublicId, assignmentPublicId), {
    method: "DELETE",
  });
}
