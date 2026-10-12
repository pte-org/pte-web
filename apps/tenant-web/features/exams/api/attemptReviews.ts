"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { listAttemptReviews, type AttemptReviewItemResponse } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { ATTEMPT_REVIEWS_QUERY_KEY } from "../constants/attemptReviews";

/** One row per attempt of a session, with its answers' scoring progress. */
export function useAttemptReviews(
  sessionPublicId: string,
): UseQueryResult<AttemptReviewItemResponse[]> {
  return useQuery({
    queryKey: [...ATTEMPT_REVIEWS_QUERY_KEY, sessionPublicId],
    queryFn: () => listAttemptReviews(apiClient, sessionPublicId),
    enabled: sessionPublicId.length > 0,
  });
}
