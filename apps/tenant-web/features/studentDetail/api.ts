"use client";

import {
  getStudentDetail,
  getStudentPerformance,
  listStudentAttempts,
  updateStudentProfile,
  type StudentDetailResponse,
  type StudentHistoryQuery,
  type StudentPerformanceResponse,
  type StudentAttemptHistoryPage,
  type UpdateStudentProfileRequest,
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

export const STUDENT_DETAIL_QUERY_KEY = ["studentDetail"] as const;

export function useStudentDetail(
  publicId: string,
  enabled = true,
): UseQueryResult<StudentDetailResponse> {
  return useQuery({
    queryKey: [...STUDENT_DETAIL_QUERY_KEY, publicId],
    queryFn: () => getStudentDetail(apiClient, publicId),
    enabled: enabled && Boolean(publicId),
  });
}

export function useStudentAttempts(
  publicId: string,
  query: StudentHistoryQuery,
  enabled = true,
): UseQueryResult<StudentAttemptHistoryPage> {
  return useQuery({
    queryKey: [
      ...STUDENT_DETAIL_QUERY_KEY,
      publicId,
      "attempts",
      query.page,
      query.size,
      query.from ?? "",
      query.to ?? "",
      query.status ?? "ALL",
    ],
    queryFn: () => listStudentAttempts(apiClient, publicId, query),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(publicId),
  });
}

export function useStudentPerformance(
  publicId: string,
  query: Pick<StudentHistoryQuery, "from" | "to"> = {},
  enabled = true,
): UseQueryResult<StudentPerformanceResponse> {
  return useQuery({
    queryKey: [
      ...STUDENT_DETAIL_QUERY_KEY,
      publicId,
      "performance",
      query.from ?? "",
      query.to ?? "",
    ],
    queryFn: () => getStudentPerformance(apiClient, publicId, query),
    enabled: enabled && Boolean(publicId),
  });
}

export function useUpdateStudentProfile(): UseMutationResult<
  UserResponse,
  unknown,
  { publicId: string; payload: UpdateStudentProfileRequest }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, payload }) => updateStudentProfile(apiClient, publicId, payload),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [...STUDENT_DETAIL_QUERY_KEY, variables.publicId],
      });
      void queryClient.invalidateQueries({ queryKey: ["studentRoster"] });
      void queryClient.invalidateQueries({ queryKey: ["tenantUsers"] });
    },
  });
}
