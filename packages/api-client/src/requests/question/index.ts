import type { ApiClient } from "../../client/client";
import type { CreateQuestionRequest, QuestionResponse, UpdateQuestionRequest } from "../../types/question";

/**
 * `pte-api`'s Nginx edge (`deploy/nginx.local.conf`) forwards `/api/v1/*`
 * unchanged — controllers own the full `/api/v1` prefix themselves
 * (`QuestionController` maps `/api/v1/questions`), so this file's paths
 * must match the controller's `@RequestMapping` exactly, not a module name.
 */
export const QUESTION_ENDPOINTS = {
  questions: "/api/v1/questions",
  byId: (id: string) => `/api/v1/questions/${id}`,
  publish: (id: string) => `/api/v1/questions/${id}/publish`,
  archive: (id: string) => `/api/v1/questions/${id}/archive`,
  unarchive: (id: string) => `/api/v1/questions/${id}/unarchive`,
} as const;

/**
 * `QuestionController.list` (`services/authoring`) returns a plain
 * `List<QuestionResponse>` with no pagination and takes no query params —
 * unlike most other list endpoints in this repo, there is no `PagedResult`
 * envelope here to unwrap.
 */
export function listQuestions(client: ApiClient): Promise<QuestionResponse[]> {
  return client.request<QuestionResponse[]>(QUESTION_ENDPOINTS.questions);
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

export function publishQuestion(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.publish(id), {
    method: "POST",
  });
}

export function archiveQuestion(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.archive(id), {
    method: "POST",
  });
}

export function unarchiveQuestion(client: ApiClient, id: string): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_ENDPOINTS.unarchive(id), {
    method: "POST",
  });
}
