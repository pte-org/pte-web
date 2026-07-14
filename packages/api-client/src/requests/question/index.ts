import type { ApiClient, PagedResult } from "../../client/client";
import type {
  CreateQuestionRequest,
  QuestionFilters,
  QuestionResponse,
  UpdateQuestionRequest,
} from "../../types/question";

export const QUESTION_ENDPOINTS = {
  questions: "/api/v1/questions",
  byId: (id: string) => `/api/v1/questions/${id}`,
} as const;

function toQueryString(filters: QuestionFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listQuestions(
  client: ApiClient,
  filters?: QuestionFilters,
): Promise<PagedResult<QuestionResponse>> {
  return client.request<PagedResult<QuestionResponse>>(
    `${QUESTION_ENDPOINTS.questions}${toQueryString(filters)}`,
  );
}

export function getQuestion(
  client: ApiClient,
  id: string,
): Promise<QuestionResponse> {
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
