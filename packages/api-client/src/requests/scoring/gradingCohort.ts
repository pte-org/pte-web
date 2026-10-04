import type { ApiClient } from "../../client/client";
import type {
  FinalizeGradingCohortRequest,
  GradingCohortPreviewResponse,
  GradingCohortResponse,
} from "../../types/scoring";

export const GRADING_COHORT_ENDPOINTS = {
  preview: (sessionPublicId: string) =>
    `/api/v1/scoring/sessions/${sessionPublicId}/grading-cohort/preview`,
  finalize: (sessionPublicId: string) =>
    `/api/v1/scoring/sessions/${sessionPublicId}/grading-cohort/finalize`,
} as const;

export function getGradingCohortPreview(
  client: ApiClient,
  sessionPublicId: string,
): Promise<GradingCohortPreviewResponse> {
  return client.request<GradingCohortPreviewResponse>(
    GRADING_COHORT_ENDPOINTS.preview(sessionPublicId),
  );
}

export function finalizeGradingCohort(
  client: ApiClient,
  sessionPublicId: string,
  payload: FinalizeGradingCohortRequest,
): Promise<GradingCohortResponse> {
  return client.request<GradingCohortResponse>(GRADING_COHORT_ENDPOINTS.finalize(sessionPublicId), {
    method: "POST",
    body: payload,
  });
}
