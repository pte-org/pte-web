"use client";

import { useCallback, useState } from "react";
import type { QuestionGenerationBatchResponse } from "@pte/api-client";
import { TERMINAL_BATCH_STATUSES } from "../constants";
import { focusedJobId, nextJobId, previousJobId, unseenJobIds } from "../utils/jobExpansion";

export interface BatchFocus {
  finished: boolean;
  focusedId: string | null;
  /** The results grid is shown instead of a job. */
  showResults: boolean;
  focus: (jobId: string | null) => void;
  nextId: string | null;
  previousId: string | null;
  unseen: ReadonlySet<string>;
  replayDone: boolean;
  setReplayDone: (done: boolean) => void;
}

/**
 * Which job the batch page shows. The first job followed is kept on screen whatever the server does next (the server
 * is often done long before the replay), and the page only moves to another job or to the results when asked to.
 */
export function useBatchFocus(batch: QuestionGenerationBatchResponse): BatchFocus {
  const [picked, setPicked] = useState<string | null>(null);
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  const [replay, setReplay] = useState({ jobId: null as string | null, done: false });
  const finished = TERMINAL_BATCH_STATUSES.includes(batch.status);
  const jobs = batch.children;
  // Opened while the batch runs: the job followed first is pinned. Opened after it ended: the results come first.
  const focusedId = finished ? picked : focusedJobId(jobs, picked, batch.currentJobPublicId);
  if (!finished && picked === null && focusedId !== null) setPicked(focusedId);
  if (focusedId !== null && !seen.has(focusedId)) setSeen(new Set(seen).add(focusedId));
  const focused = jobs.some((job) => job.jobPublicId === focusedId);
  // Stable per job: the live panel reports through it from an effect.
  const setReplayDone = useCallback(
    (done: boolean) =>
      setReplay((current) =>
        current.jobId === focusedId && current.done === done ? current : { jobId: focusedId, done },
      ),
    [focusedId],
  );

  return {
    finished,
    focusedId,
    showResults: finished && !focused,
    focus: setPicked,
    nextId: nextJobId(jobs, focusedId, seen),
    previousId: previousJobId(jobs, focusedId),
    unseen: unseenJobIds(jobs, seen),
    replayDone: replay.jobId === focusedId && replay.done,
    setReplayDone,
  };
}
