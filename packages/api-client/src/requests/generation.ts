import { type ApiClient, type PagedResult } from "../client/client";
import { readServerSentEvents } from "../client/serverSentEvents";
import type {
  QuestionGenerationJobCreateRequest,
  QuestionGenerationJobResponse,
  QuestionGenerationJobStatusRequest,
  QuestionGenerationLiveEvent,
  QuestionGenerationQuotaResponse,
  QuestionGenerationTaskTypeResponse,
} from "../types/generation";

export const QUESTION_GENERATION_ENDPOINTS = {
  jobs: "/api/v1/question-generation/jobs",
  jobById: (id: string) => `/api/v1/question-generation/jobs/${id}`,
  jobStatus: (id: string) => `/api/v1/question-generation/jobs/${id}/status`,
  jobLive: (id: string) => `/api/v1/question-generation/jobs/${id}/live`,
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

const LIVE_EVENT_TYPES: ReadonlySet<string> = new Set([
  "snapshot", "begin", "token", "stage", "media", "draft", "review", "item", "end",
]);
// An unknown job or a missing permission answers with the usual JSON error instead of a stream.
const LIVE_ACCEPT = "text/event-stream, application/json";

/**
 * Follows what the agents write for a job until the server ends the stream or `signal` aborts it. Each event is
 * handed to `onEvent` with its name as `type`; events of other names (a newer server) are skipped.
 */
export async function followQuestionGenerationJob(
  client: ApiClient,
  id: string,
  onEvent: (event: QuestionGenerationLiveEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const stream = await client.openStream(QUESTION_GENERATION_ENDPOINTS.jobLive(id), {
    headers: { Accept: LIVE_ACCEPT },
    signal,
  });
  await readServerSentEvents(stream, ({ name, data }) => {
    if (!LIVE_EVENT_TYPES.has(name)) return;
    // The server sends one JSON object per event, shaped by its name (see QuestionGenerationLiveEvent).
    const payload = JSON.parse(data) as Record<string, unknown>;
    onEvent({ ...payload, type: name } as QuestionGenerationLiveEvent);
  });
}
