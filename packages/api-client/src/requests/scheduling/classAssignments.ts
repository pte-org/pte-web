import type { ApiClient } from "../../client/client";
import type { AssignClassRequest, SessionClassAssignmentResponse } from "../../types/scheduling";

/** `/api/scheduling` prefix required by `pte-api/deploy/api-routes.caddy` — see requests/question/index.ts's identical note. */
export const CLASS_ASSIGNMENT_ENDPOINTS = {
  classes: (sessionPublicId: string) => `/api/scheduling/sessions/${sessionPublicId}/classes`,
  class: (sessionPublicId: string, classPublicId: string) =>
    `/api/scheduling/sessions/${sessionPublicId}/classes/${classPublicId}`,
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
