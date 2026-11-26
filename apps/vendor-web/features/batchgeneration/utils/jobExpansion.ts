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

const bySeq = (
  jobs: readonly QuestionGenerationBatchChildResponse[],
): QuestionGenerationBatchChildResponse[] =>
  [...jobs].sort((left, right) => left.batchSeq - right.batchSeq);

/**
 * The job "Next" moves to: a finished job not viewed yet (after the current one first, then from the start), else a
 * running one, else the job after the current one in run order; null when there is nowhere to go.
 */
export function nextJobId(
  jobs: readonly QuestionGenerationBatchChildResponse[],
  currentId: string | null,
  seen: ReadonlySet<string>,
): string | null {
  const ordered = bySeq(jobs);
  const at = ordered.findIndex((job) => job.jobPublicId === currentId);
  const rotated = [...ordered.slice(at + 1), ...ordered.slice(0, Math.max(at, 0))].filter(
    (job) => job.jobPublicId !== currentId,
  );
  const unseenDone = rotated.find(
    (job) => FINISHED.includes(job.status) && !seen.has(job.jobPublicId),
  );
  const running = rotated.find((job) => RUNNING.includes(job.status));
  const after = at >= 0 ? ordered[at + 1] : undefined;
  return (unseenDone ?? running ?? after)?.jobPublicId ?? null;
}

/** The job before the current one in run order, or null at the start. */
export function previousJobId(
  jobs: readonly QuestionGenerationBatchChildResponse[],
  currentId: string | null,
): string | null {
  const ordered = bySeq(jobs);
  const at = ordered.findIndex((job) => job.jobPublicId === currentId);
  return at > 0 ? (ordered[at - 1]?.jobPublicId ?? null) : null;
}

/** Finished jobs the person has not opened yet. */
export const unseenJobIds = (
  jobs: readonly QuestionGenerationBatchChildResponse[],
  seen: ReadonlySet<string>,
): ReadonlySet<string> =>
  new Set(
    jobs
      .filter((job) => FINISHED.includes(job.status) && !seen.has(job.jobPublicId))
      .map((job) => job.jobPublicId),
  );
