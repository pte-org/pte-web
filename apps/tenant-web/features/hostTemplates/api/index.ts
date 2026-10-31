"use client";

import {
  activateHostExamTemplate,
  cloneHostExamTemplate,
  createHostExamTemplate,
  deleteHostExamTemplate,
  getHostExamTemplate,
  listHostExamTemplates,
  replaceHostExamTemplateItems,
  retireHostExamTemplate,
  suggestHostSkillWeights,
  type ReplaceScoreTemplateItemsRequest,
  type ScoreTemplateResponse,
  type SkillWeightSuggestionRequest,
  type SkillWeightSuggestionResponse,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { HOST_TEMPLATES_QUERY_KEY } from "../constants";

export function useHostTemplates(): UseQueryResult<ScoreTemplateResponse[]> {
  return useQuery({
    queryKey: [HOST_TEMPLATES_QUERY_KEY],
    queryFn: () => listHostExamTemplates(apiClient),
  });
}

export function useHostTemplate(publicId: string): UseQueryResult<ScoreTemplateResponse> {
  return useQuery({
    queryKey: [HOST_TEMPLATES_QUERY_KEY, publicId],
    queryFn: () => getHostExamTemplate(apiClient, publicId),
    enabled: Boolean(publicId),
  });
}

/** Every change to a template can alter what the create-exam wizard offers, so refresh both lists. */
function useRefreshTemplates(): () => Promise<void> {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: [HOST_TEMPLATES_QUERY_KEY] });
    await queryClient.invalidateQueries({ queryKey: ["activeScoreTemplate"] });
  };
}

export function useCreateHostTemplate(): UseMutationResult<ScoreTemplateResponse, unknown, string> {
  const refresh = useRefreshTemplates();
  return useMutation({
    mutationFn: (name: string) => createHostExamTemplate(apiClient, { name }),
    onSuccess: refresh,
  });
}

export function useCloneHostTemplate(): UseMutationResult<ScoreTemplateResponse, unknown, string> {
  const refresh = useRefreshTemplates();
  return useMutation({
    mutationFn: (publicId: string) => cloneHostExamTemplate(apiClient, publicId),
    onSuccess: refresh,
  });
}

export function useReplaceHostTemplateItems(
  publicId: string,
): UseMutationResult<ScoreTemplateResponse, unknown, ReplaceScoreTemplateItemsRequest> {
  const refresh = useRefreshTemplates();
  return useMutation({
    mutationFn: (payload: ReplaceScoreTemplateItemsRequest) =>
      replaceHostExamTemplateItems(apiClient, publicId, payload),
    onSuccess: refresh,
  });
}

export function useActivateHostTemplate(): UseMutationResult<ScoreTemplateResponse, unknown, string> {
  const refresh = useRefreshTemplates();
  return useMutation({
    mutationFn: (publicId: string) => activateHostExamTemplate(apiClient, publicId),
    onSuccess: refresh,
  });
}

export function useRetireHostTemplate(): UseMutationResult<ScoreTemplateResponse, unknown, string> {
  const refresh = useRefreshTemplates();
  return useMutation({
    mutationFn: (publicId: string) => retireHostExamTemplate(apiClient, publicId),
    onSuccess: refresh,
  });
}

export function useDeleteHostTemplate(): UseMutationResult<void, unknown, string> {
  const refresh = useRefreshTemplates();
  return useMutation({
    mutationFn: (publicId: string) => deleteHostExamTemplate(apiClient, publicId),
    onSuccess: refresh,
  });
}

/** Stateless preview of how to fill a skill's gap; nothing is persisted. */
export function useSuggestSkillWeights(): UseMutationResult<
  SkillWeightSuggestionResponse,
  unknown,
  SkillWeightSuggestionRequest
> {
  return useMutation({
    mutationFn: (payload: SkillWeightSuggestionRequest) => suggestHostSkillWeights(apiClient, payload),
  });
}
