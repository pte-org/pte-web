"use client";

import {
  changePromptVersionStatus,
  getPromptVersion,
  getPromptWorkspace,
  savePromptProposal,
  testPromptVersion,
  getAiStatus,
  getGenerationStats,
  getPromptCatalog,
  getPromptDocument,
  listQuestionGenerationJobs,
  type AiStatusResponse,
  type GenerationStatsResponse,
  type PagedResult,
  type PromptCatalogResponse,
  type PromptCategory,
  type PromptDocument,
  type PromptProposalRequest,
  type PromptStatusRequest,
  type PromptTestResponse,
  type PromptVersionResponse,
  type PromptWorkspaceResponse,
  type QuestionGenerationJobResponse,
} from "@pte/api-client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { DateRangeValue } from "@pte/ui";
import { apiClient } from "@/lib/apiClient";
import { AI_ADMIN_QUERY_KEY, RECENT_JOB_COUNT } from "./constants";
import { PROMPT_QUERY_KEY } from "./promptConstants";
import { PROMPT_VERSIONS_QUERY_KEY } from "./promptEditConstants";

export function useAiStatus(): UseQueryResult<AiStatusResponse> {
  return useQuery({
    queryKey: [...AI_ADMIN_QUERY_KEY, "status"],
    queryFn: () => getAiStatus(apiClient),
  });
}

export function usePromptCatalog(): UseQueryResult<PromptCatalogResponse> {
  return useQuery({
    queryKey: PROMPT_QUERY_KEY,
    queryFn: () => getPromptCatalog(apiClient),
  });
}

export function usePromptDocument(category: PromptCategory, key: string): UseQueryResult<PromptDocument> {
  return useQuery({
    queryKey: [...PROMPT_QUERY_KEY, category, key],
    queryFn: () => getPromptDocument(apiClient, category, key),
  });
}

export function useGenerationStats(range: DateRangeValue): UseQueryResult<GenerationStatsResponse> {
  return useQuery({
    queryKey: [...AI_ADMIN_QUERY_KEY, "generation-stats", range.from, range.to],
    queryFn: () => getGenerationStats(apiClient, range),
    placeholderData: keepPreviousData,
  });
}

export function useRecentGenerationJobs(): UseQueryResult<PagedResult<QuestionGenerationJobResponse>> {
  return useQuery({
    queryKey: [...AI_ADMIN_QUERY_KEY, "recent-jobs"],
    queryFn: () => listQuestionGenerationJobs(apiClient, 0, RECENT_JOB_COUNT),
  });
}

/** The version in use, its open proposal and the accepted changes of one prompt. */
export function usePromptWorkspace(category: PromptCategory, key: string): UseQueryResult<PromptWorkspaceResponse> {
  return useQuery({
    queryKey: [...PROMPT_VERSIONS_QUERY_KEY, "workspace", category, key],
    queryFn: () => getPromptWorkspace(apiClient, category, key),
  });
}

/** One version; with no id (nothing chosen yet) nothing is requested. */
export function usePromptVersion(versionId: string | undefined): UseQueryResult<PromptVersionResponse> {
  return useQuery({
    queryKey: [...PROMPT_VERSIONS_QUERY_KEY, "version", versionId],
    queryFn: () => getPromptVersion(apiClient, versionId ?? ""),
    enabled: Boolean(versionId),
  });
}

/** Whatever changes a proposal also changes the page, the live prompt and the catalog, so all are reloaded. */
function useRefreshPrompts(): () => Promise<void> {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: PROMPT_VERSIONS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: PROMPT_QUERY_KEY }),
    ]);
  };
}

export function useSavePromptProposal(category: PromptCategory, key: string): UseMutationResult<PromptVersionResponse, Error, PromptProposalRequest> {
  const refresh = useRefreshPrompts();
  return useMutation({
    mutationFn: (request) => savePromptProposal(apiClient, category, key, request),
    onSuccess: refresh,
  });
}

export function useTestPromptVersion(versionId: string): UseMutationResult<PromptTestResponse, Error, void> {
  const refresh = useRefreshPrompts();
  return useMutation({
    mutationFn: () => testPromptVersion(apiClient, versionId),
    onSettled: refresh,
  });
}

export function useChangePromptStatus(versionId: string): UseMutationResult<PromptVersionResponse, Error, PromptStatusRequest> {
  const refresh = useRefreshPrompts();
  return useMutation({
    mutationFn: (request) => changePromptVersionStatus(apiClient, versionId, request),
    onSuccess: refresh,
  });
}
