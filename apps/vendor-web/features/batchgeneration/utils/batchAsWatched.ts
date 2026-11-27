import type { QuestionGenerationBatchResponse } from "@pte/api-client";
import { TERMINAL_BATCH_STATUSES } from "../constants";
import { jobChipStatus } from "./jobChip";

/**
 * The batch as the person sees it. The server often finishes the job being watched long before its replay has played,
 * so until the replay is done that job still counts as running: its questions are not yet counted as saved, failed or
 * cancelled, and a batch the server already closed still shows as running. Every other job counts as the server says.
 */
export function batchAsWatched(
  batch: QuestionGenerationBatchResponse,
  focusedId: string | null,
  replayDone: boolean,
): QuestionGenerationBatchResponse {
  const watched = batch.children.find((job) => job.jobPublicId === focusedId);
  if (!watched || jobChipStatus(watched.status, true, replayDone) === watched.status) return batch;
  const cancelled =
    watched.status === "CANCELLED"
      ? Math.max(0, watched.requestedCount - watched.succeededCount - watched.failedCount)
      : 0;
  const held = watched.succeededCount + watched.failedCount + cancelled;
  return {
    ...batch,
    status: TERMINAL_BATCH_STATUSES.includes(batch.status) ? "RUNNING" : batch.status,
    succeededCount: batch.succeededCount - watched.succeededCount,
    failedCount: batch.failedCount - watched.failedCount,
    cancelledCount: Math.max(0, batch.cancelledCount - cancelled),
    openCount: batch.openCount + held,
    children: batch.children.map((job) =>
      job === watched ? { ...job, status: "RUNNING", succeededCount: 0, failedCount: 0 } : job,
    ),
  };
}
