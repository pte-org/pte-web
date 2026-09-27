"use client";

import {
  getExaminerAttemptWork,
  listExaminerWork,
  submitExaminerScore,
  type ExaminerQueueStatus,
} from "@pte/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { EXAMINER_ATTEMPT_QUERY_KEY, EXAMINER_QUEUE_QUERY_KEY } from "./constants";

export function useExaminerQueue(status: ExaminerQueueStatus, page: number) {
  return useQuery({
    queryKey: [...EXAMINER_QUEUE_QUERY_KEY, status, page],
    queryFn: () => listExaminerWork(apiClient, { status, page, size: 20 }),
  });
}

export function useExaminerAttempt(sessionPublicId: string, attemptPublicId: string) {
  return useQuery({
    queryKey: [...EXAMINER_ATTEMPT_QUERY_KEY, sessionPublicId, attemptPublicId],
    queryFn: () => getExaminerAttemptWork(apiClient, sessionPublicId, attemptPublicId),
    enabled: sessionPublicId.length > 0 && attemptPublicId.length > 0,
  });
}

export function useSubmitExaminerScore(sessionPublicId: string, attemptPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ answerPublicId, score }: { answerPublicId: string; score: number }) =>
      submitExaminerScore(apiClient, answerPublicId, { score }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...EXAMINER_ATTEMPT_QUERY_KEY, sessionPublicId, attemptPublicId],
        }),
        queryClient.invalidateQueries({ queryKey: EXAMINER_QUEUE_QUERY_KEY }),
      ]);
    },
  });
}
