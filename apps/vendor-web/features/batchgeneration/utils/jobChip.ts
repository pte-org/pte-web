import type { QuestionGenerationJobStatus } from "@pte/api-client";

const FINISHED: readonly QuestionGenerationJobStatus[] = ["COMPLETED", "FAILED", "CANCELLED"];

/**
 * The status a job's list row shows. The server often finishes a job long before the replay of its question has
 * played, so the job being watched stays "running" until its replay is done; every other job, and a job the server
 * has not finished, shows what the server says.
 */
export function jobChipStatus(
  status: QuestionGenerationJobStatus,
  watched: boolean,
  replayDone: boolean,
): QuestionGenerationJobStatus {
  return watched && !replayDone && FINISHED.includes(status) ? "RUNNING" : status;
}
