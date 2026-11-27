import type {
  QuestionGenerationBatchStatus,
  QuestionGenerationJobStatus,
} from "@pte/api-client";
import type { BadgeVariant } from "@pte/ui";

export const BATCHES_QUERY_KEY = "generationBatches";

/** Batches have no list page: the generation popup in the question editor starts them and opens their page. */
const BATCH_BASE_PATH = "/admin/questions/ai-batches";
export const batchDetailHref = (batchId: string): string => `${BATCH_BASE_PATH}/${batchId}`;
/** Where a batch page leads back to. */
export const QUESTION_BANK_PATH = "/admin/questions";

/** Poll the open batch every 5 s while the tab is visible, every 15 s when it is hidden (contract). */
export const BATCH_POLL_VISIBLE_MS = 5000;
export const BATCH_POLL_HIDDEN_MS = 15000;

/** Topic limits of a batch row; the server checks them again. */
export const BATCH_MAX_TOPIC_HINTS = 10;
export const BATCH_TOPIC_HINT_MAX_LENGTH = 500;
/** Letters, digits, spaces and `,.;:'?!&()/-` only. */
export const BATCH_TOPIC_HINT_PATTERN = /^[\p{L}\p{N} ,.;:'?!&()/-]+$/u;


export const TERMINAL_BATCH_STATUSES: readonly QuestionGenerationBatchStatus[] = [
  "COMPLETED",
  "PARTIALLY_COMPLETED",
  "FAILED",
  "CANCELLED",
];
export const CANCELLABLE_BATCH_STATUSES: readonly QuestionGenerationBatchStatus[] = [
  "QUEUED",
  "RUNNING",
  "PAUSING",
  "PAUSED",
];
export const PAUSABLE_BATCH_STATUSES: readonly QuestionGenerationBatchStatus[] = ["QUEUED", "RUNNING"];
/** Stopping or stopped by a pause. */
export const HALTED_BATCH_STATUSES: readonly QuestionGenerationBatchStatus[] = ["PAUSING", "PAUSED"];
export const FINISHED_JOB_STATUSES: readonly QuestionGenerationJobStatus[] = ["COMPLETED", "FAILED", "CANCELLED"];

export const BATCH_STATUS_VARIANT: Record<QuestionGenerationBatchStatus, BadgeVariant> = {
  QUEUED: "info",
  RUNNING: "info",
  CANCELLING: "warning",
  PAUSING: "warning",
  PAUSED: "neutral",
  COMPLETED: "success",
  PARTIALLY_COMPLETED: "warning",
  FAILED: "danger",
  CANCELLED: "neutral",
};

export const JOB_STATUS_VARIANT: Record<QuestionGenerationJobStatus, BadgeVariant> = {
  PENDING: "neutral",
  QUEUED: "info",
  RUNNING: "info",
  CANCELLING: "warning",
  PAUSING: "warning",
  COMPLETED: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
};
