"use client";

import {
  activateProgram,
  archiveProgram,
  createProgram,
  deactivateProgram,
  getProgram,
  getProgramDashboard,
  listClassMemberships,
  listMyOrganizations,
  listPrograms,
  suspendProgram,
  updateProgram,
  type CreateProgramRequest,
  type OrganizationResponse,
  type ProgramDashboardResponse,
  type ProgramResponse,
  type UpdateProgramRequest,
  type UserResponse,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { TENANT_USERS_QUERY_KEY } from "@/features/exams/constants";
import { useTenantStudents } from "@/features/examoperations/api";
import { CLASS_MEMBERSHIPS_QUERY_KEY } from "@/features/studentSearch/constants";
import { MY_ORGANIZATIONS_QUERY_KEY, PROGRAM_QUERY_KEY, PROGRAMS_QUERY_KEY } from "../constants";
import type { ProgramRosterEntry } from "../types";

/** Returns the Host's automatically provisioned Organization. */
export function useMyOrganizations(enabled = true): UseQueryResult<OrganizationResponse[]> {
  return useQuery({
    queryKey: MY_ORGANIZATIONS_QUERY_KEY,
    queryFn: () => listMyOrganizations(apiClient),
    enabled,
  });
}

export function usePrograms(
  organizationPublicId: string,
  enabled = true,
): UseQueryResult<ProgramResponse[]> {
  return useQuery({
    queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId],
    queryFn: () => listPrograms(apiClient, organizationPublicId),
    enabled: enabled && organizationPublicId.length > 0,
  });
}

export function useProgram(
  organizationPublicId: string,
  publicId: string,
): UseQueryResult<ProgramResponse> {
  return useQuery({
    queryKey: [...PROGRAM_QUERY_KEY, publicId],
    queryFn: () => getProgram(apiClient, organizationPublicId, publicId),
    enabled: organizationPublicId.length > 0 && publicId.length > 0,
  });
}

export function useCreateProgram(
  organizationPublicId: string,
): UseMutationResult<ProgramResponse, unknown, CreateProgramRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createProgram(apiClient, organizationPublicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId],
      });
    },
  });
}

export function useUpdateProgram(
  organizationPublicId: string,
  publicId: string,
): UseMutationResult<ProgramResponse, unknown, UpdateProgramRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateProgram(apiClient, organizationPublicId, publicId, payload),
    onSuccess: (program) => {
      queryClient.setQueryData([...PROGRAM_QUERY_KEY, publicId], program);
      void queryClient.invalidateQueries({
        queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId],
      });
    },
  });
}

export interface ProgramStatusMutations {
  activate: UseMutationResult<ProgramResponse, unknown, void>;
  deactivate: UseMutationResult<ProgramResponse, unknown, void>;
  suspend: UseMutationResult<ProgramResponse, unknown, void>;
  archive: UseMutationResult<ProgramResponse, unknown, void>;
}

export function useProgramStatusMutations(
  organizationPublicId: string,
  publicId: string,
): ProgramStatusMutations {
  const queryClient = useQueryClient();

  const onSuccess = (program: ProgramResponse): void => {
    queryClient.setQueryData([...PROGRAM_QUERY_KEY, publicId], program);
    void queryClient.invalidateQueries({ queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId] });
  };

  const activate = useMutation({
    mutationFn: () => activateProgram(apiClient, organizationPublicId, publicId),
    onSuccess,
  });
  const deactivate = useMutation({
    mutationFn: () => deactivateProgram(apiClient, organizationPublicId, publicId),
    onSuccess,
  });
  const suspend = useMutation({
    mutationFn: () => suspendProgram(apiClient, organizationPublicId, publicId),
    onSuccess,
  });
  const archive = useMutation({
    mutationFn: () => archiveProgram(apiClient, organizationPublicId, publicId),
    onSuccess,
  });

  return { activate, deactivate, suspend, archive };
}

/**
 * Class/student counts for this Program — one grouped backend query (see
 * `ProgramService.getDashboard`). Keyed under `CLASS_MEMBERSHIPS_QUERY_KEY`
 * (not a dedicated key) so it's covered for free by every existing
 * membership-mutating hook's `invalidateClassMemberships(queryClient)` call
 * (assign/bulkAssign/unassign/transfer/merge/split) — see
 * `useCreateClass`/`useClassStatusMutations` in `features/classes/api` for
 * the matching addition covering Class create/archive/status changes too.
 */
export function useProgramDashboard(
  organizationPublicId: string,
  programPublicId: string,
): UseQueryResult<ProgramDashboardResponse> {
  return useQuery({
    queryKey: [...CLASS_MEMBERSHIPS_QUERY_KEY, programPublicId, "dashboard"],
    queryFn: () => getProgramDashboard(apiClient, organizationPublicId, programPublicId),
    enabled: organizationPublicId.length > 0 && programPublicId.length > 0,
  });
}

/**
 * A whole Program's roster (every currently-assigned student across all its
 * Classes) — backs Phase 10's bulk-create-exam-session flow. Reuses the
 * same `GET /class-memberships?programPublicId=` request module as
 * `features/classes`' `useClassRoster` (Phase 8) and `features/studentSearch`
 * (Phase 7) rather than adding a new endpoint, and deliberately shares
 * `useClassRoster`'s exact query key (`[...CLASS_MEMBERSHIPS_QUERY_KEY,
 * programPublicId]`, with no class-level `select` filter on top) so both
 * hooks read the same cached fetch for the same Program instead of issuing
 * a duplicate request.
 */
export function useProgramRoster(programPublicId: string): UseQueryResult<ProgramRosterEntry[]> {
  const students = useTenantStudents();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...CLASS_MEMBERSHIPS_QUERY_KEY, programPublicId],
    queryFn: async () => {
      const memberships = await listClassMemberships(apiClient, programPublicId);
      // Read the cache directly rather than closing over `students.data` (a
      // per-render snapshot) — same race avoidance as useClassRoster.
      const allUsers =
        queryClient.getQueryData<UserResponse[]>(TENANT_USERS_QUERY_KEY) ?? students.data ?? [];
      const byId = new Map(allUsers.map((student) => [student.publicId, student]));
      return memberships.flatMap((membership) => {
        const student = byId.get(membership.studentPublicId);
        return student ? [{ membership, student }] : [];
      });
    },
    enabled: programPublicId.length > 0 && students.data !== undefined,
  });
}
