"use client";

import { useQuery } from "@tanstack/react-query";
import { listQuestionGenerationJobs, type QuestionGenerationJobResponse } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { GENERATION_JOBS_QUERY_KEY } from "../constants";
import {
  ACTIVE_JOB_STATUSES,
  ACTIVITY_BUSY_POLL_MS,
  ACTIVITY_IDLE_POLL_MS,
  ACTIVITY_JOB_PAGE_SIZE,
} from "../liveConstants";

const ACTIVITY_QUERY_KEY = "generationActivity";

/**
 * The generation job that is running now (the newest one), for the header indicator on every page. It looks every
 * few seconds while one runs and less often otherwise; the browser pauses it in a hidden tab.
 */
export function useGenerationActivity(enabled: boolean): QuestionGenerationJobResponse | null {
  const { data } = useQuery({
    queryKey: [GENERATION_JOBS_QUERY_KEY, ACTIVITY_QUERY_KEY],
    queryFn: () => listQuestionGenerationJobs(apiClient, 0, ACTIVITY_JOB_PAGE_SIZE),
    enabled,
    refetchInterval: (query) =>
      query.state.data?.data.some((job) => ACTIVE_JOB_STATUSES.includes(job.status))
        ? ACTIVITY_BUSY_POLL_MS
        : ACTIVITY_IDLE_POLL_MS,
  });
  return data?.data.find((job) => ACTIVE_JOB_STATUSES.includes(job.status)) ?? null;
}
