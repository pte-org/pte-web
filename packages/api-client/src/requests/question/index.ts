import { DEFAULT_PAGE_SIZE, type ApiClient, type PagedResult } from "../../client/client";
import type {
  CreateQuestionRequest,
  QuestionFilters,
  QuestionResponse,
  QuestionStatsResponse,
  UpdateQuestionRequest,
} from "../../types/question";

/**
 * `pte-api`'s Nginx edge (`deploy/nginx.local.conf`) forwards `/api/v1/*`
 * unchanged — controllers own the full `/api/v1` prefix themselves
 * (`QuestionController` maps `/api/v1/questions`), so this file's paths
 * must match the controller's `@RequestMapping` exactly, not a module name.
 */
export const QUESTION_ENDPOINTS = {
  questions: "/api/v1/questions",
  stats: "/api/v1/questions/stats",
  byId: (id: string) => `/api/v1/questions/${id}`,
  edit: (id: string) => `/api/v1/questions/${id}/edit`,
  status: (id: string) => `/api/v1/questions/${id}/status`,
} as const;

/**
 * `QuestionController.list` returns the common `PagedResult` envelope. Filters
 * are applied before pagination so changing a filter also resets the result
 * count used by the shared pagination controls.
 */
export function listQuestions(
  client: ApiClient,
  filters: QuestionFilters = {},
  page = 0,
  size = DEFAULT_PAGE_SIZE,
): Promise<PagedResult<QuestionResponse>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (filters.taskType) params.set("taskType", filters.taskType);
  if (filters.section) params.set("section", filters.section);
  if (filters.status) params.set("status", filters.status);
  if (filters.pool) params.set("pool", filters.pool);
  if (filters.q) params.set("q", filters.q);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return client.request<PagedResult<QuestionResponse>>(`${QUESTION_ENDPOINTS.questions}${suffix}`);
}

export function getQuestionStats(client: ApiClient): Promise<QuestionStatsResponse> {
  return client.request<QuestionStatsResponse>(QUESTION_ENDPOINTS.stats);
}

export function getQuestion(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.byId(id));
}

export function createQuestion(
  client: ApiClient,
  payload: CreateQuestionRequest,
): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.questions, {
    method: "POST",
    body: payload,
  });
}

export function updateQuestion(
  client: ApiClient,
  id: string,
  payload: UpdateQuestionRequest,
): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.byId(id), {
    method: "PUT",
    body: payload,
  });
}

export function deleteQuestion(client: ApiClient, id: string): Promise<void> {
  return client.request<void>(QUESTION_ENDPOINTS.byId(id), {
    method: "DELETE",
  });
}

export function createQuestionRevision(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.edit(id), { method: "POST" });
}

export function submitQuestionApproval(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.status(id), { method: "PATCH", body: { action: "SUBMIT_APPROVAL" }, });
}

export function approveQuestion(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.status(id), { method: "PATCH", body: { action: "APPROVE" }, });
}

export function rejectQuestion(client: ApiClient, id: string, reason: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.status(id), {
    method: "PATCH",
    body: { action: "REJECT", reason },
  });
}

export function publishQuestion(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.status(id), {
    method: "PATCH", body: { action: "PUBLISH" },
  });
}

export function archiveQuestion(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.status(id), {
    method: "PATCH", body: { action: "ARCHIVE" },
  });
}

export function unarchiveQuestion(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.status(id), {
    method: "PATCH", body: { action: "UNARCHIVE" },
  });
}
