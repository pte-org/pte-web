"use client";

import {
  assignLecturer,
  createUser,
  listLecturerAssignments,
  listUsers,
  unassignLecturer,
  type UserResponse,
} from "@pte/api-client";
import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { TENANT_USERS_QUERY_KEY } from "@/features/exams/constants";
import { LECTURER_ASSIGNMENTS_QUERY_KEY } from "../constants";
import type { CreateLecturerInput, LecturerAssignmentEntry } from "../types";

const LECTURER_ROLE = "LECTURER";

/**
 * All LECTURER accounts in the caller's tenant. Shares `queryKey`+`queryFn`
 * with examoperations' `useTenantStudents`/exams' `useTenantProctors` — one
 * cache entry, split via `select` (see `useTenantProctors`'s doc comment
 * for why).
 */
export function useTenantLecturers(): UseQueryResult<UserResponse[]> {
  return useQuery({
    queryKey: TENANT_USERS_QUERY_KEY,
    queryFn: () => listUsers(apiClient),
    select: (users) => users.filter((user) => user.roles.includes(LECTURER_ROLE)),
  });
}

/**
 * This Class's assigned Lecturers, joined client-side against the tenant's
 * lecturers (`LecturerAssignmentResponse` only carries `assigneePublicId`
 * — same join-here-not-in-admin reasoning as `useClassRoster`).
 */
export function useLecturerAssignments(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): UseQueryResult<LecturerAssignmentEntry[]> {
  const lecturers = useTenantLecturers();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...LECTURER_ASSIGNMENTS_QUERY_KEY, classPublicId],
    queryFn: async () => {
      const assignments = await listLecturerAssignments(apiClient, organizationPublicId, programPublicId, classPublicId);
      const allUsers = queryClient.getQueryData<UserResponse[]>(TENANT_USERS_QUERY_KEY) ?? lecturers.data ?? [];
      const byId = new Map(
        allUsers.filter((user) => user.roles.includes(LECTURER_ROLE)).map((lecturer) => [lecturer.publicId, lecturer]),
      );
      return assignments.flatMap((assignment) => {
        const lecturer = byId.get(assignment.assigneePublicId);
        return lecturer ? [{ assignmentPublicId: assignment.publicId, lecturer }] : [];
      });
    },
    enabled:
      organizationPublicId.length > 0 &&
      programPublicId.length > 0 &&
      classPublicId.length > 0 &&
      lecturers.data !== undefined,
  });
}

function invalidateLecturerAssignments(
  queryClient: ReturnType<typeof useQueryClient>,
  classPublicId: string,
): void {
  void queryClient.invalidateQueries({ queryKey: [...LECTURER_ASSIGNMENTS_QUERY_KEY, classPublicId] });
}

/** Assign an already-existing Lecturer (picked by publicId) to this Class. */
export function useAssignLecturer(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assigneePublicId) => {
      await assignLecturer(apiClient, organizationPublicId, programPublicId, classPublicId, { assigneePublicId });
    },
    onSuccess: () => invalidateLecturerAssignments(queryClient, classPublicId),
  });
}

export function useUnassignLecturer(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentPublicId) =>
      unassignLecturer(apiClient, organizationPublicId, programPublicId, classPublicId, assignmentPublicId),
    onSuccess: () => invalidateLecturerAssignments(queryClient, classPublicId),
  });
}

/**
 * Create a brand-new Lecturer account (not yet assigned to anything). Uses
 * a Host-supplied password, mirroring exams' `useCreateProctorAccount`.
 */
export function useCreateLecturerAccount(): UseMutationResult<UserResponse, unknown, CreateLecturerInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) =>
      createUser(apiClient, {
        email: input.email.trim(),
        fullName: input.fullName.trim(),
        password: input.password,
        roles: [LECTURER_ROLE],
        tenantId: null,
      }),
    // Awaited so AssignLecturerModal's chained useAssignLecturer call (fired
    // from this mutation's onSuccess) sees the just-created lecturer already
    // in the tenant-users cache.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
    },
  });
}
