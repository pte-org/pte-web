import type { ReactElement } from "react";
import type { QuestionGenerationBatchResponse } from "@pte/api-client";
import {
  AlertTriangleIcon,
  BanIcon,
  CheckCircleIcon,
  ClipboardIcon,
  DashboardCard,
  DescriptionList,
  InfoIcon,
  ProgressBar,
  StatCard,
  cn,
  type DescriptionItem,
} from "@pte/ui";
import { taskTypeLabel } from "../../questiongeneration/utils/taskTypeLabel";
import type { BatchMessages } from "../messages/en";
import type { JobFilter } from "../utils/jobFilter";
import { BatchStatusBadge } from "./_BatchStatusBadge";

interface BatchSummaryCardProps {
  batch: QuestionGenerationBatchResponse;
  messages: BatchMessages;
  filter: JobFilter;
  onFilter: (filter: JobFilter) => void;
}

const formatTime = (value: string | null): string => (value ? new Date(value).toLocaleString() : "—");

/** The job running now as "#2 · Read Aloud"; its live view is the open row in the job list. */
const currentJobLabel = (batch: QuestionGenerationBatchResponse): string | null => {
  const job = batch.children.find((child) => child.jobPublicId === batch.currentJobPublicId);
  return job ? `#${job.batchSeq + 1} · ${taskTypeLabel(job.taskType)}` : null;
};

/** Overall progress of a batch, its counters and which job runs now. */
export const BatchSummaryCard = ({ batch, messages, filter, onFilter }: BatchSummaryCardProps): ReactElement => {
  const done = batch.succeededCount + batch.failedCount + batch.cancelledCount;
  const tone = batch.failedCount > 0 ? "warning" : "success";
  const current = currentJobLabel(batch);
  const items: DescriptionItem[] = [
    { label: messages.colStatus, value: <BatchStatusBadge status={batch.status} messages={messages} /> },
    { label: messages.colPool, value: messages[`pool${batch.pool}` as keyof BatchMessages] ?? batch.pool },
    { label: messages.summaryStarted, value: formatTime(batch.startedAt) },
    { label: messages.summaryFinished, value: formatTime(batch.finishedAt) },
    ...(current ? [{ label: messages.currentJob, value: current }] : []),
  ];
  // Each counter keeps one colour across batches: blue asked, green saved, pink failed, cream cancelled, sky still open.
  const counters = [
    { label: messages.summaryRequested, value: batch.totalRequested, accent: "blue", Icon: ClipboardIcon, filter: "all" },
    { label: messages.summarySucceeded, value: batch.succeededCount, accent: "mint", Icon: CheckCircleIcon, filter: "saved" },
    { label: messages.summaryFailed, value: batch.failedCount, accent: "blush", Icon: AlertTriangleIcon, filter: "failed" },
    { label: messages.summaryCancelled, value: batch.cancelledCount, accent: "cream", Icon: BanIcon, filter: "cancelled" },
    { label: messages.summaryOpen, value: batch.openCount, accent: "sky", Icon: InfoIcon, filter: "open" },
  ] as const;
  return (
    <DashboardCard>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-[var(--ink-muted)]">{`${messages.progressLabel}: ${done}/${batch.totalRequested}`}</p>
          <ProgressBar value={done} max={Math.max(batch.totalRequested, 1)} tone={tone} label={messages.progressLabel} />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {counters.map((counter) => (
            <button
              key={counter.label}
              type="button"
              aria-pressed={filter === counter.filter}
              title={messages.filterHint}
              onClick={() => onFilter(counter.filter)}
              className={cn(
                "rounded-xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35",
                filter === counter.filter && counter.filter !== "all" && "ring-2 ring-[var(--action)]",
              )}
            >
              <StatCard
              compact
              label={counter.label}
              value={String(counter.value)}
              accent={counter.accent}
                icon={<counter.Icon />}
              />
            </button>
          ))}
        </div>
        <DescriptionList items={items} variant="inline" />
      </div>
    </DashboardCard>
  );
};
