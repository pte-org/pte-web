import type { ReactElement } from "react";
import type { QuestionGenerationBatchResponse } from "@pte/api-client";
import { cn } from "@pte/ui";
import type { BatchMessages } from "../messages/en";
import { jobLabel } from "../utils/jobLabel";
import { filterJobs, type JobFilter } from "../utils/jobFilter";
import { JobStatusBadge } from "./_BatchStatusBadge";

interface BatchJobPickerProps {
  batch: QuestionGenerationBatchResponse;
  messages: BatchMessages;
  focusedId: string | null;
  onFocus: (jobId: string) => void;
  unseen: ReadonlySet<string>;
  filter: JobFilter;
  titleClassName: string;
}

/** Every job of the batch in run order; picking one shows it in the main panel. */
export const BatchJobPicker = ({
  batch,
  messages,
  focusedId,
  onFocus,
  unseen,
  filter,
  titleClassName,
}: BatchJobPickerProps): ReactElement => {
  const shown = filterJobs(batch.children, filter);
  return (
    <section>
      <h2 className={titleClassName}>
        {messages.jobsTitle.replace("{count}", String(shown.length))}
      </h2>
      {shown.length === 0 && (
        <p className="text-sm text-[var(--ink-muted)]">{messages.noJobsMatch}</p>
      )}
      <ul className="divide-y divide-dashed divide-[var(--border-subtle)]">
        {shown.map((job) => (
          <li key={job.jobPublicId}>
            <button
              type="button"
              onClick={() => onFocus(job.jobPublicId)}
              aria-current={job.jobPublicId === focusedId}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-[var(--surface-subtle)]",
                job.jobPublicId === focusedId && "bg-[var(--action-tint)]",
              )}
            >
              <span className="w-5 tabular-nums text-[var(--ink-muted)]">{job.batchSeq + 1}</span>
              <span className="min-w-0 flex-1 truncate">
                {jobLabel(job.taskType, batch.rows[job.rowIndex]?.cefrLevel)}
                <span className="ml-1 text-xs tabular-nums text-[var(--ink-muted)]">
                  {`· ${job.succeededCount}/${job.requestedCount}`}
                </span>
              </span>
              {unseen.has(job.jobPublicId) && (
                <span
                  className="size-2 shrink-0 rounded-full bg-[var(--action)]"
                  title={messages.unseen}
                  aria-label={messages.unseen}
                />
              )}
              <JobStatusBadge status={job.status} messages={messages} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
