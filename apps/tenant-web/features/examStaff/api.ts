"use client";

import {
  createUser,
  listExamStaff,
  reactivateUser,
  suspendUser,
  type ExamStaffQuery,
  type ExamStaffRole,
  type ExamStaffPage,
  type UserResponse,
} from "@pte/api-client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { TENANT_USERS_QUERY_KEY } from "@/features/exams/constants";
import { EXAM_STAFF_QUERY_KEY } from "./constants";
import type { CreateExamStaffInput } from "./types";

export function useExamStaff(query: ExamStaffQuery): UseQueryResult<ExamStaffPage> {
  return useQuery({
    queryKey: [
      ...EXAM_STAFF_QUERY_KEY,
      query.page,
      query.size,
      query.search ?? "",
      query.role ?? "ALL",
      query.status ?? "ALL",
      query.sort ?? "CREATED_AT",
      query.direction ?? "DESC",
    ],
    queryFn: () => listExamStaff(apiClient, query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateExamStaff(): UseMutationResult<
  UserResponse,
  unknown,
  CreateExamStaffInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      createUser(apiClient, {
        email: input.email.trim(),
        fullName: input.fullName.trim(),
        password: input.password,
        roles: [input.role],
        tenantId: null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXAM_STAFF_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
    },
  });
}

export function useSuspendExamStaff(): UseMutationResult<UserResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => suspendUser(apiClient, publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXAM_STAFF_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
    },
  });
}

export function useReactivateExamStaff(): UseMutationResult<UserResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => reactivateUser(apiClient, publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXAM_STAFF_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
    },
  });
}

export type { ExamStaffRole };
