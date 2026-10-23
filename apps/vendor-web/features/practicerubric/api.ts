"use client";

import {
  clonePracticeRubric,
  createPracticeRubric,
  diffPracticeRubrics,
  getPracticeRubric,
  getPracticeRubricReadiness,
  listPracticeRubrics,
  overridePublishPracticeRubric,
  publishPracticeRubric,
  rejectPracticeRubric,
  replacePracticeRubricDocument,
  retirePracticeRubric,
  submitPracticeRubricApproval,
  type CreatePracticeRubricRequest,
  type PracticeRubricDiffResponse,
  type PracticeRubricListParams,
  type PracticeRubricPage,
  type PracticeRubricResponse,
  type PracticeRubricReadinessResponse,
  type PublishPracticeRubricRequest,
  type RejectPracticeRubricRequest,
  type ReplacePracticeRubricDocumentRequest,
} from "@pte/api-client";
import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { PRACTICE_RUBRIC_QUERY_KEY, PRACTICE_RUBRICS_QUERY_KEY } from "./constants";

export function usePracticeRubrics(params: PracticeRubricListParams = {}): UseQueryResult<PracticeRubricPage> {
  return useQuery({
    queryKey: [...PRACTICE_RUBRICS_QUERY_KEY, params],
    queryFn: () => listPracticeRubrics(apiClient, params),
  });
}

export function usePracticeRubric(publicId: string): UseQueryResult<PracticeRubricResponse> {
  return useQuery({
    queryKey: [...PRACTICE_RUBRIC_QUERY_KEY, publicId],
    queryFn: () => getPracticeRubric(apiClient, publicId),
    enabled: publicId.length > 0,
  });
}

export function useCreatePracticeRubric(): UseMutationResult<PracticeRubricResponse, unknown, CreatePracticeRubricRequest> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createPracticeRubric(apiClient, payload),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: PRACTICE_RUBRICS_QUERY_KEY }); },
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>, publicId: string): void {
  void queryClient.invalidateQueries({ queryKey: PRACTICE_RUBRICS_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: [...PRACTICE_RUBRIC_QUERY_KEY, publicId] });
  void queryClient.invalidateQueries({ queryKey: [...PRACTICE_RUBRIC_QUERY_KEY, publicId, "readiness"] });
}

export function useClonePracticeRubric(): UseMutationResult<PracticeRubricResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => clonePracticeRubric(apiClient, publicId),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: PRACTICE_RUBRICS_QUERY_KEY }); },
  });
}

interface DocumentInput { publicId: string; payload: ReplacePracticeRubricDocumentRequest }
export function useReplacePracticeRubricDocument(): UseMutationResult<PracticeRubricResponse, unknown, DocumentInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => replacePracticeRubricDocument(apiClient, publicId, payload),
    onSuccess: (_data, { publicId }) => invalidate(queryClient, publicId),
    onError: (_error, { publicId }) => invalidate(queryClient, publicId),
  });
}

export function useSubmitPracticeRubricApproval(): UseMutationResult<PracticeRubricResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => submitPracticeRubricApproval(apiClient, publicId),
    onSuccess: (_data, publicId) => invalidate(queryClient, publicId),
    onError: (_error, publicId) => invalidate(queryClient, publicId),
  });
}

interface RejectInput { publicId: string; payload: RejectPracticeRubricRequest }
export function useRejectPracticeRubric(): UseMutationResult<PracticeRubricResponse, unknown, RejectInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => rejectPracticeRubric(apiClient, publicId, payload),
    onSuccess: (_data, { publicId }) => invalidate(queryClient, publicId),
    onError: (_error, { publicId }) => invalidate(queryClient, publicId),
  });
}

interface PublishInput { publicId: string; payload: PublishPracticeRubricRequest }
export function usePublishPracticeRubric(): UseMutationResult<PracticeRubricResponse, unknown, PublishInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => publishPracticeRubric(apiClient, publicId, payload),
    onSuccess: (_data, { publicId }) => invalidate(queryClient, publicId),
    onError: (_error, { publicId }) => invalidate(queryClient, publicId),
  });
}

export function useOverridePublishPracticeRubric(): UseMutationResult<PracticeRubricResponse, unknown, PublishInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => overridePublishPracticeRubric(apiClient, publicId, payload),
    onSuccess: (_data, { publicId }) => invalidate(queryClient, publicId),
    onError: (_error, { publicId }) => invalidate(queryClient, publicId),
  });
}

interface RetireInput { publicId: string; expectedVersion?: number | null }
export function useRetirePracticeRubric(): UseMutationResult<PracticeRubricResponse, unknown, RetireInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, expectedVersion }) => retirePracticeRubric(apiClient, publicId, expectedVersion),
    onSuccess: (_data, { publicId }) => invalidate(queryClient, publicId),
    onError: (_error, { publicId }) => invalidate(queryClient, publicId),
  });
}

export function usePracticeRubricReadiness(publicId: string): UseQueryResult<PracticeRubricReadinessResponse> {
  return useQuery({
    queryKey: [...PRACTICE_RUBRIC_QUERY_KEY, publicId, "readiness"],
    queryFn: () => getPracticeRubricReadiness(apiClient, publicId),
    enabled: publicId.length > 0,
  });
}

export function usePracticeRubricDiff(publicId: string, otherPublicId: string): UseQueryResult<PracticeRubricDiffResponse> {
  return useQuery({
    queryKey: [...PRACTICE_RUBRIC_QUERY_KEY, publicId, "diff", otherPublicId],
    queryFn: () => diffPracticeRubrics(apiClient, publicId, otherPublicId),
    enabled: publicId.length > 0 && otherPublicId.length > 0,
  });
}
