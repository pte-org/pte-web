"use client";

import {
  createQuestionType,
  deleteQuestionType,
  listQuestionTypes,
  listSupportedQuestionTypes,
  updateQuestionType,
  type CreateQuestionTypeRequest,
  type QuestionTypeResponse,
  type SupportedQuestionTypeResponse,
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
import { QUESTION_TYPES_QUERY_KEY, SUPPORTED_QUESTION_TYPES_QUERY_KEY } from "./constants";

export function useQuestionTypes(activeOnly = true): UseQueryResult<QuestionTypeResponse[]> {
  return useQuery({
    queryKey: [...QUESTION_TYPES_QUERY_KEY, { activeOnly }],
    queryFn: () => listQuestionTypes(apiClient, { activeOnly }),
  });
}

export function useSupportedQuestionTypes(): UseQueryResult<SupportedQuestionTypeResponse[]> {
  return useQuery({
    queryKey: SUPPORTED_QUESTION_TYPES_QUERY_KEY,
    queryFn: () => listSupportedQuestionTypes(apiClient),
    staleTime: Infinity,
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

interface CreateQuestionTypeInput {
  payload: CreateQuestionTypeRequest;
}

export function useCreateQuestionType(): UseMutationResult<
  QuestionTypeResponse,
  unknown,
  CreateQuestionTypeInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }) => createQuestionType(apiClient, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUESTION_TYPES_QUERY_KEY });
    },
  });
}

interface DeleteQuestionTypeInput {
  publicId: string;
}

export function useDeleteQuestionType(): UseMutationResult<void, unknown, DeleteQuestionTypeInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId }) => deleteQuestionType(apiClient, publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUESTION_TYPES_QUERY_KEY });
    },
  });
}
