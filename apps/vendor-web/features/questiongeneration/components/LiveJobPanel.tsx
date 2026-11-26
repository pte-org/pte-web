"use client";

import type { ReactElement } from "react";
import { Alert, Checkbox, Skeleton, useLocale } from "@pte/ui";
import { useQuestionGenerationTaskTypes } from "../api";
import { useLiveJob } from "../hooks/useLiveJob";
import { useSkipFinishedReplay } from "../hooks/useSkipFinishedReplay";
import { TYPING_TEXT } from "../typingConstants";
import { LIVE_TEXT, TERMINAL_JOB_STATUSES } from "../liveConstants";
import { JobOutcomeList } from "./_JobOutcomeList";
import { LiveJobItemList } from "./_LiveJobItemList";

interface LiveJobPanelProps {
  jobId: string;
  /** Told whether the replay of the question shown is over. */
  onReplayDone?: (done: boolean) => void;
}

/**
 * One generation job shown inside another page: its questions as the agents write them, replayed even after the job
 * ended while the stream still holds them; otherwise what it saved and why the rest failed. The job is followed only
 * while this panel is mounted.
 */
export const LiveJobPanel = ({ jobId, onReplayDone }: LiveJobPanelProps): ReactElement => {
  const { locale } = useLocale();
  const lang = locale === "vi" ? "vi" : "en";
  const text = LIVE_TEXT[lang];
  const { job: jobQuery, items, script, connection } = useLiveJob(jobId);
  const { data: taskTypes = [] } = useQuestionGenerationTaskTypes();
  const skipFinished = useSkipFinishedReplay();
  const job = jobQuery.data;

  if (jobQuery.isError) return <Alert tone="error">{text.jobLoadError}</Alert>;
  if (!job) return <Skeleton className="h-24 w-full" />;

  const finished = TERMINAL_JOB_STATUSES.includes(job.status);
  // The server is usually done long before the screen has replayed the question, so a job that ended keeps its live
  // view while the stream still holds its text; the outcome list is only for a job whose replay is no longer kept.
  const replayable = Object.keys(items).length > 0;
  const showLive = !finished || replayable;
  const taskType = taskTypes.find((type) => type.taskType === job.taskType);
  return (
    <div className="space-y-3">
      {!finished && connection !== "open" && (
        <p className="text-xs text-[var(--ink-muted)]">
          {connection === "reconnecting" ? text.reconnecting : text.connecting}
        </p>
      )}
      <Checkbox
        id="generation-skip-finished-replay"
        label={TYPING_TEXT[lang].skipFinished}
        checked={skipFinished.skip}
        onChange={(event) => skipFinished.setSkip(event.target.checked)}
      />
      {!showLive && job.items.length > 0 && <JobOutcomeList job={job} lang={lang} text={text} />}
      {showLive && (
        <LiveJobItemList
          job={job}
          items={items}
          lang={lang}
          text={text}
          needsAudio={taskType?.needsAudio ?? false}
          needsImage={taskType?.needsImage ?? false}
          onReplayDone={onReplayDone}
          jobId={jobId}
          script={script}
          skipFinished={skipFinished.skip}
        />
      )}
    </div>
  );
};
