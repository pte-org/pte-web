import type { ApiClient } from "../../client/client";
import type {
  ExaminerAttemptDetailResponse,
  ExaminerCommandResponse,
  ExaminerGradingIssueResponse,
  ExaminerGuidelinesResponse,
  ExaminerHistoryResponse,
  ExaminerQueueResponse,
  ExaminerQueueStatus,
  ExaminerScoreSubmissionResponse,
  ExaminerWorkspaceOverviewResponse,
  FinalizeExaminerWorkRequest,
  ReportGradingIssueRequest,
  ResolveGradingIssueRequest,
  SaveExaminerDraftRequest,
  StartExaminerWorkRequest,
  SubmitExaminerScoreRequest,
} from "../../types/scoring";

export const EXAMINER_WORK_ENDPOINTS = {
  queue: "/api/v1/examiner/work",
  overview: "/api/v1/examiner/work/overview",
  attempt: (sessionPublicId: string, attemptPublicId: string) =>
    `/api/v1/examiner/work/${sessionPublicId}/${attemptPublicId}`,
  start: (sessionPublicId: string, attemptPublicId: string) =>
    `/api/v1/examiner/work/${sessionPublicId}/${attemptPublicId}/start`,
  draft: (sessionPublicId: string, attemptPublicId: string, answerPublicId: string) =>
    `/api/v1/examiner/work/${sessionPublicId}/${attemptPublicId}/answers/${answerPublicId}/draft`,
  finalize: (sessionPublicId: string, attemptPublicId: string) =>
    `/api/v1/examiner/work/${sessionPublicId}/${attemptPublicId}/finalize`,
  command: (sessionPublicId: string, attemptPublicId: string, requestPublicId: string) =>
    `/api/v1/examiner/work/${sessionPublicId}/${attemptPublicId}/commands/${requestPublicId}`,
  history: (sessionPublicId: string, attemptPublicId: string) =>
    `/api/v1/examiner/work/${sessionPublicId}/${attemptPublicId}/history`,
  guidelines: (sessionPublicId: string, attemptPublicId: string) =>
    `/api/v1/examiner/work/${sessionPublicId}/${attemptPublicId}/guidelines`,
  issues: (sessionPublicId: string, attemptPublicId: string) =>
    `/api/v1/examiner/work/${sessionPublicId}/${attemptPublicId}/issues`,
  resolveIssue: (issuePublicId: string) =>
    `/api/v1/host/examiner/issues/${issuePublicId}/resolve`,
  score: (answerPublicId: string) => `/api/v1/examiner/work/answers/${answerPublicId}/score`,
} as const;

export function getExaminerWorkspaceOverview(
  client: ApiClient,
): Promise<ExaminerWorkspaceOverviewResponse> {
  return client.request<ExaminerWorkspaceOverviewResponse>(
    EXAMINER_WORK_ENDPOINTS.overview,
  );
}

export interface ListExaminerWorkParams {
  status?: ExaminerQueueStatus;
  sessionPublicId?: string;
  search?: string;
  sort?: string;
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
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined || params.page !== undefined) {
    query.set("size", String(params.size ?? 20));
  }
  const qs = query.toString();
  return client.request<ExaminerQueueResponse>(
    `${EXAMINER_WORK_ENDPOINTS.queue}${qs ? `?${qs}` : ""}`,
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

export function startExaminerWork(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
  payload: StartExaminerWorkRequest,
): Promise<ExaminerCommandResponse> {
  return client.request<ExaminerCommandResponse>(
    EXAMINER_WORK_ENDPOINTS.start(sessionPublicId, attemptPublicId),
    { method: "POST", body: payload },
  );
}

export function saveExaminerDraft(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
  answerPublicId: string,
  payload: SaveExaminerDraftRequest,
): Promise<ExaminerCommandResponse> {
  return client.request<ExaminerCommandResponse>(
    EXAMINER_WORK_ENDPOINTS.draft(sessionPublicId, attemptPublicId, answerPublicId),
    { method: "PUT", body: payload },
  );
}

export function finalizeExaminerWork(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
  payload: FinalizeExaminerWorkRequest,
): Promise<ExaminerCommandResponse> {
  return client.request<ExaminerCommandResponse>(
    EXAMINER_WORK_ENDPOINTS.finalize(sessionPublicId, attemptPublicId),
    { method: "POST", body: payload },
  );
}

export function getExaminerCommand(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
  requestPublicId: string,
): Promise<ExaminerCommandResponse> {
  return client.request<ExaminerCommandResponse>(
    EXAMINER_WORK_ENDPOINTS.command(sessionPublicId, attemptPublicId, requestPublicId),
  );
}

export function getExaminerHistory(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
  page = 0,
  size = 20,
): Promise<ExaminerHistoryResponse> {
  return client.request<ExaminerHistoryResponse>(
    `${EXAMINER_WORK_ENDPOINTS.history(sessionPublicId, attemptPublicId)}?page=${page}&size=${size}`,
  );
}

export function getExaminerGuidelines(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
): Promise<ExaminerGuidelinesResponse> {
  return client.request<ExaminerGuidelinesResponse>(
    EXAMINER_WORK_ENDPOINTS.guidelines(sessionPublicId, attemptPublicId),
  );
}

export function reportExaminerIssue(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
  payload: ReportGradingIssueRequest,
): Promise<ExaminerCommandResponse> {
  return client.request<ExaminerCommandResponse>(
    EXAMINER_WORK_ENDPOINTS.issues(sessionPublicId, attemptPublicId),
    { method: "POST", body: payload },
  );
}

export function getExaminerIssues(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
): Promise<ExaminerGradingIssueResponse[]> {
  return client.request<ExaminerGradingIssueResponse[]>(
    EXAMINER_WORK_ENDPOINTS.issues(sessionPublicId, attemptPublicId),
  );
}

export function resolveExaminerIssue(
  client: ApiClient,
  issuePublicId: string,
  payload: ResolveGradingIssueRequest,
): Promise<ExaminerGradingIssueResponse> {
  return client.request<ExaminerGradingIssueResponse>(
    EXAMINER_WORK_ENDPOINTS.resolveIssue(issuePublicId),
    { method: "POST", body: payload },
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
