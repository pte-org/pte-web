import type { ApiClient } from "../../client/client";
import type { ScoreExplanationResponse } from "../../types/scoreexplanation";

/**
 * Matches `ScoreExplanationController` (`/api/v1/reports` + `/attempts/{attemptPublicId}/score-explanation`).
 * Only a Host (own tenant) or an Examiner assigned to the attempt may read it; anything else is 403 or 404.
 * There is deliberately no parameter to pick another rubric version: the server always uses the pinned one.
 */
export const SCORE_EXPLANATION_ENDPOINTS = {
  attempt: (attemptPublicId: string) =>
    `/api/v1/reports/attempts/${encodeURIComponent(attemptPublicId)}/score-explanation`,
} as const;

export function getScoreExplanation(
  client: ApiClient,
  attemptPublicId: string,
): Promise<ScoreExplanationResponse> {
  return client.request<ScoreExplanationResponse>(
    SCORE_EXPLANATION_ENDPOINTS.attempt(attemptPublicId),
  );
}
