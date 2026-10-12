"use client";

import {
  decodeAccessTokenClaims,
  getExaminerAttemptWork,
  getExaminerWorkspaceOverview,
  listExaminerWork,
  submitExaminerScore,
  type ExaminerQueueStatus,
  type ExaminerWorkspaceOverviewResponse,
  type SubmitExaminerScoreRequest,
} from "@pte/api-client";
import { useMutation, useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { useSessionManager } from "@pte/ui";
import { apiClient } from "@/lib/apiClient";
import { EXAMINER_QUERY_KEYS } from "./queryKeys";

export function useExaminerOverview(): UseQueryResult<ExaminerWorkspaceOverviewResponse> {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const isReady = Boolean(tenantId && actorId);

  return useQuery<ExaminerWorkspaceOverviewResponse>({
    queryKey: isReady
      ? EXAMINER_QUERY_KEYS.overview(tenantId!, actorId!)
      : (["examiner", "unauthenticated", "overview"] as const),
    queryFn: () => getExaminerWorkspaceOverview(apiClient),
    enabled: isReady,
    staleTime: 30_000,
  });
}

export function useExaminerQueue(status: ExaminerQueueStatus, page: number) {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const isReady = Boolean(tenantId && actorId);

  return useQuery({
    queryKey: isReady
      ? EXAMINER_QUERY_KEYS.queue(tenantId!, actorId!, { status, page, size: 20 })
      : (["examiner", "unauthenticated", "queue"] as const),
    queryFn: () => listExaminerWork(apiClient, { status, page, size: 20 }),
    enabled: isReady,
    staleTime: 30_000,
  });
}

export function useExaminerAttempt(sessionPublicId: string, attemptPublicId: string) {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const isReady = Boolean(tenantId && actorId && sessionPublicId && attemptPublicId);

  return useQuery({
    queryKey: isReady
      ? EXAMINER_QUERY_KEYS.attempt(tenantId!, actorId!, sessionPublicId, attemptPublicId)
      : (["examiner", "unauthenticated", "attempt"] as const),
    queryFn: () => getExaminerAttemptWork(apiClient, sessionPublicId, attemptPublicId),
    enabled: isReady,
    refetchOnWindowFocus: false,
  });
}

export function useSubmitExaminerScore(sessionPublicId: string, attemptPublicId: string) {
  const queryClient = useQueryClient();
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;

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
      if (tenantId && actorId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: EXAMINER_QUERY_KEYS.attempt(tenantId, actorId, sessionPublicId, attemptPublicId),
          }),
          queryClient.invalidateQueries({
            queryKey: EXAMINER_QUERY_KEYS.queuePrefix(tenantId, actorId),
          }),
          queryClient.invalidateQueries({
            queryKey: EXAMINER_QUERY_KEYS.overview(tenantId, actorId),
          }),
        ]);
      }
    },
  });
}
