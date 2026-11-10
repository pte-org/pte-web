import type { ApiClient } from "../../client/client";
import type { RubricVersionResponse, TaskTypeRubricResponse } from "../../types/scoringrubric";
import type { RubricSimulationRequest, RubricSimulationResponse } from "../../types/scoringrubric";
import type { RubricWriteRequest, RubricStatusRequest, RubricDiffResponse, RubricActivationAuditResponse } from "../../types/scoringrubric";

/**
 * Matches `RubricReadController`'s `@RequestMapping("/api/v1/scoring-rubrics")`. Vendor-only: platform admin,
 * academic manager, academic staff and platform author may read; tenant roles get 403. Without `versionId` the
 * server answers with the ACTIVE version.
 */
export const SCORING_RUBRIC_ENDPOINTS = {
  simulations: "/api/v1/scoring-rubrics/simulations",
  taskTypes: "/api/v1/scoring-rubrics/task-types",
  taskType: (taskType: string) =>
    `/api/v1/scoring-rubrics/task-types/${encodeURIComponent(taskType)}`,
  versions: "/api/v1/scoring-rubrics/versions",
  version: (publicId: string) =>
    `/api/v1/scoring-rubrics/versions/${encodeURIComponent(publicId)}`,
  diff: (publicId: string) => `/api/v1/scoring-rubrics/versions/${encodeURIComponent(publicId)}/diff`,
  status: (publicId: string) => `/api/v1/scoring-rubrics/versions/${encodeURIComponent(publicId)}/status`,
  activations: (publicId: string) => `/api/v1/scoring-rubrics/versions/${encodeURIComponent(publicId)}/activations`,
} as const;

export function simulateScore(client: ApiClient, body: RubricSimulationRequest): Promise<RubricSimulationResponse> {
  return client.request<RubricSimulationResponse>(SCORING_RUBRIC_ENDPOINTS.simulations, { method: "POST", body });
}

function withVersion(path: string, versionId?: string | null): string {
  const trimmed = versionId?.trim();
  if (!trimmed) return path;
  return `${path}?${new URLSearchParams({ versionId: trimmed }).toString()}`;
}

export function listRubricTaskTypes(
  client: ApiClient,
  versionId?: string | null,
): Promise<TaskTypeRubricResponse[]> {
  return client.request<TaskTypeRubricResponse[]>(
    withVersion(SCORING_RUBRIC_ENDPOINTS.taskTypes, versionId),
  );
}

export function getRubricTaskType(
  client: ApiClient,
  taskType: string,
  versionId?: string | null,
): Promise<TaskTypeRubricResponse> {
  return client.request<TaskTypeRubricResponse>(
    withVersion(SCORING_RUBRIC_ENDPOINTS.taskType(taskType), versionId),
  );
}

export function listRubricVersions(client: ApiClient): Promise<RubricVersionResponse[]> {
  return client.request<RubricVersionResponse[]>(SCORING_RUBRIC_ENDPOINTS.versions);
}

export function getRubricVersion(
  client: ApiClient,
  publicId: string,
): Promise<RubricVersionResponse> {
  return client.request<RubricVersionResponse>(SCORING_RUBRIC_ENDPOINTS.version(publicId));
}

export function createRubricVersion(client: ApiClient, body: RubricWriteRequest): Promise<RubricVersionResponse> {
  return client.request<RubricVersionResponse>(SCORING_RUBRIC_ENDPOINTS.versions, { method: "POST", body });
}
export function updateRubricVersion(client: ApiClient, id: string, body: RubricWriteRequest): Promise<RubricVersionResponse> {
  return client.request<RubricVersionResponse>(SCORING_RUBRIC_ENDPOINTS.version(id), { method: "PUT", body });
}
export function changeRubricVersionStatus(client: ApiClient, id: string, body: RubricStatusRequest): Promise<RubricVersionResponse> {
  return client.request<RubricVersionResponse>(SCORING_RUBRIC_ENDPOINTS.status(id), { method: "PATCH", body });
}
export function getRubricVersionDiff(client: ApiClient, id: string): Promise<RubricDiffResponse> {
  return client.request<RubricDiffResponse>(SCORING_RUBRIC_ENDPOINTS.diff(id));
}
export function getRubricActivations(client: ApiClient, id: string): Promise<RubricActivationAuditResponse[]> {
  return client.request<RubricActivationAuditResponse[]>(SCORING_RUBRIC_ENDPOINTS.activations(id));
}
