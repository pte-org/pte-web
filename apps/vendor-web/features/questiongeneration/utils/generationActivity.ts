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

/** What the sidebar shows under the question bank: what runs, where it leads and how far the AI got. */
export interface GenerationActivity {
  kind: "batch" | "job";
  /** The job's task type; a batch mixes several, so it has none. */
  taskType: string | null;
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
      kind: "batch",
      taskType: null,
      href: hrefs.batch(batch.publicId),
      done: batch.succeededCount + batch.failedCount,
      total: batch.totalRequested,
    };
  }
  const job = jobs.find((candidate) => ACTIVE_JOB_STATUSES.includes(candidate.status));
  return job
    ? {
        kind: "job",
        taskType: job.taskType,
        href: hrefs.job(job.publicId),
        done: job.succeededCount + job.failedCount,
        total: job.requestedCount,
      }
    : null;
}
