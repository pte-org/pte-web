import type { ApiClient } from "../../client/client";

export interface CloudinaryUploadRequest {
  contentType: string;
  assetKind: "AUDIO_PROMPT" | "IMAGE_PROMPT";
  sizeBytes: number;
}

export interface CloudinaryUploadResponse {
  mediaPublicId: string;
  uploadUrl: string;
  apiKey: string;
  timestamp: string;
  signature: string;
  folder: string;
  resourceType: string;
  expiresInSeconds: number;
}

export interface CloudinaryCompleteRequest {
  publicId: string;
  assetId: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
  bytes?: number;
  durationSeconds?: number;
  version?: number;
  signature?: string;
}

export interface MediaPreviewResponse {
  url: string;
  expiresInSeconds: number;
  durationSeconds: number | null;
}

export const MEDIA_ENDPOINTS = {
  objects: "/api/v1/objects",
  complete: (id: string) => `/api/v1/objects/${id}/complete`,
  preview: (id: string) => `/api/v1/objects/${id}/preview-url`,
} as const;

export function requestCloudinaryUpload(
  client: ApiClient,
  payload: CloudinaryUploadRequest,
): Promise<CloudinaryUploadResponse> {
  return client.request<CloudinaryUploadResponse>(MEDIA_ENDPOINTS.objects, {
    method: "POST",
    body: payload,
  });
}

export function completeCloudinaryUpload(
  client: ApiClient,
  id: string,
  payload: CloudinaryCompleteRequest,
): Promise<void> {
  return client.request<void>(MEDIA_ENDPOINTS.complete(id), { method: "POST", body: payload });
}

export function getMediaPreview(client: ApiClient, id: string): Promise<MediaPreviewResponse> {
  return client.request<MediaPreviewResponse>(MEDIA_ENDPOINTS.preview(id));
}
