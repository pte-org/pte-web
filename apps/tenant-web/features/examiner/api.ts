"use client";

import {
  decodeAccessTokenClaims,
  finalizeExaminerWork,
  getExaminerAttemptWork,
  getExaminerGuidelines,
  getExaminerHistory,
  getExaminerIssues,
  getExaminerReports,
  getExaminerWorkspaceOverview,
  listExaminerWork,
  reportExaminerIssue,
  saveExaminerDraft,
  startExaminerWork,
  type ExaminerHistoryResponse,
  type ExaminerQueueStatus,
  type ExaminerReportsResponse,
  type ExaminerWorkspaceOverviewResponse,
  type FinalizeExaminerWorkRequest,
  type GetExaminerReportsParams,
  type ReportGradingIssueRequest,
  type SaveExaminerDraftRequest,
  type StartExaminerWorkRequest,
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

export function useExaminerReports(params: GetExaminerReportsParams = {}): UseQueryResult<ExaminerReportsResponse> {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const isReady = Boolean(tenantId && actorId);

  return useQuery<ExaminerReportsResponse>({
    queryKey: isReady
      ? EXAMINER_QUERY_KEYS.reports(tenantId!, actorId!, params)
      : (["examiner", "unauthenticated", "reports"] as const),
    queryFn: () => getExaminerReports(apiClient, params),
    enabled: isReady,
    staleTime: 30_000,
  });
}

export function useExaminerHistory(
  sessionPublicId: string,
  attemptPublicId: string,
  page = 0,
  size = 20,
): UseQueryResult<ExaminerHistoryResponse> {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const isReady = Boolean(tenantId && actorId && sessionPublicId && attemptPublicId);

  return useQuery<ExaminerHistoryResponse>({
    queryKey: isReady
      ? EXAMINER_QUERY_KEYS.history(tenantId!, actorId!, sessionPublicId, attemptPublicId, page, size)
      : (["examiner", "unauthenticated", "history"] as const),
    queryFn: () => getExaminerHistory(apiClient, sessionPublicId, attemptPublicId, page, size),
    enabled: isReady,
    staleTime: 10_000,
  });
}

export interface UseExaminerQueueParams {
  status?: ExaminerQueueStatus;
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  sessionPublicId?: string;
}

export function useExaminerQueue(
  paramsOrStatus: ExaminerQueueStatus | UseExaminerQueueParams,
  legacyPage = 0,
) {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const isReady = Boolean(tenantId && actorId);

  const params: UseExaminerQueueParams =
    typeof paramsOrStatus === "string"
      ? { status: paramsOrStatus, page: legacyPage, size: 20 }
      : { page: 0, size: 20, ...paramsOrStatus };

  return useQuery({
    queryKey: isReady
      ? EXAMINER_QUERY_KEYS.queue(tenantId!, actorId!, params)
      : (["examiner", "unauthenticated", "queue"] as const),
    queryFn: () => listExaminerWork(apiClient, params),
    enabled: isReady,
    staleTime: 30_000,
    retry: 1,
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

export function useStartExaminerWork(sessionPublicId: string, attemptPublicId: string) {
  const queryClient = useQueryClient();
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;

  return useMutation({
    mutationFn: (payload: StartExaminerWorkRequest) =>
      startExaminerWork(apiClient, sessionPublicId, attemptPublicId, payload),
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

export function useSaveExaminerDraft(sessionPublicId: string, attemptPublicId: string) {
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
      payload: SaveExaminerDraftRequest;
    }) =>
      saveExaminerDraft(apiClient, sessionPublicId, attemptPublicId, answerPublicId, payload),
    onSuccess: async () => {
      if (tenantId && actorId) {
        await queryClient.invalidateQueries({
          queryKey: EXAMINER_QUERY_KEYS.attempt(tenantId, actorId, sessionPublicId, attemptPublicId),
        });
      }
    },
  });
}

export function useFinalizeExaminerWork(sessionPublicId: string, attemptPublicId: string) {
  const queryClient = useQueryClient();
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;

  return useMutation({
    mutationFn: (payload: FinalizeExaminerWorkRequest) =>
      finalizeExaminerWork(apiClient, sessionPublicId, attemptPublicId, payload),
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

export function useExaminerGuidelines(sessionPublicId: string, attemptPublicId: string) {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const isReady = Boolean(tenantId && actorId && sessionPublicId && attemptPublicId);

  return useQuery({
    queryKey: isReady
      ? EXAMINER_QUERY_KEYS.guidelines(tenantId!, actorId!, sessionPublicId, attemptPublicId)
      : (["examiner", "unauthenticated", "guidelines"] as const),
    queryFn: () => getExaminerGuidelines(apiClient, sessionPublicId, attemptPublicId),
    enabled: isReady,
    staleTime: 60_000,
  });
}

export function useExaminerIssues(sessionPublicId: string, attemptPublicId: string) {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const isReady = Boolean(tenantId && actorId && sessionPublicId && attemptPublicId);

  return useQuery({
    queryKey: isReady
      ? EXAMINER_QUERY_KEYS.issues(tenantId!, actorId!, sessionPublicId, attemptPublicId)
      : (["examiner", "unauthenticated", "issues"] as const),
    queryFn: () => getExaminerIssues(apiClient, sessionPublicId, attemptPublicId),
    enabled: isReady,
  });
}

export function useReportExaminerIssue(sessionPublicId: string, attemptPublicId: string) {
  const queryClient = useQueryClient();
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;

  return useMutation({
    mutationFn: (payload: ReportGradingIssueRequest) =>
      reportExaminerIssue(apiClient, sessionPublicId, attemptPublicId, payload),
    onSuccess: async () => {
      if (tenantId && actorId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: EXAMINER_QUERY_KEYS.issues(tenantId, actorId, sessionPublicId, attemptPublicId),
          }),
          queryClient.invalidateQueries({
            queryKey: EXAMINER_QUERY_KEYS.attempt(tenantId, actorId, sessionPublicId, attemptPublicId),
          }),
        ]);
      }
    },
  });
}
