"use client";

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { rescoreSession } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { ANSWERS_QUERY_KEY, HOST_SCORE_REVIEW_QUERY_KEY } from "../constants";
import { ATTEMPT_REVIEWS_QUERY_KEY } from "../constants/attemptReviews";

/** Re-queues the exam's failed and stuck AI answers, then refreshes the review and answer lists. */
export function useRescoreSession(sessionPublicId: string): UseMutationResult<void, unknown, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => rescoreSession(apiClient, sessionPublicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...HOST_SCORE_REVIEW_QUERY_KEY, sessionPublicId],
      });
      void queryClient.invalidateQueries({ queryKey: [...ANSWERS_QUERY_KEY, sessionPublicId] });
      void queryClient.invalidateQueries({
        queryKey: [...ATTEMPT_REVIEWS_QUERY_KEY, sessionPublicId],
      });
    },
  });
}
