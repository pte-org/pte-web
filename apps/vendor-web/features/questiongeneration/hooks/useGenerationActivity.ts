"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getQuestionGenerationBatch,
  listQuestionGenerationBatches,
  listQuestionGenerationJobs,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { GENERATION_JOBS_QUERY_KEY } from "../constants";
import {
  ACTIVITY_BUSY_POLL_MS,
  ACTIVITY_IDLE_POLL_MS,
  ACTIVITY_JOB_PAGE_SIZE,
  batchDetailHref,
  generationLiveHref,
} from "../liveConstants";
import {
  OPEN_BATCH_STATUSES,
  pickGenerationActivity,
  type GenerationActivity,
} from "../utils/generationActivity";

const ACTIVITY_QUERY_KEY = "generationActivity";

async function loadActivity(): Promise<GenerationActivity | null> {
  // The job list hides batch children, so an open batch is looked up on its own; its detail has live counts.
  const [jobs, batches] = await Promise.all([
    listQuestionGenerationJobs(apiClient, 0, ACTIVITY_JOB_PAGE_SIZE),
    listQuestionGenerationBatches(apiClient, { page: 0, size: ACTIVITY_JOB_PAGE_SIZE, mine: true }),
  ]);
  const openBatch = batches.data.find((batch) => OPEN_BATCH_STATUSES.includes(batch.status));
  const batch = openBatch ? await getQuestionGenerationBatch(apiClient, openBatch.publicId) : null;
  return pickGenerationActivity(jobs.data, batch, {
    job: generationLiveHref,
    batch: batchDetailHref,
  });
}

/**
 * What the AI is generating now (an open batch first, else the newest running job), for the header indicator on every
 * page. It looks every few seconds while something runs and less often otherwise; the browser pauses it in a hidden tab.
 */
export function useGenerationActivity(enabled: boolean): GenerationActivity | null {
  const { data } = useQuery({
    queryKey: [GENERATION_JOBS_QUERY_KEY, ACTIVITY_QUERY_KEY],
    queryFn: loadActivity,
    enabled,
    refetchInterval: (query) => (query.state.data ? ACTIVITY_BUSY_POLL_MS : ACTIVITY_IDLE_POLL_MS),
  });
  return data ?? null;
}
