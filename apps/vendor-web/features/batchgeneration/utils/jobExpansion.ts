import type {
  QuestionGenerationBatchChildResponse,
  QuestionGenerationJobStatus,
} from "@pte/api-client";

const RUNNING: readonly QuestionGenerationJobStatus[] = ["RUNNING", "CANCELLING"];
const FINISHED: readonly QuestionGenerationJobStatus[] = ["COMPLETED", "FAILED", "CANCELLED"];

/** The jobs running now, in run order: one per parallel lane. */
export const runningJobs = (
  jobs: readonly QuestionGenerationBatchChildResponse[],
): QuestionGenerationBatchChildResponse[] =>
  jobs
    .filter((job) => RUNNING.includes(job.status))
    .sort((left, right) => left.batchSeq - right.batchSeq);

/**
 * The job the main panel follows: the one the person picked, else the first running job, else the batch's current
 * job, else the last one that finished, else the first.
 */
export function focusedJobId(
  jobs: readonly QuestionGenerationBatchChildResponse[],
  picked: string | null,
  currentJobId: string | null,
): string | null {
  if (picked && jobs.some((job) => job.jobPublicId === picked)) return picked;
  const running = runningJobs(jobs)[0];
  if (running) return running.jobPublicId;
  if (currentJobId && jobs.some((job) => job.jobPublicId === currentJobId)) return currentJobId;
  const finished = jobs.filter((job) => FINISHED.includes(job.status));
  return (finished[finished.length - 1] ?? jobs[0])?.jobPublicId ?? null;
}

const NOT_STARTED: readonly QuestionGenerationJobStatus[] = ["PENDING", "QUEUED"];

/** A job still waiting has nothing to follow yet, so it shows a note instead of the live view. */
export const jobHasStarted = (status: QuestionGenerationJobStatus): boolean =>
  !NOT_STARTED.includes(status);
