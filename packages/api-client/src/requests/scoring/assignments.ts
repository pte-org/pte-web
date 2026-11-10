import type { ApiClient } from "../../client/client";
import type {
  CommitExaminerAssignmentRequest,
  ExaminerAssignmentRosterResponse,
  ReassignExaminerRequest,
} from "../../types/scoring";

export const EXAMINER_ASSIGNMENT_ENDPOINTS = {
  roster: (sessionPublicId: string) =>
    `/api/v1/sessions/${sessionPublicId}/examiner-assignments/roster`,
  commit: (sessionPublicId: string) =>
    `/api/v1/sessions/${sessionPublicId}/examiner-assignments/commit`,
  reassign: (sessionPublicId: string, attemptPublicId: string) =>
    `/api/v1/sessions/${sessionPublicId}/examiner-assignments/attempts/${attemptPublicId}/reassign`,
} as const;

export function getExaminerAssignmentRoster(
  client: ApiClient,
  sessionPublicId: string,
): Promise<ExaminerAssignmentRosterResponse> {
  return client.request<ExaminerAssignmentRosterResponse>(
    EXAMINER_ASSIGNMENT_ENDPOINTS.roster(sessionPublicId),
  );
}

export function commitExaminerAssignment(
  client: ApiClient,
  sessionPublicId: string,
  payload: CommitExaminerAssignmentRequest,
): Promise<ExaminerAssignmentRosterResponse> {
  return client.request<ExaminerAssignmentRosterResponse>(
    EXAMINER_ASSIGNMENT_ENDPOINTS.commit(sessionPublicId),
    { method: "POST", body: payload },
  );
}

export function reassignExaminer(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
  payload: ReassignExaminerRequest,
): Promise<ExaminerAssignmentRosterResponse> {
  return client.request<ExaminerAssignmentRosterResponse>(
    EXAMINER_ASSIGNMENT_ENDPOINTS.reassign(sessionPublicId, attemptPublicId),
    { method: "POST", body: payload },
  );
}
