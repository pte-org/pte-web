import type { ApiClient } from "../../client/client";
import type {
  AnswerListResponse,
  AnswerReviewDetailResponse,
  ScoringAnswerResponse,
  SubmitTeacherScoreRequest,
} from "../../types/scoring";

export const SCORING_ANSWER_ENDPOINTS = {
  answers: "/api/scoring/answers",
  answer: (publicId: string) => `/api/scoring/answers/${publicId}`,
  teacherScore: (publicId: string) => `/api/scoring/answers/${publicId}/teacher-score`,
} as const;

export interface ListAnswersParams {
  sessionPublicId?: string;
  status?: string;
  page?: number;
  size?: number;
}

export function listAnswers(
  client: ApiClient,
  params: ListAnswersParams = {},
): Promise<AnswerListResponse> {
  const query = new URLSearchParams();
  if (params.sessionPublicId) query.set("sessionPublicId", params.sessionPublicId);
  if (params.status) query.set("status", params.status);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();
  return client.request<AnswerListResponse>(
    `${SCORING_ANSWER_ENDPOINTS.answers}${qs ? `?${qs}` : ""}`,
  );
}

export function getAnswer(client: ApiClient, publicId: string): Promise<AnswerReviewDetailResponse> {
  return client.request<AnswerReviewDetailResponse>(SCORING_ANSWER_ENDPOINTS.answer(publicId));
}

export function submitTeacherScore(
  client: ApiClient,
  publicId: string,
  payload: SubmitTeacherScoreRequest,
): Promise<ScoringAnswerResponse> {
  return client.request<ScoringAnswerResponse>(SCORING_ANSWER_ENDPOINTS.teacherScore(publicId), {
    method: "POST",
    body: payload,
  });
}
