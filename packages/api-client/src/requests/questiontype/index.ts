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

/** New catalog terminology; the wire endpoint intentionally stays unchanged. */
export const TASK_TYPE_ENDPOINTS = QUESTION_TYPE_ENDPOINTS;

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

/**
 * Compatibility adapters for new callers. Keep the question-type functions
 * above because tenant/question-bank clients still import them directly.
 */
export const listTaskTypes = listQuestionTypes;
export const listSupportedTaskTypes = listSupportedQuestionTypes;
export const createTaskType = createQuestionType;
export const getTaskType = getQuestionType;
export const updateTaskType = updateQuestionType;
export const deleteTaskType = deleteQuestionType;
