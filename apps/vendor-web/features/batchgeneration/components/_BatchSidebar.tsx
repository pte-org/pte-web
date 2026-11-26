import type { ReactElement } from "react";
import type { QuestionGenerationBatchResponse } from "@pte/api-client";
import { DashboardCard, ProgressBar, cn } from "@pte/ui";
import type { BatchMessages } from "../messages/en";
import { jobLabel } from "../utils/jobLabel";
import { runningJobs } from "../utils/jobExpansion";
import type { JobFilter } from "../utils/jobFilter";
import { BatchStatusBadge, JobStatusBadge } from "./_BatchStatusBadge";
import { BatchJobPicker } from "./_BatchJobPicker";

interface BatchSidebarProps {
  batch: QuestionGenerationBatchResponse;
  messages: BatchMessages;
  focusedId: string | null;
  onFocus: (jobId: string) => void;
  /** Finished jobs not opened yet, marked in the job list. */
  unseen: ReadonlySet<string>;
  filter: JobFilter;
  onFilter: (filter: JobFilter) => void;
}

const SECTION_TITLE = "mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]";

/** The batch at a glance: progress and counters, the lanes running now, and every job to pick from. */
export const BatchSidebar = ({
  batch,
  messages,
  focusedId,
  onFocus,
  unseen,
  filter,
  onFilter,
}: BatchSidebarProps): ReactElement => {
  const done = batch.succeededCount + batch.failedCount + batch.cancelledCount;
  const lanes = runningJobs(batch.children);
  // Each counter filters the job list below; clicking it again shows every job.
  const counters = [
    { text: messages.countRunning, value: lanes.length, filter: "open" },
    { text: messages.countFailedShort, value: batch.failedCount, filter: "failed" },
    { text: messages.countCancelledShort, value: batch.cancelledCount, filter: "cancelled" },
  ] as const;
  return (
    <div className="space-y-4">
      <DashboardCard>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(SECTION_TITLE, "mb-0")}>{messages.sidebarProgress}</p>
            <BatchStatusBadge status={batch.status} messages={messages} />
          </div>
          <p className="text-sm text-[var(--ink-muted)]">
            <span className="mr-1 text-3xl font-bold text-[var(--ink-primary)]">
              {batch.succeededCount}
            </span>
            {messages.savedOfTotal.replace("{total}", String(batch.totalRequested))}
          </p>
          <ProgressBar
            value={done}
            max={Math.max(batch.totalRequested, 1)}
            tone={batch.failedCount > 0 ? "warning" : "success"}
            label={messages.progressLabel}
          />
          <div className="flex flex-wrap gap-1.5">
            {counters.map((counter) => (
              <button
                key={counter.filter}
                type="button"
                aria-pressed={filter === counter.filter}
                title={messages.filterHint}
                onClick={() => onFilter(counter.filter)}
                className={cn(
                  "rounded-full border border-[var(--border-subtle)] px-2.5 py-0.5 text-xs tabular-nums transition-colors hover:bg-[var(--surface-subtle)]",
                  filter === counter.filter &&
                    "border-[var(--action)] bg-[var(--action-tint)] text-[var(--action)]",
                )}
              >
                {counter.text.replace("{count}", String(counter.value))}
              </button>
            ))}
          </div>
        </div>
      </DashboardCard>
      <DashboardCard>
        <h2 className={SECTION_TITLE}>
          {messages.lanesTitle.replace("{count}", String(lanes.length))}
        </h2>
        {lanes.length === 0 && (
          <p className="text-sm text-[var(--ink-muted)]">{messages.noLanes}</p>
        )}
        <ul className="space-y-2">
          {lanes.map((job, lane) => (
            <li key={job.jobPublicId}>
              <button
                type="button"
                onClick={() => onFocus(job.jobPublicId)}
                aria-pressed={job.jobPublicId === focusedId}
                className={cn(
                  "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-left shadow-card transition-colors hover:border-[var(--action)]/50",
                  job.jobPublicId === focusedId &&
                    "border-[var(--action)] ring-2 ring-[var(--action-tint)]",
                )}
              >
                <span className="flex items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
                  {messages.laneLabel.replace("{n}", String(lane + 1))}
                  <JobStatusBadge status={job.status} messages={messages} />
                </span>
                <span className="mt-1 block text-sm font-semibold">
                  {`#${job.batchSeq + 1} · ${jobLabel(job.taskType, batch.rows[job.rowIndex]?.cefrLevel)}`}
                </span>
                <span className="mt-1 block text-xs text-[var(--ink-muted)]">
                  {messages.laneProgress
                    .replace("{done}", String(job.succeededCount + job.failedCount))
                    .replace("{total}", String(job.requestedCount))}
                </span>
                <span className="mt-1.5 block">
                  <ProgressBar
                    value={job.succeededCount + job.failedCount}
                    max={Math.max(job.requestedCount, 1)}
                    label={messages.progressLabel}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </DashboardCard>
      <DashboardCard>
        <BatchJobPicker
          batch={batch}
          messages={messages}
          focusedId={focusedId}
          onFocus={onFocus}
          unseen={unseen}
          filter={filter}
          titleClassName={SECTION_TITLE}
        />
      </DashboardCard>
    </div>
  );
};
