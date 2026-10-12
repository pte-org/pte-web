"use client";

import {
  getExaminerAttemptWork,
  listExaminerWork,
  submitExaminerScore,
  type ExaminerQueueStatus,
  type SubmitExaminerScoreRequest,
} from "@pte/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionManager } from "@pte/ui";
import { apiClient } from "@/lib/apiClient";
import { EXAMINER_ATTEMPT_QUERY_KEY, EXAMINER_QUEUE_QUERY_KEY } from "./constants";

export function useExaminerQueue(status: ExaminerQueueStatus, page: number) {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId ?? "default";

  return useQuery({
    queryKey: [...EXAMINER_QUEUE_QUERY_KEY, tenantId, status, page],
    queryFn: () => listExaminerWork(apiClient, { status, page, size: 20 }),
  });
}

export function useExaminerAttempt(sessionPublicId: string, attemptPublicId: string) {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId ?? "default";

  return useQuery({
    queryKey: [...EXAMINER_ATTEMPT_QUERY_KEY, tenantId, sessionPublicId, attemptPublicId],
    queryFn: () => getExaminerAttemptWork(apiClient, sessionPublicId, attemptPublicId),
    enabled: sessionPublicId.length > 0 && attemptPublicId.length > 0,
    refetchOnWindowFocus: false,
  });
}

export function useSubmitExaminerScore(sessionPublicId: string, attemptPublicId: string) {
  const queryClient = useQueryClient();
  const { session } = useSessionManager();
  const tenantId = session?.tenantId ?? "default";

  return useMutation({
    mutationFn: ({
      answerPublicId,
      payload,
    }: {
      answerPublicId: string;
      payload: SubmitExaminerScoreRequest;
    }) => submitExaminerScore(apiClient, answerPublicId, payload),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...EXAMINER_ATTEMPT_QUERY_KEY, tenantId, sessionPublicId, attemptPublicId],
        }),
        queryClient.invalidateQueries({
          queryKey: [...EXAMINER_QUEUE_QUERY_KEY, tenantId],
        }),
      ]);
    },
  });
}
