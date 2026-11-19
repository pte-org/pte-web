"use client";

import { useState, type ReactElement } from "react";
import type { QuestionGenerationBatchChildResponse } from "@pte/api-client";
import { DashboardPanel } from "@pte/ui";
import type { BatchMessages } from "../messages/en";
import { filterJobs, type JobFilter } from "../utils/jobFilter";
import { isJobExpanded, toggleJob, type JobToggles } from "../utils/jobExpansion";
import { BatchJobRow } from "./_BatchJobRow";

interface BatchJobListProps {
  jobs: QuestionGenerationBatchChildResponse[];
  currentJobId: string | null;
  messages: BatchMessages;
  filter: JobFilter;
}

/** The jobs of a batch in run order; the running one is open, any other opens on demand. */
export const BatchJobList = ({ jobs, currentJobId, messages, filter }: BatchJobListProps): ReactElement => {
  const [toggles, setToggles] = useState<JobToggles>({});
  const shown = filterJobs(jobs, filter);
  return (
    <DashboardPanel title={messages.childrenTitle}>
      {shown.length === 0 && <p className="px-3 py-2 text-sm text-[var(--ink-muted)]">{messages.noJobsMatch}</p>}
      <ul className="divide-y divide-[var(--border-subtle)]">
        {shown.map((job) => (
          <BatchJobRow key={job.jobPublicId} job={job} messages={messages}
            expanded={isJobExpanded(job.jobPublicId, toggles, currentJobId)}
            onToggle={() => setToggles((current) => toggleJob(job.jobPublicId, current, currentJobId))} />
        ))}
      </ul>
    </DashboardPanel>
  );
};
