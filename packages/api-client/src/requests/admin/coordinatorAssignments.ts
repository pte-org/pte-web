import type { ApiClient } from "../../client/client";
import type { AssignCoordinatorRequest, ProgramCoordinatorAssignmentResponse } from "../../types/admin/assignment";

function basePath(organizationPublicId: string, programPublicId: string): string {
  return `/api/admin/organizations/${organizationPublicId}/programs/${programPublicId}/coordinators`;
}

export const COORDINATOR_ASSIGNMENT_ENDPOINTS = {
  coordinators: basePath,
  coordinator: (organizationPublicId: string, programPublicId: string, assignmentPublicId: string) =>
    `${basePath(organizationPublicId, programPublicId)}/${assignmentPublicId}`,
} as const;

export function listCoordinatorAssignments(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
): Promise<ProgramCoordinatorAssignmentResponse[]> {
  return client.request<ProgramCoordinatorAssignmentResponse[]>(
    COORDINATOR_ASSIGNMENT_ENDPOINTS.coordinators(organizationPublicId, programPublicId),
  );
}

export function assignCoordinator(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  payload: AssignCoordinatorRequest,
): Promise<ProgramCoordinatorAssignmentResponse> {
  return client.request<ProgramCoordinatorAssignmentResponse>(
    COORDINATOR_ASSIGNMENT_ENDPOINTS.coordinators(organizationPublicId, programPublicId),
    { method: "POST", body: payload },
  );
}

export function unassignCoordinator(
  client: ApiClient,
  organizationPublicId: string,
  programPublicId: string,
  assignmentPublicId: string,
): Promise<void> {
  return client.request<void>(
    COORDINATOR_ASSIGNMENT_ENDPOINTS.coordinator(organizationPublicId, programPublicId, assignmentPublicId),
    { method: "DELETE" },
  );
}
