import type { ApiClient } from "../../client/client";
import type { AssignClassRequest, SessionClassAssignmentResponse } from "../../types/scheduling";

/** Matches `SessionClassAssignmentController`'s `@RequestMapping("/api/v1/sessions/{sessionPublicId}/classes")`. */
export const CLASS_ASSIGNMENT_ENDPOINTS = {
  classes: (sessionPublicId: string) => `/api/v1/sessions/${sessionPublicId}/classes`,
  class: (sessionPublicId: string, classPublicId: string) =>
    `/api/v1/sessions/${sessionPublicId}/classes/${classPublicId}`,
} as const;

export function listAssignedClasses(
  client: ApiClient,
  sessionPublicId: string,
): Promise<SessionClassAssignmentResponse[]> {
  return client.request<SessionClassAssignmentResponse[]>(
    CLASS_ASSIGNMENT_ENDPOINTS.classes(sessionPublicId),
  );
}

export function assignClass(
  client: ApiClient,
  sessionPublicId: string,
  payload: AssignClassRequest,
): Promise<SessionClassAssignmentResponse> {
  return client.request<SessionClassAssignmentResponse>(
    CLASS_ASSIGNMENT_ENDPOINTS.classes(sessionPublicId),
    {
      method: "POST",
      body: payload,
    },
  );
}

export function unassignClass(
  client: ApiClient,
  sessionPublicId: string,
  classPublicId: string,
): Promise<void> {
  return client.request<void>(CLASS_ASSIGNMENT_ENDPOINTS.class(sessionPublicId, classPublicId), {
    method: "DELETE",
  });
}
