"use client";

import {
  activateScoreTemplate,
  cloneScoreTemplate,
  createScoreTemplate,
  deleteScoreTemplate,
  getScoreTemplate,
  listScoreTemplates,
  replaceScoreTemplateItems,
  approveScoreTemplate,
  rejectScoreTemplate,
  submitScoreTemplateApproval,
  type RejectScoreTemplateRequest,
  type ReplaceScoreTemplateItemsRequest,
  type CreateScoreTemplateRequest,
  type ScoreTemplateResponse,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { SCORE_TEMPLATES_QUERY_KEY, SCORE_TEMPLATE_QUERY_KEY } from "./constants";

export function useScoreTemplates(): UseQueryResult<ScoreTemplateResponse[]> {
  return useQuery({
    queryKey: SCORE_TEMPLATES_QUERY_KEY,
    queryFn: () => listScoreTemplates(apiClient),
  });
}

export function useCreateScoreTemplate(): UseMutationResult<
  ScoreTemplateResponse,
  unknown,
  CreateScoreTemplateRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createScoreTemplate(apiClient, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCORE_TEMPLATES_QUERY_KEY });
    },
  });
}

/** Kept for admin screens that need to inspect the active version from the catalog. */
export function useActiveScoreTemplate(): UseQueryResult<ScoreTemplateResponse | undefined> {
  return useQuery({
    queryKey: SCORE_TEMPLATES_QUERY_KEY,
    queryFn: () => listScoreTemplates(apiClient),
    select: (templates) => templates.find((template) => template.status === "ACTIVE"),
  });
}

export function useScoreTemplate(publicId: string): UseQueryResult<ScoreTemplateResponse> {
  return useQuery({
    queryKey: [...SCORE_TEMPLATE_QUERY_KEY, publicId],
    queryFn: () => getScoreTemplate(apiClient, publicId),
    enabled: publicId.length > 0,
  });
}

export function useCloneScoreTemplate(): UseMutationResult<ScoreTemplateResponse, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourcePublicId: string) => cloneScoreTemplate(apiClient, sourcePublicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCORE_TEMPLATES_QUERY_KEY });
    },
  });
}

export function useDeleteScoreTemplate(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => deleteScoreTemplate(apiClient, publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SCORE_TEMPLATES_QUERY_KEY });
    },
  });
}

interface ReplaceItemsInput {
  publicId: string;
  payload: ReplaceScoreTemplateItemsRequest;
}

export function useReplaceScoreTemplateItems(): UseMutationResult<
  ScoreTemplateResponse,
  unknown,
  ReplaceItemsInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }: ReplaceItemsInput) =>
      replaceScoreTemplateItems(apiClient, publicId, payload),
    onSuccess: (_data, { publicId }) => {
      void queryClient.invalidateQueries({ queryKey: SCORE_TEMPLATES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [...SCORE_TEMPLATE_QUERY_KEY, publicId] });
    },
  });
}

export function useActivateScoreTemplate(): UseMutationResult<
  ScoreTemplateResponse,
  unknown,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => activateScoreTemplate(apiClient, publicId),
    onSuccess: () => {
      // Activating flips two rows at once (new ACTIVE, old ACTIVE -> RETIRED)
      // — invalidate the whole list plus every individually-cached detail,
      // since we don't know the old ACTIVE's publicId from here.
      void queryClient.invalidateQueries({ queryKey: SCORE_TEMPLATES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: SCORE_TEMPLATE_QUERY_KEY });
    },
  });
}

function invalidateScoreTemplateQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  publicId: string,
): void {
  void queryClient.invalidateQueries({ queryKey: SCORE_TEMPLATES_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: [...SCORE_TEMPLATE_QUERY_KEY, publicId] });
}

export function useSubmitScoreTemplateApproval(): UseMutationResult<
  ScoreTemplateResponse,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => submitScoreTemplateApproval(apiClient, publicId),
    onSuccess: (_data, publicId) => invalidateScoreTemplateQueries(queryClient, publicId),
  });
}

export function useApproveScoreTemplate(): UseMutationResult<
  ScoreTemplateResponse,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => approveScoreTemplate(apiClient, publicId),
    onSuccess: (_data, publicId) => invalidateScoreTemplateQueries(queryClient, publicId),
  });
}

interface RejectScoreTemplateInput {
  publicId: string;
  payload: RejectScoreTemplateRequest;
}

export function useRejectScoreTemplate(): UseMutationResult<
  ScoreTemplateResponse,
  unknown,
  RejectScoreTemplateInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => rejectScoreTemplate(apiClient, publicId, payload),
    onSuccess: (_data, { publicId }) => invalidateScoreTemplateQueries(queryClient, publicId),
  });
}
