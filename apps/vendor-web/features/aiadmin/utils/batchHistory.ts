import type { QuestionGenerationBatchResponse, QuestionGenerationBatchStatus } from "@pte/api-client";

/** Batches still moving: the history keeps polling while one of these is shown. */
export const OPEN_BATCH_STATUSES: readonly QuestionGenerationBatchStatus[] = ["QUEUED", "RUNNING", "CANCELLING"];

export interface BatchSummary {
  types: number;
  questions: number;
}

/** Distinct task types and the total questions asked for across the rows of a batch. */
export const summarizeBatch = (batch: QuestionGenerationBatchResponse): BatchSummary => ({
  types: new Set(batch.rows.map((row) => row.taskType)).size,
  questions: batch.rows.reduce((sum, row) => sum + row.count, 0),
});

/** Finished questions (saved, failed or cancelled) against the total requested. */
export const batchProgress = (batch: QuestionGenerationBatchResponse): { done: number; total: number } => ({
  done: batch.succeededCount + batch.failedCount + batch.cancelledCount,
  total: batch.totalRequested,
});

export const hasOpenBatch = (batches: readonly QuestionGenerationBatchResponse[]): boolean =>
  batches.some((batch) => OPEN_BATCH_STATUSES.includes(batch.status));

/** `toDay` maps a timestamp to its local yyyy-MM-dd day; an empty status keeps every status. */
export const filterBatches = (
  batches: readonly QuestionGenerationBatchResponse[],
  range: { from: string; to: string },
  status: string,
  toDay: (date: Date) => string,
): QuestionGenerationBatchResponse[] =>
  batches.filter((batch) => {
    const day = toDay(new Date(batch.createdAt));
    return day >= range.from && day <= range.to && (status === "" || batch.status === status);
  });
