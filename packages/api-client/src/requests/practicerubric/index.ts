import { DEFAULT_PAGE_SIZE, type ApiClient, type PagedResult } from "../../client/client";
import type {
  CreatePracticeRubricRequest,
  PracticeRubricDiffResponse,
  PracticeRubricListParams,
  PracticeRubricResponse,
  PracticeRubricReadinessResponse,
  PublishPracticeRubricRequest,
  RejectPracticeRubricRequest,
  ReplacePracticeRubricDocumentRequest,
} from "../../types/practicerubric";

export const PRACTICE_RUBRIC_ENDPOINTS = {
  rubrics: "/api/v1/practice-rubrics",
  rubric: (publicId: string) => `/api/v1/practice-rubrics/${publicId}`,
  clone: (publicId: string) => `/api/v1/practice-rubrics/${publicId}/clone`,
  document: (publicId: string) => `/api/v1/practice-rubrics/${publicId}/document`,
  submitApproval: (publicId: string) => `/api/v1/practice-rubrics/${publicId}/submit-approval`,
  reject: (publicId: string) => `/api/v1/practice-rubrics/${publicId}/reject`,
  publish: (publicId: string) => `/api/v1/practice-rubrics/${publicId}/publish`,
  overridePublish: (publicId: string) => `/api/v1/practice-rubrics/${publicId}/override-publish`,
  retire: (publicId: string) => `/api/v1/practice-rubrics/${publicId}/retire`,
  readiness: (publicId: string) => `/api/v1/practice-rubrics/${publicId}/readiness`,
  diff: (publicId: string, otherPublicId: string) =>
    `/api/v1/practice-rubrics/${publicId}/diff/${otherPublicId}`,
} as const;

export function listPracticeRubrics(
  client: ApiClient,
  params: PracticeRubricListParams = {},
): Promise<PagedResult<PracticeRubricResponse>> {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? DEFAULT_PAGE_SIZE),
  });
  if (params.status) query.set("status", params.status);
  if (params.taskTypeKey) query.set("taskTypeKey", params.taskTypeKey);
  if (params.rubricKey) query.set("rubricKey", params.rubricKey);
  if (params.authorUserPublicId) query.set("authorUserPublicId", params.authorUserPublicId);
  if (params.version != null) query.set("version", String(params.version));
  return client.request<PagedResult<PracticeRubricResponse>>(
    `${PRACTICE_RUBRIC_ENDPOINTS.rubrics}?${query.toString()}`,
  );
}

export function createPracticeRubric(
  client: ApiClient,
  payload: CreatePracticeRubricRequest,
): Promise<PracticeRubricResponse> {
  return client.request<PracticeRubricResponse>(PRACTICE_RUBRIC_ENDPOINTS.rubrics, {
    method: "POST",
    body: payload,
  });
}

export function getPracticeRubric(
  client: ApiClient,
  publicId: string,
): Promise<PracticeRubricResponse> {
  return client.request<PracticeRubricResponse>(PRACTICE_RUBRIC_ENDPOINTS.rubric(publicId));
}

export function clonePracticeRubric(
  client: ApiClient,
  publicId: string,
): Promise<PracticeRubricResponse> {
  return client.request<PracticeRubricResponse>(PRACTICE_RUBRIC_ENDPOINTS.clone(publicId), {
    method: "POST",
  });
}

export function replacePracticeRubricDocument(
  client: ApiClient,
  publicId: string,
  payload: ReplacePracticeRubricDocumentRequest,
): Promise<PracticeRubricResponse> {
  return client.request<PracticeRubricResponse>(PRACTICE_RUBRIC_ENDPOINTS.document(publicId), {
    method: "PUT",
    body: payload,
  });
}

export function submitPracticeRubricApproval(
  client: ApiClient,
  publicId: string,
): Promise<PracticeRubricResponse> {
  return client.request<PracticeRubricResponse>(PRACTICE_RUBRIC_ENDPOINTS.submitApproval(publicId), {
    method: "POST",
  });
}

export function rejectPracticeRubric(
  client: ApiClient,
  publicId: string,
  payload: RejectPracticeRubricRequest,
): Promise<PracticeRubricResponse> {
  return client.request<PracticeRubricResponse>(PRACTICE_RUBRIC_ENDPOINTS.reject(publicId), {
    method: "POST",
    body: payload,
  });
}

export function publishPracticeRubric(
  client: ApiClient,
  publicId: string,
  payload: PublishPracticeRubricRequest,
): Promise<PracticeRubricResponse> {
  return client.request<PracticeRubricResponse>(PRACTICE_RUBRIC_ENDPOINTS.publish(publicId), {
    method: "POST",
    body: payload,
  });
}

export function overridePublishPracticeRubric(
  client: ApiClient,
  publicId: string,
  payload: PublishPracticeRubricRequest,
): Promise<PracticeRubricResponse> {
  return client.request<PracticeRubricResponse>(PRACTICE_RUBRIC_ENDPOINTS.overridePublish(publicId), {
    method: "POST",
    body: payload,
  });
}

export function retirePracticeRubric(
  client: ApiClient,
  publicId: string,
  expectedVersion?: number | null,
): Promise<PracticeRubricResponse> {
  const query = expectedVersion == null ? "" : `?expectedVersion=${expectedVersion}`;
  return client.request<PracticeRubricResponse>(
    `${PRACTICE_RUBRIC_ENDPOINTS.retire(publicId)}${query}`,
    { method: "POST" },
  );
}

export function getPracticeRubricReadiness(client: ApiClient, publicId: string): Promise<PracticeRubricReadinessResponse> {
  return client.request<PracticeRubricReadinessResponse>(PRACTICE_RUBRIC_ENDPOINTS.readiness(publicId));
}

export function diffPracticeRubrics(
  client: ApiClient,
  publicId: string,
  otherPublicId: string,
): Promise<PracticeRubricDiffResponse> {
  return client.request<PracticeRubricDiffResponse>(
    PRACTICE_RUBRIC_ENDPOINTS.diff(publicId, otherPublicId),
  );
}
