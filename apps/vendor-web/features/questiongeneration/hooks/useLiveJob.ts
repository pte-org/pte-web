"use client";

import { useEffect, useReducer, useState } from "react";
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
import { applyLiveEvent, type LiveItems } from "../utils/liveItems";

export type LiveConnection = "connecting" | "open" | "reconnecting" | "closed";

export interface LiveJob {
  job: UseQueryResult<QuestionGenerationJobResponse, Error>;
  items: LiveItems;
  connection: LiveConnection;
}

type Action = { type: "event"; event: QuestionGenerationLiveEvent } | { type: "reset" };

const reduce = (items: LiveItems, action: Action): LiveItems =>
  action.type === "reset" ? {} : applyLiveEvent(items, action.event);

const isActive = (job: QuestionGenerationJobResponse | undefined): boolean =>
  job === undefined || ACTIVE_JOB_STATUSES.includes(job.status);

/**
 * Follows a generation job: the job itself is reloaded while it runs (counts and the outcome of each question), and
 * the text the agents write arrives on a stream that is opened again when it drops. Both stop when the job ends.
 * The stream is closed with the page, so leaving it never keeps a connection open.
 */
export function useLiveJob(jobId: string | null): LiveJob {
  const [items, dispatch] = useReducer(reduce, {});
  const [connection, setConnection] = useState<LiveConnection>("connecting");

  const job = useQuery({
    queryKey: [GENERATION_JOBS_QUERY_KEY, jobId],
    queryFn: () => getQuestionGenerationJob(apiClient, jobId as string),
    enabled: jobId !== null,
    refetchInterval: (query) => (isActive(query.state.data) ? LIVE_JOB_REFRESH_MS : false),
  });
  const running = jobId !== null && isActive(job.data);

  useEffect(() => {
    if (!running || jobId === null) return;
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
        },
        abort.signal,
      )
        .catch(() => undefined)
        .finally(() => {
          if (abort.signal.aborted) return;
          if (ended) {
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
  }, [jobId, running]);

  return { job, items, connection };
}
