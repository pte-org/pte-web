import type { ApiClient } from "../../client/client";
import type {
  ExaminerAttemptDetailResponse,
  ExaminerQueueResponse,
  ExaminerQueueStatus,
  ExaminerScoreSubmissionResponse,
  SubmitExaminerScoreRequest,
} from "../../types/scoring";

export const EXAMINER_WORK_ENDPOINTS = {
  queue: "/api/v1/examiner/work",
  attempt: (sessionPublicId: string, attemptPublicId: string) =>
    `/api/v1/examiner/work/${sessionPublicId}/${attemptPublicId}`,
  score: (answerPublicId: string) => `/api/v1/examiner/work/answers/${answerPublicId}/score`,
} as const;

export interface ListExaminerWorkParams {
  status?: ExaminerQueueStatus;
  sessionPublicId?: string;
  page?: number;
  size?: number;
}

export function listExaminerWork(
  client: ApiClient,
  params: ListExaminerWorkParams = {},
): Promise<ExaminerQueueResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.sessionPublicId) query.set("sessionPublicId", params.sessionPublicId);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined || params.page !== undefined) {
    query.set("size", String(params.size ?? 20));
  }
  const search = query.toString();
  return client.request<ExaminerQueueResponse>(
    `${EXAMINER_WORK_ENDPOINTS.queue}${search ? `?${search}` : ""}`,
  );
}

export function getExaminerAttemptWork(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
): Promise<ExaminerAttemptDetailResponse> {
  return client.request<ExaminerAttemptDetailResponse>(
    EXAMINER_WORK_ENDPOINTS.attempt(sessionPublicId, attemptPublicId),
  );
}

export function submitExaminerScore(
  client: ApiClient,
  answerPublicId: string,
  payload: SubmitExaminerScoreRequest,
): Promise<ExaminerScoreSubmissionResponse> {
  return client.request<ExaminerScoreSubmissionResponse>(
    EXAMINER_WORK_ENDPOINTS.score(answerPublicId),
    { method: "POST", body: payload },
  );
}
