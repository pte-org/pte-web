"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createQuestionGenerationJob,
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
