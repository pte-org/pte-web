"use client";

import type { ReactElement } from "react";
import { Alert, Skeleton, useLocale } from "@pte/ui";
import { useQuestionGenerationTaskTypes } from "../api";
import { useLiveJob } from "../hooks/useLiveJob";
import { LIVE_TEXT, TERMINAL_JOB_STATUSES } from "../liveConstants";
import { JobOutcomeList } from "./_JobOutcomeList";
import { LiveJobItemList } from "./_LiveJobItemList";

interface LiveJobPanelProps {
  jobId: string;
}

/**
 * One generation job shown inside another page: while it runs, its questions as the agents write them; once it ended,
 * what it saved and why the rest failed. The job is followed only while this panel is mounted.
 */
export const LiveJobPanel = ({ jobId }: LiveJobPanelProps): ReactElement => {
  const { locale } = useLocale();
  const lang = locale === "vi" ? "vi" : "en";
  const text = LIVE_TEXT[lang];
  const { job: jobQuery, items, connection } = useLiveJob(jobId);
  const { data: taskTypes = [] } = useQuestionGenerationTaskTypes();
  const job = jobQuery.data;

  if (jobQuery.isError) return <Alert tone="error">{text.jobLoadError}</Alert>;
  if (!job) return <Skeleton className="h-24 w-full" />;

  const finished = TERMINAL_JOB_STATUSES.includes(job.status);
  const taskType = taskTypes.find((type) => type.taskType === job.taskType);
  return (
    <div className="space-y-3">
      {!finished && connection !== "open" && (
        <p className="text-xs text-[var(--ink-muted)]">
          {connection === "reconnecting" ? text.reconnecting : text.connecting}
        </p>
      )}
      {finished && job.items.length > 0 && <JobOutcomeList job={job} lang={lang} text={text} />}
      {!finished && (
        <LiveJobItemList
          job={job}
          items={items}
          lang={lang}
          text={text}
          needsAudio={taskType?.needsAudio ?? false}
          needsImage={taskType?.needsImage ?? false}
        />
      )}
    </div>
  );
};
