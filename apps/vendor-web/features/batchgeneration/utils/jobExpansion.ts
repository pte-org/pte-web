import type { QuestionGenerationJobStatus } from "@pte/api-client";

/** Rows the person opened (true) or closed (false); a row they never touched follows the default. */
export type JobToggles = Readonly<Record<string, boolean>>;

/** Whether a job row is open: what the person chose, else open only for the job running now. */
export function isJobExpanded(jobId: string, toggles: JobToggles, currentJobId: string | null): boolean {
  return toggles[jobId] ?? jobId === currentJobId;
}

/** The toggles after the person opened or closed one row. */
export function toggleJob(jobId: string, toggles: JobToggles, currentJobId: string | null): JobToggles {
  return { ...toggles, [jobId]: !isJobExpanded(jobId, toggles, currentJobId) };
}

const NOT_STARTED: readonly QuestionGenerationJobStatus[] = ["PENDING", "QUEUED"];

/** A job still waiting has nothing to follow yet, so its row opens onto a note instead of the live view. */
export const jobHasStarted = (status: QuestionGenerationJobStatus): boolean => !NOT_STARTED.includes(status);
