import type { ApiClient } from "../../client/client";
import type {
  HostScoreReviewResponse,
  ScoreSourceAuditResponse,
  ScoreSourceSelectionPreviewResponse,
  ScoreSourceSelectionResultResponse,
  SelectScoreSourceRequest,
} from "../../types/scoring";

export const SCORE_REVIEW_ENDPOINTS = {
  review: (sessionPublicId: string) => `/api/v1/scoring/sessions/${sessionPublicId}/review`,
  preview: (sessionPublicId: string) =>
    `/api/v1/scoring/sessions/${sessionPublicId}/source-selection/preview`,
  apply: (sessionPublicId: string) =>
    `/api/v1/scoring/sessions/${sessionPublicId}/source-selection/apply`,
  audits: (sessionPublicId: string) =>
    `/api/v1/scoring/sessions/${sessionPublicId}/source-selection/audits`,
} as const;

export function getHostScoreReview(client: ApiClient, sessionPublicId: string): Promise<HostScoreReviewResponse> {
  return client.request<HostScoreReviewResponse>(SCORE_REVIEW_ENDPOINTS.review(sessionPublicId));
}

export function previewScoreSourceSelection(
  client: ApiClient,
  sessionPublicId: string,
  payload: SelectScoreSourceRequest,
): Promise<ScoreSourceSelectionPreviewResponse> {
  return client.request<ScoreSourceSelectionPreviewResponse>(SCORE_REVIEW_ENDPOINTS.preview(sessionPublicId), {
    method: "POST",
    body: payload,
  });
}

export function applyScoreSourceSelection(
  client: ApiClient,
  sessionPublicId: string,
  payload: SelectScoreSourceRequest,
): Promise<ScoreSourceSelectionResultResponse> {
  return client.request<ScoreSourceSelectionResultResponse>(SCORE_REVIEW_ENDPOINTS.apply(sessionPublicId), {
    method: "POST",
    body: payload,
  });
}

export function getScoreSourceSelectionAudits(
  client: ApiClient,
  sessionPublicId: string,
): Promise<ScoreSourceAuditResponse[]> {
  return client.request<ScoreSourceAuditResponse[]>(SCORE_REVIEW_ENDPOINTS.audits(sessionPublicId));
}
