import { type ApiClient, type PagedResult } from "../client/client";
import type {
  QuestionGenerationJobCreateRequest,
  QuestionGenerationJobResponse,
  QuestionGenerationJobStatusRequest,
  QuestionGenerationQuotaResponse,
  QuestionGenerationTaskTypeResponse,
} from "../types/generation";

export const QUESTION_GENERATION_ENDPOINTS = {
  jobs: "/api/v1/question-generation/jobs",
  jobById: (id: string) => `/api/v1/question-generation/jobs/${id}`,
  jobStatus: (id: string) => `/api/v1/question-generation/jobs/${id}/status`,
  taskTypes: "/api/v1/question-generation/task-types",
  quota: "/api/v1/question-generation/quota",
} as const;

export function createQuestionGenerationJob(
  client: ApiClient,
  payload: QuestionGenerationJobCreateRequest,
): Promise<QuestionGenerationJobResponse> {
  return client.request<QuestionGenerationJobResponse>(QUESTION_GENERATION_ENDPOINTS.jobs, {
    method: "POST",
    body: payload,
  });
}

export function getQuestionGenerationJob(
  client: ApiClient,
  id: string,
): Promise<QuestionGenerationJobResponse> {
  return client.request<QuestionGenerationJobResponse>(QUESTION_GENERATION_ENDPOINTS.jobById(id));
}

export function listQuestionGenerationJobs(
  client: ApiClient,
  page = 0,
  size = 10,
): Promise<PagedResult<QuestionGenerationJobResponse>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return client.request<PagedResult<QuestionGenerationJobResponse>>(
    `${QUESTION_GENERATION_ENDPOINTS.jobs}${suffix}`,
  );
}

export function updateQuestionGenerationJobStatus(
  client: ApiClient,
  id: string,
  payload: QuestionGenerationJobStatusRequest,
): Promise<QuestionGenerationJobResponse> {
  return client.request<QuestionGenerationJobResponse>(QUESTION_GENERATION_ENDPOINTS.jobStatus(id), {
    method: "PATCH",
    body: payload,
  });
}

export function getQuestionGenerationTaskTypes(
  client: ApiClient,
): Promise<QuestionGenerationTaskTypeResponse[]> {
  return client.request<QuestionGenerationTaskTypeResponse[]>(QUESTION_GENERATION_ENDPOINTS.taskTypes);
}

export function getQuestionGenerationQuota(
  client: ApiClient,
): Promise<QuestionGenerationQuotaResponse> {
  return client.request<QuestionGenerationQuotaResponse>(QUESTION_GENERATION_ENDPOINTS.quota);
}
