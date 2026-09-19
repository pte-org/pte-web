import type { ApiClient } from "../../client/client";
import type {
  ImportQuestionTypesFromScoreTemplateRequest,
  QuestionTypeResponse,
  UpdateQuestionTypeRequest,
} from "../../types/questiontype";

export const QUESTION_TYPE_ENDPOINTS = {
  types: "/api/v1/question-types",
  importFromScoreTemplate: "/api/v1/question-types/import/score-template",
  type: (publicId: string) => `/api/v1/question-types/${publicId}`,
} as const;

export function listQuestionTypes(
  client: ApiClient,
  options: { activeOnly?: boolean } = {},
): Promise<QuestionTypeResponse[]> {
  const query = options.activeOnly ? "?activeOnly=true" : "";
  return client.request<QuestionTypeResponse[]>(`${QUESTION_TYPE_ENDPOINTS.types}${query}`);
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

export function importQuestionTypesFromScoreTemplate(
  client: ApiClient,
  payload: ImportQuestionTypesFromScoreTemplateRequest,
): Promise<QuestionTypeResponse[]> {
  return client.request<QuestionTypeResponse[]>(QUESTION_TYPE_ENDPOINTS.importFromScoreTemplate, {
    method: "POST",
    body: payload,
  });
}
