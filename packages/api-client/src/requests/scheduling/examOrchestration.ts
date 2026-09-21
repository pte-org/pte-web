import type { ApiClient } from "../../client/client";
import type {
  AudiencePreviewResponse,
  AudienceSourceRequest,
  AudienceSourceResponse,
  CreateExamDraftRequest,
  ExamPreflightResponse,
  GenerationJobResponse,
  PatchExamDraftRequest,
  SessionResponse,
} from "../../types/scheduling";

export const EXAM_ORCHESTRATION_ENDPOINTS = {
  drafts: "/api/v1/sessions/drafts",
  draft: (publicId: string) => `/api/v1/sessions/${publicId}`,
  sources: (publicId: string) => `/api/v1/sessions/${publicId}/audience-sources`,
  source: (publicId: string, sourcePublicId: string) =>
    `/api/v1/sessions/${publicId}/audience-sources/${sourcePublicId}`,
  audiencePreview: (publicId: string) => `/api/v1/sessions/${publicId}/audience-preview`,
  preflight: (publicId: string) => `/api/v1/sessions/${publicId}/preflight`,
  generate: (publicId: string, idempotencyKey: string) =>
    `/api/v1/sessions/${publicId}/generate?idempotencyKey=${encodeURIComponent(idempotencyKey)}`,
  generation: (publicId: string) => `/api/v1/sessions/${publicId}/generation`,
  publish: (publicId: string) => `/api/v1/sessions/${publicId}/publish`,
  cancel: (publicId: string) => `/api/v1/sessions/${publicId}/cancel`,
} as const;

export function createExamDraft(
  client: ApiClient,
  payload: CreateExamDraftRequest,
): Promise<SessionResponse> {
  return client.request<SessionResponse>(EXAM_ORCHESTRATION_ENDPOINTS.drafts, {
    method: "POST",
    body: payload,
  });
}

export function patchExamDraft(
  client: ApiClient,
  publicId: string,
  payload: PatchExamDraftRequest,
): Promise<SessionResponse> {
  return client.request<SessionResponse>(EXAM_ORCHESTRATION_ENDPOINTS.draft(publicId), {
    method: "PATCH",
    body: payload,
  });
}

export function listAudienceSources(
  client: ApiClient,
  publicId: string,
): Promise<AudienceSourceResponse[]> {
  return client.request<AudienceSourceResponse[]>(EXAM_ORCHESTRATION_ENDPOINTS.sources(publicId));
}

export function addAudienceSource(
  client: ApiClient,
  publicId: string,
  payload: AudienceSourceRequest,
): Promise<AudienceSourceResponse> {
  return client.request<AudienceSourceResponse>(EXAM_ORCHESTRATION_ENDPOINTS.sources(publicId), {
    method: "POST",
    body: payload,
  });
}

export function removeAudienceSource(
  client: ApiClient,
  publicId: string,
  sourcePublicId: string,
): Promise<void> {
  return client.request<void>(EXAM_ORCHESTRATION_ENDPOINTS.source(publicId, sourcePublicId), {
    method: "DELETE",
  });
}

export function previewAudience(
  client: ApiClient,
  publicId: string,
): Promise<AudiencePreviewResponse> {
  return client.request<AudiencePreviewResponse>(
    EXAM_ORCHESTRATION_ENDPOINTS.audiencePreview(publicId),
    { method: "POST" },
  );
}

export function preflightExam(client: ApiClient, publicId: string): Promise<ExamPreflightResponse> {
  return client.request<ExamPreflightResponse>(EXAM_ORCHESTRATION_ENDPOINTS.preflight(publicId), {
    method: "POST",
  });
}

export function generateExam(
  client: ApiClient,
  publicId: string,
  idempotencyKey: string,
): Promise<GenerationJobResponse> {
  return client.request<GenerationJobResponse>(
    EXAM_ORCHESTRATION_ENDPOINTS.generate(publicId, idempotencyKey),
    {
      method: "POST",
    },
  );
}

export function getGenerationJob(
  client: ApiClient,
  publicId: string,
): Promise<GenerationJobResponse> {
  return client.request<GenerationJobResponse>(EXAM_ORCHESTRATION_ENDPOINTS.generation(publicId));
}

export function publishExam(client: ApiClient, publicId: string): Promise<SessionResponse> {
  return client.request<SessionResponse>(EXAM_ORCHESTRATION_ENDPOINTS.publish(publicId), {
    method: "POST",
  });
}

export function cancelExam(client: ApiClient, publicId: string): Promise<SessionResponse> {
  return client.request<SessionResponse>(EXAM_ORCHESTRATION_ENDPOINTS.cancel(publicId), {
    method: "POST",
  });
}
