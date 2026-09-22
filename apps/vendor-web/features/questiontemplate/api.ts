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
import { listSupportedTaskTypes, listTaskTypes } from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import {
  QUESTION_TYPES_QUERY_KEY,
  SUPPORTED_QUESTION_TYPES_QUERY_KEY,
  SUPPORTED_TASK_TYPES_QUERY_KEY,
  TASK_TYPES_QUERY_KEY,
} from "./constants";

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

/** New terminology adapter. It deliberately uses a separate cache key so the
 * migration can be observed without invalidating away the old cache contract. */
export function useTaskTypes(activeOnly = true): UseQueryResult<QuestionTypeResponse[]> {
  return useQuery({
    queryKey: [...TASK_TYPES_QUERY_KEY, { activeOnly }],
    queryFn: () => listTaskTypes(apiClient, { activeOnly }),
  });
}

export function useSupportedTaskTypes(): UseQueryResult<SupportedQuestionTypeResponse[]> {
  return useQuery({
    queryKey: SUPPORTED_TASK_TYPES_QUERY_KEY,
    queryFn: () => listSupportedTaskTypes(apiClient),
    staleTime: Infinity,
  });
}

function invalidateTaskTypeQueries(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: QUESTION_TYPES_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: TASK_TYPES_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: SUPPORTED_QUESTION_TYPES_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: SUPPORTED_TASK_TYPES_QUERY_KEY });
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
    onSuccess: () => invalidateTaskTypeQueries(queryClient),
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
    onSuccess: () => invalidateTaskTypeQueries(queryClient),
  });
}

interface DeleteQuestionTypeInput {
  publicId: string;
}

export function useDeleteQuestionType(): UseMutationResult<void, unknown, DeleteQuestionTypeInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId }) => deleteQuestionType(apiClient, publicId),
    onSuccess: () => invalidateTaskTypeQueries(queryClient),
  });
}
