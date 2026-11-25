import type {
  QuestionGenerationBatchResponse,
  QuestionGenerationBatchStatus,
  QuestionGenerationJobResponse,
} from "@pte/api-client";
import { ACTIVE_JOB_STATUSES } from "../liveConstants";

export const OPEN_BATCH_STATUSES: readonly QuestionGenerationBatchStatus[] = [
  "QUEUED",
  "RUNNING",
  "CANCELLING",
];

/** What the header pill shows: where it leads and how far the AI got. */
export interface GenerationActivity {
  href: string;
  done: number;
  total: number;
}

interface ActivityHrefs {
  job: (jobId: string) => string;
  batch: (batchId: string) => string;
}

/** An open batch wins over a single running job, since its children are hidden from the job list. */
export function pickGenerationActivity(
  jobs: readonly QuestionGenerationJobResponse[],
  batch: QuestionGenerationBatchResponse | null,
  hrefs: ActivityHrefs,
): GenerationActivity | null {
  if (batch && OPEN_BATCH_STATUSES.includes(batch.status)) {
    return {
      href: hrefs.batch(batch.publicId),
      done: batch.succeededCount + batch.failedCount,
      total: batch.totalRequested,
    };
  }
  const job = jobs.find((candidate) => ACTIVE_JOB_STATUSES.includes(candidate.status));
  return job
    ? {
        href: hrefs.job(job.publicId),
        done: job.succeededCount + job.failedCount,
        total: job.requestedCount,
      }
    : null;
}
