"use client";

import type { ReactElement } from "react";
import type { QuestionGenerationBatchChildResponse } from "@pte/api-client";
import { Chip, DisclosureChevron, MotionReveal } from "@pte/ui";
import { LiveJobPanel } from "../../questiongeneration/components/LiveJobPanel";
import type { BatchMessages } from "../messages/en";
import { jobLabel } from "../utils/jobLabel";
import { jobHasStarted } from "../utils/jobExpansion";
import { jobCancelledCount } from "../utils/jobFilter";
import { JobStatusBadge } from "./_BatchStatusBadge";

interface BatchJobRowProps {
  job: QuestionGenerationBatchChildResponse;
  /** CEFR level of the batch row this job came from, when known. */
  cefrLevel?: string;
  expanded: boolean;
  messages: BatchMessages;
  onToggle: () => void;
}

/** Saved / failed / cancelled as coloured chips, so a failed or cancelled question stands out without opening the job. */
const JobOutcomeChips = ({ job, messages }: Pick<BatchJobRowProps, "job" | "messages">): ReactElement => {
  const cancelled = jobCancelledCount(job);
  const chips = [
    { count: job.succeededCount, tone: "mint", text: messages.countSaved },
    { count: job.failedCount, tone: "blush", text: messages.countFailed },
    { count: cancelled, tone: "cream", text: messages.countCancelled },
  ] as const;
  return (
    <span className="flex items-center gap-1.5 tabular-nums">
      {chips.filter((chip) => chip.count > 0).map((chip) => (
        <Chip key={chip.tone} tone={chip.tone} size="sm">{chip.text.replace("{count}", String(chip.count))}</Chip>
      ))}
    </span>
  );
};

/** One job of a batch: a summary line that opens onto the job's generation, followed live only while open. */
export const BatchJobRow = ({ job, cefrLevel, expanded, messages, onToggle }: BatchJobRowProps): ReactElement => {
  const seq = job.batchSeq + 1;
  const panelId = `batch-job-${job.jobPublicId}`;
  return (
    <li>
      <button type="button" aria-expanded={expanded} aria-controls={panelId}
        aria-label={messages.jobToggle.replace("{seq}", String(seq))} onClick={onToggle}
        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--surface-subtle)]">
        <DisclosureChevron expanded={expanded} />
        <span className="w-6 tabular-nums text-[var(--ink-muted)]">{seq}</span>
        <span className="font-medium">{jobLabel(job.taskType, cefrLevel)}</span>
        <span className="min-w-0 flex-1 truncate text-[var(--ink-muted)]">{job.topicHint ?? messages.noTopic}</span>
        <JobOutcomeChips job={job} messages={messages} />
        <JobStatusBadge status={job.status} messages={messages} />
      </button>
      {expanded && (
        <MotionReveal className="px-3 pb-3 pt-1" id={panelId}>
          {jobHasStarted(job.status)
            ? <LiveJobPanel jobId={job.jobPublicId} />
            : <p className="text-sm text-[var(--ink-muted)]">{messages.jobWaiting}</p>}
        </MotionReveal>
      )}
    </li>
  );
};
