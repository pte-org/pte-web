/**
 * Question generation API types
 * Maps to backend DTOs in com.pte.itembank.internal.generation.dto
 * (Not to be confused with exam form generation in scheduling)
 */

export type QuestionGenerationJobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLING" | "CANCELLED";

export type QuestionGenerationItemStage =
  | "QUEUED"
  | "GENERATING"
  | "VALIDATING"
  | "REVIEWING"
  | "RENDERING_MEDIA"
  | "SAVED"
  | "FAILED";

export type QuestionGenerationJobAction = "CANCEL";

export interface QuestionGenerationTaskTypeResponse {
  taskType: string;
  section: string;
  needsAudio: boolean;
  needsImage: boolean;
  estimatedSecondsPerItem: number;
}

export interface QuestionGenerationItemResponse {
  index: number;
  stage: QuestionGenerationItemStage;
  questionPublicId: string | null;
  failureCode: string | null;
  failureNote: string | null;
}

export interface QuestionGenerationJobResponse {
  publicId: string;
  taskType: string;
  cefrLevel: string; // B1, B2, C1, C2
  pool: string; // PRACTICE or EXAM
  topicHint: string | null;
  requestedCount: number;
  status: QuestionGenerationJobStatus;
  succeededCount: number;
  failedCount: number;
  failureCode: string | null;
  createdAt: string; // ISO 8601
  startedAt: string | null; // ISO 8601
  finishedAt: string | null; // ISO 8601
  items: QuestionGenerationItemResponse[];
}

export interface QuestionGenerationQuotaResponse {
  usedToday: number;
  dailyLimit: number;
}

export interface QuestionGenerationJobCreateRequest {
  taskType: string;
  cefrLevel: string; // B1, B2, C1, C2
  pool: string; // PRACTICE or EXAM
  topicHint?: string | null;
  count: number;
}

export interface QuestionGenerationJobStatusRequest {
  action: QuestionGenerationJobAction;
}

// Export legacy names for backward compatibility (but deprecated)
/** @deprecated Use QuestionGenerationJobStatus */
export type GenerationJobStatus = QuestionGenerationJobStatus;

/** @deprecated Use QuestionGenerationJobResponse */
export type GenerationJobResponse = QuestionGenerationJobResponse;
