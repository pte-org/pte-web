"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  finalizeGradingCohort,
  getGradingCohortPreview,
  type FinalizeGradingCohortRequest,
  type GradingCohortPreviewResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";

export const GRADING_COHORT_QUERY_KEY = ["gradingCohort"] as const;

async function requestWithProtectedCache<T>(
  request: () => Promise<T>,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiError && error.kind === "unauthorized") queryClient.clear();
    throw error;
  }
}

export function useGradingCohortPreview(sessionPublicId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  return useQuery<GradingCohortPreviewResponse>({
    queryKey: [...GRADING_COHORT_QUERY_KEY, sessionPublicId],
    queryFn: () =>
      requestWithProtectedCache(
        () => getGradingCohortPreview(apiClient, sessionPublicId),
        queryClient,
      ),
    enabled: enabled && sessionPublicId.length > 0,
    retry: false,
  });
}

export function useFinalizeGradingCohort(sessionPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FinalizeGradingCohortRequest) =>
      requestWithProtectedCache(
        () => finalizeGradingCohort(apiClient, sessionPublicId, payload),
        queryClient,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...GRADING_COHORT_QUERY_KEY, sessionPublicId],
      });
    },
  });
}
