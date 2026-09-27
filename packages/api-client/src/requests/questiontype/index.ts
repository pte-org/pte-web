import type { ApiClient } from "../../client/client";
import type {
  CreateQuestionTypeRequest,
  QuestionTypeResponse,
  SupportedQuestionTypeResponse,
  UpdateQuestionTypeRequest,
  UpdateTaskTypeRequest,
  CreateTaskTypeRequest,
  TaskTypeCapabilityResponse,
  TaskTypeAvailabilityResponse,
  TaskTypePageResponse,
} from "../../types/questiontype";

export const QUESTION_TYPE_ENDPOINTS = {
  types: "/api/v1/question-types",
  type: (publicId: string) => `/api/v1/question-types/${publicId}`,
} as const;

/** Canonical dynamic catalog. The old question-types route remains a standard-only adapter. */
export const TASK_TYPE_ENDPOINTS = {
  types: "/api/v1/task-types",
  type: (publicId: string) => `/api/v1/task-types/${publicId}`,
  capabilities: "/api/v1/task-types/capabilities",
  availability: "/api/v1/task-types/availability",
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

/** Terminology alias retained for callers migrating from question-type naming. */
export function listSupportedTaskTypes(
  client: ApiClient,
): Promise<SupportedQuestionTypeResponse[]> {
  return listSupportedQuestionTypes(client);
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

export async function listTaskTypes(
  client: ApiClient,
  options: { activeOnly?: boolean } = {},
): Promise<QuestionTypeResponse[]> {
  const query = new URLSearchParams({
    activeOnly: String(options.activeOnly ?? true),
  });
  const response = await client.request<TaskTypePageResponse>(
    `${TASK_TYPE_ENDPOINTS.types}?${query.toString()}`,
  );
  return Array.isArray(response) ? response : response.items;
}

export function listTaskTypeCapabilities(
  client: ApiClient,
  options: { activeOnly?: boolean } = {},
): Promise<TaskTypeCapabilityResponse[]> {
  const query = options.activeOnly === undefined ? "" : `?activeOnly=${options.activeOnly}`;
  return client.request<TaskTypeCapabilityResponse[]>(
    `${TASK_TYPE_ENDPOINTS.capabilities}${query}`,
  );
}

export function getTaskTypeAvailability(
  client: ApiClient,
  params: { taskTypeKey?: string; displayName?: string; excludePublicId?: string } = {},
): Promise<TaskTypeAvailabilityResponse> {
  const query = new URLSearchParams();
  if (params.taskTypeKey) query.set("taskTypeKey", params.taskTypeKey);
  if (params.displayName) query.set("displayName", params.displayName);
  if (params.excludePublicId) query.set("excludePublicId", params.excludePublicId);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return client.request<TaskTypeAvailabilityResponse>(`${TASK_TYPE_ENDPOINTS.availability}${suffix}`);
}

export function createTaskType(
  client: ApiClient,
  payload: CreateTaskTypeRequest,
): Promise<QuestionTypeResponse> {
  return client.request<QuestionTypeResponse>(TASK_TYPE_ENDPOINTS.types, {
    method: "POST",
    body: payload,
  });
}

export function getTaskType(client: ApiClient, publicId: string): Promise<QuestionTypeResponse> {
  return client.request<QuestionTypeResponse>(TASK_TYPE_ENDPOINTS.type(publicId));
}

export function updateTaskType(
  client: ApiClient,
  publicId: string,
  payload: UpdateTaskTypeRequest,
): Promise<QuestionTypeResponse> {
  return client.request<QuestionTypeResponse>(TASK_TYPE_ENDPOINTS.type(publicId), {
    method: "PUT",
    body: payload,
  });
}

export function deleteTaskType(client: ApiClient, publicId: string): Promise<void> {
  return client.request<void>(TASK_TYPE_ENDPOINTS.type(publicId), { method: "DELETE" });
}
