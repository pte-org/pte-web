import type { ApiClient } from "../../client/client";
import type {
  CreateQuestionTypeRequest,
  QuestionTypeResponse,
  SupportedQuestionTypeResponse,
  UpdateQuestionTypeRequest,
} from "../../types/questiontype";

export const QUESTION_TYPE_ENDPOINTS = {
  types: "/api/v1/question-types",
  type: (publicId: string) => `/api/v1/question-types/${publicId}`,
} as const;

export function listQuestionTypes(
  client: ApiClient,
  options: { activeOnly?: boolean } = {},
): Promise<QuestionTypeResponse[]> {
  const query = options.activeOnly ? "?activeOnly=true" : "";
  return client.request<QuestionTypeResponse[]>(`${QUESTION_TYPE_ENDPOINTS.types}${query}`);
}

export function listSupportedQuestionTypes(
  client: ApiClient,
): Promise<SupportedQuestionTypeResponse[]> {
  return client.request<SupportedQuestionTypeResponse[]>(
    `${QUESTION_TYPE_ENDPOINTS.types}/supported`,
  );
}

export function createQuestionType(
  client: ApiClient,
  payload: CreateQuestionTypeRequest,
): Promise<QuestionTypeResponse> {
  return client.request<QuestionTypeResponse>(QUESTION_TYPE_ENDPOINTS.types, {
    method: "POST",
    body: payload,
  });
}

export function getQuestionType(
  client: ApiClient,
  publicId: string,
): Promise<QuestionTypeResponse> {
  return client.request<QuestionTypeResponse>(QUESTION_TYPE_ENDPOINTS.type(publicId));
}

export function updateQuestionType(
  client: ApiClient,
  publicId: string,
  payload: UpdateQuestionTypeRequest,
): Promise<QuestionTypeResponse> {
  return client.request<QuestionTypeResponse>(QUESTION_TYPE_ENDPOINTS.type(publicId), {
    method: "PUT",
    body: payload,
  });
}

export function deleteQuestionType(client: ApiClient, publicId: string): Promise<void> {
  return client.request<void>(QUESTION_TYPE_ENDPOINTS.type(publicId), {
    method: "DELETE",
  });
}
