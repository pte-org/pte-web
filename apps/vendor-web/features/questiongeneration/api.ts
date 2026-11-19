"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  ApiError,
  createQuestionGenerationJob,
  getQuestionGenerationPresets,
  listQuestionGenerationBatches,
  type QuestionGenerationBatchResponse,
  type QuestionGenerationPreset,
  getQuestionGenerationJob,
  getQuestionGenerationTaskTypes,
  getQuestionGenerationQuota,
  updateQuestionGenerationJobStatus,
  type QuestionGenerationJobCreateRequest,
  type QuestionGenerationJobResponse,
  type QuestionGenerationQuotaResponse,
  type QuestionGenerationTaskTypeResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import {
  GENERATION_JOBS_QUERY_KEY,
  GENERATION_QUOTA_QUERY_KEY,
  GENERATION_TASK_TYPES_QUERY_KEY,
} from "./constants";
import {
  GENERATION_OPEN_BATCH_QUERY_KEY,
  GENERATION_PRESETS_QUERY_KEY,
  GENERATION_STATIC_STALE_MS,
} from "./dialogConstants";

const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const OPEN_BATCH_LOOKUP_SIZE = 5;
const OPEN_BATCH_STATUSES: readonly string[] = ["QUEUED", "RUNNING", "CANCELLING"];

export function useCreateQuestionGenerationJob(): UseMutationResult<
  QuestionGenerationJobResponse,
  Error,
  QuestionGenerationJobCreateRequest,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuestionGenerationJobCreateRequest) =>
      createQuestionGenerationJob(apiClient, payload),
    onSuccess: () => {
      // Invalidate job list to refresh
      queryClient.invalidateQueries({
        queryKey: [GENERATION_JOBS_QUERY_KEY],
      });
    },
  });
}

export function useQuestionGenerationJob(
  jobId: string | null,
): UseQueryResult<QuestionGenerationJobResponse, Error> {
  return useQuery({
    queryKey: [GENERATION_JOBS_QUERY_KEY, jobId],
    queryFn: () => getQuestionGenerationJob(apiClient, jobId!),
    enabled: !!jobId,
  });
}

export function useQuestionGenerationTaskTypes(): UseQueryResult<
  QuestionGenerationTaskTypeResponse[],
  Error
> {
  return useQuery({
    queryKey: [GENERATION_TASK_TYPES_QUERY_KEY],
    queryFn: () => getQuestionGenerationTaskTypes(apiClient),
    staleTime: GENERATION_STATIC_STALE_MS,
  });
}

export function useQuestionGenerationQuota(): UseQueryResult<
  QuestionGenerationQuotaResponse,
  Error
> {
  return useQuery({
    queryKey: [GENERATION_QUOTA_QUERY_KEY],
    queryFn: () => getQuestionGenerationQuota(apiClient),
  });
}

export function useCancelQuestionGenerationJob(): UseMutationResult<
  QuestionGenerationJobResponse,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) =>
      updateQuestionGenerationJobStatus(apiClient, jobId, { action: "CANCEL" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GENERATION_JOBS_QUERY_KEY],
      });
    },
  });
}

/** The active template's presets; a server without the endpoint or a refused caller just means "no presets". */
export async function loadPresets(): Promise<QuestionGenerationPreset[]> {
  try {
    return await getQuestionGenerationPresets(apiClient);
  } catch (error) {
    if (error instanceof ApiError && (error.status === HTTP_FORBIDDEN || error.status === HTTP_NOT_FOUND)) return [];
    throw error;
  }
}

export function useQuestionGenerationPresets(): UseQueryResult<QuestionGenerationPreset[], Error> {
  return useQuery({
    queryKey: [GENERATION_PRESETS_QUERY_KEY],
    queryFn: loadPresets,
    staleTime: GENERATION_STATIC_STALE_MS,
    retry: false,
  });
}

/** The caller's open batch, read only after the server said one blocks a new run (to link to it). */
export function useOpenGenerationBatch(enabled: boolean): UseQueryResult<QuestionGenerationBatchResponse | null, Error> {
  return useQuery({
    queryKey: [GENERATION_OPEN_BATCH_QUERY_KEY],
    queryFn: async () => {
      const page = await listQuestionGenerationBatches(apiClient, { page: 0, size: OPEN_BATCH_LOOKUP_SIZE, mine: true });
      return page.data.find((batch) => OPEN_BATCH_STATUSES.includes(batch.status)) ?? null;
    },
    enabled,
    retry: false,
  });
}
