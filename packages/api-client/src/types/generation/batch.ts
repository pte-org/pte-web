/**
 * Batch question generation API types
 * Maps to backend DTOs in com.pte.itembank.internal.generation.batch.dto
 */

import type { QuestionGenerationJobStatus } from "./index";

export type QuestionGenerationBatchStatus =
  | "QUEUED"
  | "RUNNING"
  | "CANCELLING"
  /** Its running children are being stopped; it becomes PAUSED within a moment. */
  | "PAUSING"
  | "PAUSED"
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type QuestionGenerationImageKind = "AUTO" | "CHART" | "PICTURE";

/** One line of a batch: how many questions of one task type and level, spread over its topics. */
export interface QuestionGenerationBatchRow {
  taskType: string;
  cefrLevel: string;
  count: number;
  topicHints: string[];
  /** Describe Image only; null or AUTO lets the topic decide. */
  imageKind: QuestionGenerationImageKind | null;
}

export interface QuestionGenerationBatchCreateRequest {
  pool: string; // PRACTICE or EXAM
  rows: QuestionGenerationBatchRow[];
}

/** One child job of a batch; the job stays readable at `/jobs/{jobPublicId}`. */
export interface QuestionGenerationBatchChildResponse {
  jobPublicId: string;
  batchSeq: number;
  rowIndex: number;
  taskType: string;
  topicHint: string | null;
  requestedCount: number;
  status: QuestionGenerationJobStatus;
  succeededCount: number;
  failedCount: number;
  failureCode: string | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface QuestionGenerationBatchResponse {
  publicId: string;
  pool: string;
  status: QuestionGenerationBatchStatus;
  totalRequested: number;
  succeededCount: number;
  failedCount: number;
  cancelledCount: number;
  openCount: number;
  cancelRequested: boolean;
  failureCode: string | null;
  /** The child a live view should follow; always null in the list. */
  currentJobPublicId: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  rows: QuestionGenerationBatchRow[];
  /** Empty in the list. */
  children: QuestionGenerationBatchChildResponse[];
  /** When the batch was last paused; null while it runs. Absent from an older server. */
  pausedAt?: string | null;
  /** When a paused batch is cancelled unless resumed; null when paused batches are kept. */
  pauseExpiresAt?: string | null;
}

/**
 * One question slot of a batch for its result cards (`GET /batches/{id}/questions`). The preview fields are null
 * (options empty) until the question is saved, and for a slot that failed or was cancelled.
 */
export interface QuestionGenerationBatchQuestion {
  jobPublicId: string;
  batchSeq: number;
  itemIndex: number;
  taskType: string;
  cefrLevel: string | null;
  stage: string;
  failureCode: string | null;
  questionPublicId: string | null;
  section: string | null;
  topic: string | null;
  promptExcerpt: string | null;
  options: string[];
  correctOptionIndex: number | null;
  audioRef: string | null;
  imageRef: string | null;
  audioSeconds: number | null;
  voice: string | null;
  chartType: string | null;
  words: number | null;
  /** Criteria the reviewer passed, out of `reviewTotal`; null when the question has no review. */
  reviewPassed: number | null;
  reviewTotal: number | null;
}

export interface QuestionGenerationBatchDraftDeleteRequest {
  /** At most 200; empty or absent means the live drafts of the batch. */
  questionPublicIds?: string[];
}

export type QuestionGenerationBatchDraftDeleteResult =
  | "deleted"
  | "skipped_not_draft"
  | "forbidden"
  | "not_found"
  | "not_in_batch";

export interface QuestionGenerationBatchDraftDeleteItem {
  questionPublicId: string;
  result: QuestionGenerationBatchDraftDeleteResult;
  code: string | null;
}

export interface QuestionGenerationBatchDraftDeleteResponse {
  processed: number;
  deleted: number;
  /** Drafts of the batch still live after the call; call again while above zero. */
  remaining: number;
  items: QuestionGenerationBatchDraftDeleteItem[];
}

export interface QuestionGenerationBatchListParams {
  page?: number;
  size?: number;
  /** Narrows a reviewer's list to their own batches. */
  mine?: boolean;
}
