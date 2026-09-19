"use client";

import {
  importQuestionTypesFromScoreTemplate,
  listQuestionTypes,
  updateQuestionType,
  type QuestionTypeResponse,
  type ImportQuestionTypesFromScoreTemplateRequest,
  type UpdateQuestionTypeRequest,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { QUESTION_TYPES_QUERY_KEY } from "./constants";

export function useQuestionTypes(activeOnly = true): UseQueryResult<QuestionTypeResponse[]> {
  return useQuery({
    queryKey: [...QUESTION_TYPES_QUERY_KEY, { activeOnly }],
    queryFn: () => listQuestionTypes(apiClient, { activeOnly }),
  });
}

interface UpdateQuestionTypeInput {
  publicId: string;
  payload: UpdateQuestionTypeRequest;
}

export function useUpdateQuestionType(): UseMutationResult<
  QuestionTypeResponse,
  unknown,
  UpdateQuestionTypeInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }) => updateQuestionType(apiClient, publicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUESTION_TYPES_QUERY_KEY });
    },
  });
}

export function useImportQuestionTypesFromScoreTemplate(): UseMutationResult<
  QuestionTypeResponse[],
  unknown,
  ImportQuestionTypesFromScoreTemplateRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => importQuestionTypesFromScoreTemplate(apiClient, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUESTION_TYPES_QUERY_KEY });
    },
  });
}
