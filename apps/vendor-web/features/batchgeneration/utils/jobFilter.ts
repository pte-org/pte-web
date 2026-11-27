import type { QuestionGenerationBatchChildResponse } from "@pte/api-client";

/** Which jobs the list shows; picked by clicking a counter in the batch summary. */
export type JobFilter = "all" | "saved" | "failed" | "cancelled" | "open";

const OPEN_JOB_STATUSES: readonly string[] = ["PENDING", "QUEUED", "RUNNING", "CANCELLING", "PAUSING"];

/** Questions of a cancelled job that were neither saved nor failed: they were stopped before being written. */
export const jobCancelledCount = (job: QuestionGenerationBatchChildResponse): number =>
  job.status === "CANCELLED" ? Math.max(job.requestedCount - job.succeededCount - job.failedCount, 0) : 0;

const MATCHES: Record<JobFilter, (job: QuestionGenerationBatchChildResponse) => boolean> = {
  all: () => true,
  saved: (job) => job.succeededCount > 0,
  failed: (job) => job.failedCount > 0,
  cancelled: (job) => jobCancelledCount(job) > 0,
  open: (job) => OPEN_JOB_STATUSES.includes(job.status),
};

export const filterJobs = (
  jobs: readonly QuestionGenerationBatchChildResponse[],
  filter: JobFilter,
): QuestionGenerationBatchChildResponse[] => jobs.filter(MATCHES[filter]);

/** Clicking the active counter again shows every job. */
export const nextJobFilter = (current: JobFilter, clicked: JobFilter): JobFilter => (current === clicked ? "all" : clicked);
