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
  | "FAILED"
  | "CANCELLED";

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

/** The agent that wrote a piece of text in the live view of a job. */
export type QuestionGenerationLiveAgent = "GENERATOR" | "REVIEWER";

/** What an agent wrote in its current call for an item, and how many calls it made for it. */
export interface QuestionGenerationLiveText {
  attempt: number;
  text: string;
}

export interface QuestionGenerationLiveItem {
  index: number;
  stage: QuestionGenerationItemStage | null;
  /** The agent that started last; the writer may rewrite a rejected draft while the stage is still REVIEWING. */
  activeAgent: QuestionGenerationLiveAgent | null;
  generator: QuestionGenerationLiveText | null;
  reviewer: QuestionGenerationLiveText | null;
  audioRef: string | null;
  imageRef: string | null;
}

/** The events of `GET /question-generation/jobs/{id}/live`, by name. */
export type QuestionGenerationLiveEvent =
  | { type: "snapshot"; items: QuestionGenerationLiveItem[]; finished: boolean }
  | { type: "begin"; index: number; agent: QuestionGenerationLiveAgent; attempt: number }
  | { type: "token"; index: number; agent: QuestionGenerationLiveAgent; delta: string }
  | { type: "stage"; index: number; stage: QuestionGenerationItemStage }
  | { type: "media"; index: number; audioRef: string | null; imageRef: string | null }
  | { type: "item"; index: number }
  | { type: "end"; finished: boolean };

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
