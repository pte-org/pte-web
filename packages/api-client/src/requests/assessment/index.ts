import type { ApiClient } from "../../client/client";
import type {
  ExamBlueprintResponse,
  CreateBlueprintRequest,
  ExamSnapshotResponse,
} from "../../types/assessment";

export const BLUEPRINT_ENDPOINTS = {
  blueprints: "/api/v1/blueprints",
  blueprint: (publicId: string) => `/api/v1/blueprints/${publicId}`,
  status: (publicId: string) => `/api/v1/blueprints/${publicId}/status`,
} as const;

export function listBlueprints(client: ApiClient): Promise<ExamBlueprintResponse[]> {
  return client.request<ExamBlueprintResponse[]>(BLUEPRINT_ENDPOINTS.blueprints);
}

export function getBlueprint(client: ApiClient, publicId: string): Promise<ExamBlueprintResponse> {
  return client.request<ExamBlueprintResponse>(BLUEPRINT_ENDPOINTS.blueprint(publicId));
}

export function createBlueprint(client: ApiClient, payload: CreateBlueprintRequest): Promise<ExamBlueprintResponse> {
  return client.request<ExamBlueprintResponse>(BLUEPRINT_ENDPOINTS.blueprints, {
    method: "POST",
    body: payload,
  });
}

export function updateBlueprint(
  client: ApiClient,
  publicId: string,
  payload: CreateBlueprintRequest,
): Promise<ExamBlueprintResponse> {
  return client.request<ExamBlueprintResponse>(BLUEPRINT_ENDPOINTS.blueprint(publicId), {
    method: "PUT",
    body: payload,
  });
}

export function submitBlueprintApproval(client: ApiClient, publicId: string): Promise<ExamBlueprintResponse> {
  return client.request<ExamBlueprintResponse>(BLUEPRINT_ENDPOINTS.status(publicId), { method: "PATCH", body: { action: "SUBMIT_APPROVAL" }, });
}

export function approveBlueprint(client: ApiClient, publicId: string): Promise<ExamSnapshotResponse> {
  return client.request<ExamSnapshotResponse>(BLUEPRINT_ENDPOINTS.status(publicId), { method: "PATCH", body: { action: "APPROVE" }, });
}

export function rejectBlueprint(client: ApiClient, publicId: string, reason: string): Promise<ExamBlueprintResponse> {
  return client.request<ExamBlueprintResponse>(BLUEPRINT_ENDPOINTS.status(publicId), {
    method: "PATCH",
    body: { action: "REJECT", reason },
  });
}
