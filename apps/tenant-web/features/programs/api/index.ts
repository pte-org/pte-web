"use client";

import {
  activateProgram,
  archiveProgram,
  assignCoordinator,
  createProgram,
  createUser,
  deactivateProgram,
  getProgram,
  getProgramDashboard,
  listClassMemberships,
  listCoordinatorAssignments,
  listMyOrganizations,
  listPrograms,
  listUsers,
  suspendProgram,
  unassignCoordinator,
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
import {
  COORDINATOR_ASSIGNMENTS_QUERY_KEY,
  MY_ORGANIZATIONS_QUERY_KEY,
  PROGRAM_QUERY_KEY,
  PROGRAMS_QUERY_KEY,
} from "../constants";
import type { CoordinatorAssignmentEntry, CreateCoordinatorInput, ProgramRosterEntry } from "../types";

const COORDINATOR_ROLE = "PROGRAM_COORDINATOR";

/** A Host may have more than one branch — feeds the Organization picker. */
export function useMyOrganizations(): UseQueryResult<OrganizationResponse[]> {
  return useQuery({
    queryKey: MY_ORGANIZATIONS_QUERY_KEY,
    queryFn: () => listMyOrganizations(apiClient),
  });
}

export function usePrograms(organizationPublicId: string): UseQueryResult<ProgramResponse[]> {
  return useQuery({
    queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId],
    queryFn: () => listPrograms(apiClient, organizationPublicId),
    enabled: organizationPublicId.length > 0,
  });
}

export function useProgram(organizationPublicId: string, publicId: string): UseQueryResult<ProgramResponse> {
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
      void queryClient.invalidateQueries({ queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId] });
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
      void queryClient.invalidateQueries({ queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId] });
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
 * All PROGRAM_COORDINATOR accounts in the caller's tenant. Shares
 * `queryKey`+`queryFn` with exams' `useTenantProctors`/classes'
 * `useTenantLecturers` — one cache entry, split via `select`.
 */
export function useTenantCoordinators(): UseQueryResult<UserResponse[]> {
  return useQuery({
    queryKey: TENANT_USERS_QUERY_KEY,
    queryFn: () => listUsers(apiClient),
    select: (users) => users.filter((user) => user.roles.includes(COORDINATOR_ROLE)),
  });
}

/**
 * This Program's assigned Coordinators, joined client-side against the
 * tenant's coordinators (`ProgramCoordinatorAssignmentResponse` only
 * carries `assigneePublicId` — same join-here-not-in-admin reasoning as
 * `features/classes`' `useLecturerAssignments`).
 */
export function useCoordinatorAssignments(
  organizationPublicId: string,
  programPublicId: string,
): UseQueryResult<CoordinatorAssignmentEntry[]> {
  const coordinators = useTenantCoordinators();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...COORDINATOR_ASSIGNMENTS_QUERY_KEY, programPublicId],
    queryFn: async () => {
      const assignments = await listCoordinatorAssignments(apiClient, organizationPublicId, programPublicId);
      const allUsers = queryClient.getQueryData<UserResponse[]>(TENANT_USERS_QUERY_KEY) ?? coordinators.data ?? [];
      const byId = new Map(
        allUsers
          .filter((user) => user.roles.includes(COORDINATOR_ROLE))
          .map((coordinator) => [coordinator.publicId, coordinator]),
      );
      return assignments.flatMap((assignment) => {
        const coordinator = byId.get(assignment.assigneePublicId);
        return coordinator ? [{ assignmentPublicId: assignment.publicId, coordinator }] : [];
      });
    },
    enabled: organizationPublicId.length > 0 && programPublicId.length > 0 && coordinators.data !== undefined,
  });
}

function invalidateCoordinatorAssignments(
  queryClient: ReturnType<typeof useQueryClient>,
  programPublicId: string,
): void {
  void queryClient.invalidateQueries({ queryKey: [...COORDINATOR_ASSIGNMENTS_QUERY_KEY, programPublicId] });
}

/** Assign an already-existing Coordinator (picked by publicId) to this Program. */
export function useAssignCoordinator(
  organizationPublicId: string,
  programPublicId: string,
): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assigneePublicId) => {
      await assignCoordinator(apiClient, organizationPublicId, programPublicId, { assigneePublicId });
    },
    onSuccess: () => invalidateCoordinatorAssignments(queryClient, programPublicId),
  });
}

export function useUnassignCoordinator(
  organizationPublicId: string,
  programPublicId: string,
): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentPublicId) => unassignCoordinator(apiClient, organizationPublicId, programPublicId, assignmentPublicId),
    onSuccess: () => invalidateCoordinatorAssignments(queryClient, programPublicId),
  });
}

/**
 * Create a brand-new Coordinator account (not yet assigned to anything).
 * Uses a Host-supplied password, mirroring exams' `useCreateProctorAccount`.
 */
export function useCreateCoordinatorAccount(): UseMutationResult<UserResponse, unknown, CreateCoordinatorInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) =>
      createUser(apiClient, {
        email: input.email.trim(),
        fullName: input.fullName.trim(),
        password: input.password,
        roles: [COORDINATOR_ROLE],
        tenantId: null,
      }),
    // Awaited so AssignCoordinatorModal's chained useAssignCoordinator call
    // (fired from this mutation's onSuccess) sees the just-created
    // coordinator already in the tenant-users cache.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
    },
  });
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
      const allUsers = queryClient.getQueryData<UserResponse[]>(TENANT_USERS_QUERY_KEY) ?? students.data ?? [];
      const byId = new Map(allUsers.map((student) => [student.publicId, student]));
      return memberships.flatMap((membership) => {
        const student = byId.get(membership.studentPublicId);
        return student ? [{ membership, student }] : [];
      });
    },
    enabled: programPublicId.length > 0 && students.data !== undefined,
  });
}
