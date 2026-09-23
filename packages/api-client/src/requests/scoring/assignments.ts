import type { ApiClient } from "../../client/client";
import type {
  CreateExaminerAssignmentPreviewRequest,
  ExaminerAssignmentOverviewResponse,
  ExaminerAssignmentPreviewResponse,
} from "../../types/scoring";

export const EXAMINER_ASSIGNMENT_ENDPOINTS = {
  overview: (sessionPublicId: string, page = 0, size = 20) =>
    `/api/v1/sessions/${sessionPublicId}/examiner-assignments?page=${page}&size=${size}`,
  previews: (sessionPublicId: string) =>
    `/api/v1/sessions/${sessionPublicId}/examiner-assignments/previews`,
  confirm: (sessionPublicId: string, batchPublicId: string) =>
    `/api/v1/sessions/${sessionPublicId}/examiner-assignments/${batchPublicId}/confirm`,
} as const;

export function getExaminerAssignmentOverview(
  client: ApiClient,
  sessionPublicId: string,
  page = 0,
  size = 20,
): Promise<ExaminerAssignmentOverviewResponse> {
  return client.request<ExaminerAssignmentOverviewResponse>(
    EXAMINER_ASSIGNMENT_ENDPOINTS.overview(sessionPublicId, page, size),
  );
}

export function createExaminerAssignmentPreview(
  client: ApiClient,
  sessionPublicId: string,
  payload: CreateExaminerAssignmentPreviewRequest,
): Promise<ExaminerAssignmentPreviewResponse> {
  return client.request<ExaminerAssignmentPreviewResponse>(
    EXAMINER_ASSIGNMENT_ENDPOINTS.previews(sessionPublicId),
    { method: "POST", body: payload },
  );
}

export function confirmExaminerAssignmentPreview(
  client: ApiClient,
  sessionPublicId: string,
  batchPublicId: string,
): Promise<ExaminerAssignmentPreviewResponse> {
  return client.request<ExaminerAssignmentPreviewResponse>(
    EXAMINER_ASSIGNMENT_ENDPOINTS.confirm(sessionPublicId, batchPublicId),
    { method: "POST" },
  );
}
