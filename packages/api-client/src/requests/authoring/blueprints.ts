import type { ApiClient } from "../../client/client";
import type { BlueprintResponse, SnapshotResponse } from "../../types/authoring";

export const BLUEPRINT_ENDPOINTS = {
  blueprints: "/api/v1/blueprints",
  publish: (publicId: string) => `/api/v1/blueprints/${publicId}/publish`,
} as const;

export function listBlueprints(client: ApiClient): Promise<BlueprintResponse[]> {
  return client.request<BlueprintResponse[]>(BLUEPRINT_ENDPOINTS.blueprints);
}

export function publishBlueprint(client: ApiClient, publicId: string): Promise<SnapshotResponse> {
  return client.request<SnapshotResponse>(BLUEPRINT_ENDPOINTS.publish(publicId), {
    method: "POST",
  });
}
