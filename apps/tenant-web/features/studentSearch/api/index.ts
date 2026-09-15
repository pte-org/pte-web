"use client";

import {
  bulkCreateUsers,
  listClassMemberships,
  listStudentRoster,
  reactivateUser,
  suspendUser,
  type BulkCreateUsersResponse,
  type ClassMembershipResponse,
  type PagedResult,
  type StudentRosterQuery,
  type StudentRosterRow,
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
import type { RosterRow } from "@/features/examoperations/types";
import { CLASS_MEMBERSHIPS_QUERY_KEY, STUDENT_ROSTER_QUERY_KEY } from "../constants";

/**
 * Kept for the Classes ImportOrAssignModal. The Students page uses the
 * server-side roster query below and never downloads this whole list.
 */
export function useClassMemberships(): UseQueryResult<ClassMembershipResponse[]> {
  return useQuery({
    queryKey: CLASS_MEMBERSHIPS_QUERY_KEY,
    queryFn: () => listClassMemberships(apiClient),
  });
}

/** Creates student accounts in the current Host's tenant without enrolling them anywhere. */
export function useCreateTenantStudents(): UseMutationResult<
  BulkCreateUsersResponse,
  unknown,
  RosterRow[]
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows) =>
      bulkCreateUsers(apiClient, {
        rows: rows.map((row) => ({
          email: row.email,
          fullName: row.fullName,
          studentCode: row.studentCode ?? null,
          className: row.className ?? null,
          phone: row.phone ?? null,
          dateOfBirth: row.dateOfBirth ?? null,
        })),
        tenantId: null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: STUDENT_ROSTER_QUERY_KEY });
    },
  });
}

/** Server-side roster query; every input is part of the cache identity. */
export function useStudentRoster(
  query: StudentRosterQuery,
  enabled = true,
): UseQueryResult<PagedResult<StudentRosterRow>> {
  return useQuery({
    queryKey: [
      ...STUDENT_ROSTER_QUERY_KEY,
      query.search ?? "",
      query.page,
      query.size,
      query.programPublicId ?? "",
      query.classPublicId ?? "",
      query.assignmentStatus ?? "ALL",
      query.sort ?? "CREATED_AT",
      query.direction ?? "DESC",
    ],
    queryFn: () => listStudentRoster(apiClient, query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSuspendStudent(): UseMutationResult<UserResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => suspendUser(apiClient, publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STUDENT_ROSTER_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
    },
  });
}

export function useReactivateStudent(): UseMutationResult<UserResponse, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId) => reactivateUser(apiClient, publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STUDENT_ROSTER_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
    },
  });
}
