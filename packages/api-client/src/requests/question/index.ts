import type { ApiClient } from "../../client/client";
import type { CreateQuestionRequest, QuestionResponse, UpdateQuestionRequest } from "../../types/question";

/**
 * `/api/authoring` is NOT stale — `pte-api/deploy/api-routes.caddy` strips
 * this exact prefix before forwarding to the monolith's bare `/questions`
 * mapping, and both vendor-web/tenant-web's `API_BASE_URL` default
 * (`http://localhost:8080`) and `pte-app`'s `AppConfig.gatewayBaseUrl`
 * point at that Caddy instance, not at the app directly. Every other
 * module's request file (`auth`, `scheduling`, `scoring`, ...) keeps the
 * same `/api/{module}` convention for the same reason.
 */
export const QUESTION_ENDPOINTS = {
  questions: "/api/authoring/questions",
  byId: (id: string) => `/api/authoring/questions/${id}`,
  publish: (id: string) => `/api/authoring/questions/${id}/publish`,
  archive: (id: string) => `/api/authoring/questions/${id}/archive`,
  unarchive: (id: string) => `/api/authoring/questions/${id}/unarchive`,
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
