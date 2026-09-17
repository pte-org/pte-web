import type { ApiClient } from "../../client/client";
import type { CreateQuestionRequest, QuestionResponse, UpdateQuestionRequest } from "../../types/question";

export const QUESTION_ENDPOINTS = {
  questions: "/api/questions",
  byId: (id: string) => `/api/questions/${id}`,
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
