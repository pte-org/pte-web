"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type Query,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  cancelQuestionGenerationBatch,
  createQuestionGenerationBatch,
  getQuestionGenerationBatch,
  type QuestionGenerationBatchCreateRequest,
  type QuestionGenerationBatchResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { GENERATION_JOBS_QUERY_KEY, GENERATION_QUOTA_QUERY_KEY } from "../questiongeneration/constants";
import {
  BATCHES_QUERY_KEY,
  BATCH_POLL_HIDDEN_MS,
  BATCH_POLL_VISIBLE_MS,
  TERMINAL_BATCH_STATUSES,
} from "./constants";

export const batchDetailKey = (id: string): readonly unknown[] => [BATCHES_QUERY_KEY, "detail", id];

/** 5 s while the batch is open and the tab visible, 15 s when hidden, none once it ended. */
export function batchPollInterval(
  batch: QuestionGenerationBatchResponse | undefined,
  hidden: boolean,
): number | false {
  if (batch && TERMINAL_BATCH_STATUSES.includes(batch.status)) return false;
  return hidden ? BATCH_POLL_HIDDEN_MS : BATCH_POLL_VISIBLE_MS;
}

const isTabHidden = (): boolean => typeof document !== "undefined" && document.visibilityState === "hidden";

export function useQuestionGenerationBatch(id: string): UseQueryResult<QuestionGenerationBatchResponse, Error> {
  return useQuery({
    queryKey: batchDetailKey(id),
    queryFn: () => getQuestionGenerationBatch(apiClient, id),
    refetchInterval: (query: Query<QuestionGenerationBatchResponse, Error>) =>
      batchPollInterval(query.state.data, isTabHidden()),
    refetchIntervalInBackground: true,
  });
}

export function useCreateQuestionGenerationBatch(): UseMutationResult<
  QuestionGenerationBatchResponse,
  Error,
  QuestionGenerationBatchCreateRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: QuestionGenerationBatchCreateRequest) => createQuestionGenerationBatch(apiClient, payload),
    onSuccess: (batch) => {
      queryClient.setQueryData(batchDetailKey(batch.publicId), batch);
      void queryClient.invalidateQueries({ queryKey: [BATCHES_QUERY_KEY, "list"] });
      void queryClient.invalidateQueries({ queryKey: [GENERATION_QUOTA_QUERY_KEY] });
    },
  });
}

export function useCancelQuestionGenerationBatch(): UseMutationResult<QuestionGenerationBatchResponse, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelQuestionGenerationBatch(apiClient, id),
    onSuccess: (batch) => {
      queryClient.setQueryData(batchDetailKey(batch.publicId), batch);
      void queryClient.invalidateQueries({ queryKey: [BATCHES_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [GENERATION_JOBS_QUERY_KEY] });
      // Children cancelled before they started are refunded.
      void queryClient.invalidateQueries({ queryKey: [GENERATION_QUOTA_QUERY_KEY] });
    },
  });
}

