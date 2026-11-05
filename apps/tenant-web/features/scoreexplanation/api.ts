"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getScoreExplanation, type ScoreExplanationResponse } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { shouldRetryExplanation } from "./explanationView";
import { SCORE_EXPLANATION_QUERY_KEYS } from "./queryKeys";

/** One attempt's score explanation; the backend checks tenant (Host) and assignment (Examiner). */
export function useScoreExplanation(
  attemptPublicId: string,
): UseQueryResult<ScoreExplanationResponse> {
  return useQuery({
    queryKey: SCORE_EXPLANATION_QUERY_KEYS.attempt(attemptPublicId),
    queryFn: () => getScoreExplanation(apiClient, attemptPublicId),
    enabled: attemptPublicId.length > 0,
    retry: (failureCount: number, error: Error) => shouldRetryExplanation(failureCount, error),
  });
}
