"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  followQuestionGenerationJob,
  getQuestionGenerationJob,
  type QuestionGenerationJobResponse,
  type QuestionGenerationLiveEvent,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { GENERATION_JOBS_QUERY_KEY } from "../constants";
import {
  ACTIVE_JOB_STATUSES,
  LIVE_JOB_REFRESH_MS,
  LIVE_RECONNECT_DELAY_MS,
} from "../liveConstants";
import {
  EMPTY_SCRIPT,
  extendScript,
  outcomeOfStage,
  reasonFor,
  settleOutcome,
  type ItemOutcome,
  type Script,
  type SettleReason,
} from "../replay";
import { applyLiveEvent, type LiveItems } from "../utils/liveItems";

export type LiveConnection = "connecting" | "open" | "reconnecting" | "closed";

export interface LiveJob {
  job: UseQueryResult<QuestionGenerationJobResponse, Error>;
  items: LiveItems;
  /** The steps of each question in the order they ran (see `replay/`); only ever grows while the job is open. */
  script: Script;
  connection: LiveConnection;
}

type Action = { type: "event"; event: QuestionGenerationLiveEvent } | { type: "reset" };

const reduce = (items: LiveItems, action: Action): LiveItems =>
  action.type === "reset" ? {} : applyLiveEvent(items, action.event);

type ScriptAction =
  | { type: "event"; event: QuestionGenerationLiveEvent; saveQuestions: boolean }
  | { type: "outcome"; index: number; outcome: ItemOutcome; reason: SettleReason }
  | { type: "reset" };

const reduceScript = (script: Script, action: ScriptAction): Script => {
  switch (action.type) {
    case "reset":
      return EMPTY_SCRIPT;
    case "outcome":
      return settleOutcome(script, action.index, action.outcome, action.reason);
    case "event":
      return extendScript(script, action.event, { saveQuestions: action.saveQuestions });
  }
};

const isActive = (job: QuestionGenerationJobResponse | undefined): boolean =>
  job === undefined || ACTIVE_JOB_STATUSES.includes(job.status);

/**
 * Follows a generation job: the job itself is reloaded while it runs (counts and the outcome of each question), and
 * the text the agents write arrives on a stream that is opened again when it drops. Both stop when the job ends.
 * A job already finished is read once from the stream, which still holds its last snapshot for a while, so reopening
 * it shows what its agents made; that read is never retried.
 * The stream is closed with the page, so leaving it never keeps a connection open.
 */
export function useLiveJob(jobId: string | null): LiveJob {
  const [items, dispatch] = useReducer(reduce, {});
  const [script, dispatchScript] = useReducer(reduceScript, EMPTY_SCRIPT);
  const [connection, setConnection] = useState<LiveConnection>("connecting");
  const saveQuestions = useRef(true);

  const job = useQuery({
    queryKey: [GENERATION_JOBS_QUERY_KEY, jobId],
    queryFn: () => getQuestionGenerationJob(apiClient, jobId as string),
    enabled: jobId !== null,
    refetchInterval: (query) => (isActive(query.state.data) ? LIVE_JOB_REFRESH_MS : false),
  });
  const savesQuestions = job.data?.saveQuestions !== false;
  useEffect(() => {
    saveQuestions.current = savesQuestions;
  }, [savesQuestions]);
  const running = jobId !== null && isActive(job.data);
  // Known only once the job is loaded, so a finished job is not first followed as a running one.
  const mode = jobId === null || job.data === undefined ? null : running ? "follow" : "once";

  // The script is never reset by a reconnect (the connection effect below), only by opening another job.
  useEffect(() => dispatchScript({ type: "reset" }), [jobId]);

  // The job record says how each question ended (the stream never does). It is added to the script only once the
  // stream has delivered everything before it, so the end cannot be shown ahead of the steps.
  const records = job.data?.items;
  const jobTerminal = job.data !== undefined && !ACTIVE_JOB_STATUSES.includes(job.data.status);
  useEffect(() => {
    if (!records) return;
    const reason = reasonFor({
      streamEnded: script.streamEnded,
      closed: connection === "closed",
      jobTerminal,
    });
    for (const record of records) {
      const outcome = outcomeOfStage(record.stage);
      if (outcome) dispatchScript({ type: "outcome", index: record.index, outcome, reason });
    }
  }, [records, script.streamEnded, connection, jobTerminal]);

  useEffect(() => {
    if (mode === null || jobId === null) return;
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ended = false;

    const connect = (): void => {
      setConnection((current) => (current === "open" ? "reconnecting" : current));
      followQuestionGenerationJob(
        apiClient,
        jobId,
        (event) => {
          if (event.type === "snapshot") setConnection("open");
          if (event.type === "end") ended = true;
          dispatch({ type: "event", event });
          dispatchScript({ type: "event", event, saveQuestions: saveQuestions.current });
        },
        abort.signal,
      )
        .catch(() => undefined)
        .finally(() => {
          if (abort.signal.aborted) return;
          if (ended || mode === "once") {
            setConnection("closed");
            return;
          }
          setConnection("reconnecting");
          timer = setTimeout(connect, LIVE_RECONNECT_DELAY_MS);
        });
    };

    dispatch({ type: "reset" });
    connect();
    return () => {
      abort.abort();
      if (timer) clearTimeout(timer);
    };
  }, [jobId, mode]);

  return { job, items, script, connection };
}
