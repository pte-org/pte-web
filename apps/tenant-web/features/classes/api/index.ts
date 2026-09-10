"use client";

import {
  activateClass,
  archiveClass,
  assignLecturer,
  assignStudent,
  bulkAssignStudents,
  bulkCreateUsers,
  createClass,
  createUser,
  type BulkCreateUsersResponse,
  deactivateClass,
  listClasses,
  listClassMemberships,
  listLecturerAssignments,
  listMyOrganizations,
  listPrograms,
  listStudentEnrollments,
  listUsers,
  mergeClasses,
  splitClass,
  suspendClass,
  transferStudent,
  unassignLecturer,
  unassignStudent,
  type AssignStudentRequest,
  type BulkAssignStudentsResponse,
  type ClassMembershipResponse,
  type ClassResponse,
  type CreateClassRequest,
  type MergeClassesResponse,
  type SplitClassRequest,
  type SplitClassResponse,
  type StudentEnrollmentResponse,
  type TransferStudentRequest,
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
import type { RosterRow } from "@/features/examoperations/types";
import { CLASS_MEMBERSHIPS_QUERY_KEY } from "@/features/studentSearch/constants";
import { ALL_TENANT_CLASSES_QUERY_KEY, CLASSES_QUERY_KEY, LECTURER_ASSIGNMENTS_QUERY_KEY } from "../constants";
import type { CreateLecturerInput, LecturerAssignmentEntry } from "../types";

const LECTURER_ROLE = "LECTURER";

export function useClasses(organizationPublicId: string, programPublicId: string): UseQueryResult<ClassResponse[]> {
  return useQuery({
    queryKey: [...CLASSES_QUERY_KEY, programPublicId],
    queryFn: () => listClasses(apiClient, organizationPublicId, programPublicId),
    enabled: organizationPublicId.length > 0 && programPublicId.length > 0,
  });
}

export function useCreateClass(
  organizationPublicId: string,
  programPublicId: string,
): UseMutationResult<ClassResponse, unknown, CreateClassRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createClass(apiClient, organizationPublicId, programPublicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, programPublicId] });
      // Also covers the Program dashboard's class count (keyed under CLASS_MEMBERSHIPS_QUERY_KEY —
      // see useProgramDashboard) since creating a Class doesn't touch any membership row itself.
      invalidateClassMemberships(queryClient);
    },
  });
}

export interface ClassStatusMutations {
  activate: UseMutationResult<ClassResponse, unknown, void>;
  deactivate: UseMutationResult<ClassResponse, unknown, void>;
  suspend: UseMutationResult<ClassResponse, unknown, void>;
  archive: UseMutationResult<ClassResponse, unknown, void>;
}

export function useClassStatusMutations(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): ClassStatusMutations {
  const queryClient = useQueryClient();

  const onSuccess = (): void => {
    void queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, programPublicId] });
    // Also covers the Program dashboard's class count (see useProgramDashboard) — archive/
    // activate/suspend/deactivate all change which Classes count toward it.
    invalidateClassMemberships(queryClient);
  };

  const activate = useMutation({
    mutationFn: () => activateClass(apiClient, organizationPublicId, programPublicId, classPublicId),
    onSuccess,
  });
  const deactivate = useMutation({
    mutationFn: () => deactivateClass(apiClient, organizationPublicId, programPublicId, classPublicId),
    onSuccess,
  });
  const suspend = useMutation({
    mutationFn: () => suspendClass(apiClient, organizationPublicId, programPublicId, classPublicId),
    onSuccess,
  });
  const archive = useMutation({
    mutationFn: () => archiveClass(apiClient, organizationPublicId, programPublicId, classPublicId),
    onSuccess,
  });

  return { activate, deactivate, suspend, archive };
}

export interface ClassRosterEntry {
  membership: ClassMembershipResponse;
  student: UserResponse;
}

/**
 * A single Class's roster, joined client-side against the tenant's students
 * — `ClassMembershipResponse` only carries `studentPublicId` (same
 * join-here-not-in-admin reasoning as Phase 1/7's precedents). Reads
 * `GET /class-memberships?programPublicId=` (the whole Program's rows, per
 * Phase 3 — there's no single-Class list endpoint) and filters to this
 * Class client-side, since that's the shared data source every consumer of
 * this endpoint reuses rather than adding a narrower variant.
 */
export function useClassRoster(programPublicId: string, classPublicId: string): UseQueryResult<ClassRosterEntry[]> {
  const students = useTenantStudents();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...CLASS_MEMBERSHIPS_QUERY_KEY, programPublicId],
    queryFn: async () => {
      const memberships = await listClassMemberships(apiClient, programPublicId);
      // Read the cache directly rather than closing over `students.data` (a
      // per-render snapshot) — same race avoidance as useSessionRoster.
      const allUsers = queryClient.getQueryData<UserResponse[]>(TENANT_USERS_QUERY_KEY) ?? students.data ?? [];
      const byId = new Map(allUsers.map((student) => [student.publicId, student]));
      return memberships.flatMap((membership) => {
        const student = byId.get(membership.studentPublicId);
        return student ? [{ membership, student }] : [];
      });
    },
    enabled: programPublicId.length > 0 && students.data !== undefined,
    select: (entries) => entries.filter((entry) => entry.membership.classPublicId === classPublicId),
  });
}

export interface TenantClassOption {
  organizationPublicId: string;
  programPublicId: string;
  programName: string;
  classPublicId: string;
  className: string;
}

/**
 * Every Class across every Program/Organization in the tenant — backs the
 * Transfer target picker, which per Phase 3's design isn't restricted to
 * the source Class's own Program. No tenant-wide "list all Classes"
 * backend endpoint exists (`GET /class-memberships` only surfaces Classes
 * that already have at least one member), so this fans out
 * Organizations -> Programs -> Classes as one query. Acceptable at current
 * scale (small org/program counts) — same accepted-unbounded-client-side
 * convention as Phase 7's student search.
 */
export function useAllTenantClasses(): UseQueryResult<TenantClassOption[]> {
  return useQuery({
    queryKey: ALL_TENANT_CLASSES_QUERY_KEY,
    queryFn: async () => {
      const organizations = await listMyOrganizations(apiClient);
      const programsByOrganization = await Promise.all(
        organizations.map(async (organization) => {
          const programs = await listPrograms(apiClient, organization.publicId);
          return programs.map((program) => ({ ...program, organizationPublicId: organization.publicId }));
        }),
      );
      const programs = programsByOrganization.flat();

      const classesByProgram = await Promise.all(
        programs.map(async (program) => {
          const classes = await listClasses(apiClient, program.organizationPublicId, program.publicId);
          return classes.map((studentClass): TenantClassOption => ({
            organizationPublicId: program.organizationPublicId,
            programPublicId: program.publicId,
            programName: program.name,
            classPublicId: studentClass.publicId,
            className: studentClass.name,
          }));
        }),
      );
      return classesByProgram.flat();
    },
  });
}

function invalidateClassMemberships(queryClient: ReturnType<typeof useQueryClient>): void {
  // Partial-match invalidation (TanStack's default) — covers both the
  // tenant-wide unfiltered cache entry (Phase 7's student search) and every
  // per-Program roster entry (`[...CLASS_MEMBERSHIPS_QUERY_KEY, programPublicId]`)
  // in one call, since both keys start with this prefix.
  void queryClient.invalidateQueries({ queryKey: CLASS_MEMBERSHIPS_QUERY_KEY });
}

export function useAssignStudent(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): UseMutationResult<ClassMembershipResponse, unknown, AssignStudentRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => assignStudent(apiClient, organizationPublicId, programPublicId, classPublicId, payload),
    onSuccess: () => invalidateClassMemberships(queryClient),
  });
}

export function useBulkAssignStudents(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): UseMutationResult<BulkAssignStudentsResponse, unknown, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentPublicIds) =>
      bulkAssignStudents(apiClient, organizationPublicId, programPublicId, classPublicId, { studentPublicIds }),
    onSuccess: () => invalidateClassMemberships(queryClient),
  });
}

export function useUnassignStudent(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipPublicId) =>
      unassignStudent(apiClient, organizationPublicId, programPublicId, classPublicId, membershipPublicId),
    onSuccess: () => invalidateClassMemberships(queryClient),
  });
}

interface TransferStudentInput {
  membershipPublicId: string;
  targetClassPublicId: string;
}

export function useTransferStudent(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): UseMutationResult<ClassMembershipResponse, unknown, TransferStudentInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ membershipPublicId, targetClassPublicId }) => {
      const payload: TransferStudentRequest = { targetClassPublicId };
      return transferStudent(
        apiClient,
        organizationPublicId,
        programPublicId,
        classPublicId,
        membershipPublicId,
        payload,
      );
    },
    onSuccess: () => invalidateClassMemberships(queryClient),
  });
}

/** Backs the Transfer flow's pending-exam-request warning (Phase 3's new `scheduling` endpoint) — read-only, never blocks the transfer. */
export function useStudentEnrollments(studentPublicId: string): UseQueryResult<StudentEnrollmentResponse[]> {
  return useQuery({
    queryKey: ["studentEnrollments", studentPublicId],
    queryFn: () => listStudentEnrollments(apiClient, studentPublicId),
    enabled: studentPublicId.length > 0,
  });
}

/**
 * Step 1 of the Excel-import-into-a-Class path: create N accounts. Pure
 * account creation only — persisting the result to `pendingClassAssignment`
 * sessionStorage is the caller's (`ImportOrAssignModal`'s) responsibility
 * via its single `handleAccountsCreated` write path, not this hook's own
 * `onSuccess`. An earlier version wrote here too (mirroring examoperations'
 * `useCreateRosterAccounts`, which owns its session-scoped pending key
 * outright) — but unlike that flow, this one has multiple independent
 * creation sources (Excel + one-by-one) writing into the *same*
 * class-scoped key, so a second, ordering-dependent writer here was a
 * latent duplicate-write hazard (see QUAL-003) rather than a safe mirror of
 * that precedent. Keep this hook side-effect-free for that reason.
 */
export function useCreateRosterAccountsForClass(): UseMutationResult<
  BulkCreateUsersResponse,
  unknown,
  RosterRow[]
> {
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
  });
}

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

/**
 * Moves every student from each source Class into `targetClassPublicId`.
 * Does NOT archive the source Class(es) — confirmed with the user during
 * Phase 12 design as the intended behavior (merge only moves membership
 * rows; the Host archives a now-empty source Class separately if wanted).
 * Invalidates both this Program's Classes list (roster counts elsewhere in
 * the UI may depend on it) and the shared class-memberships cache (every
 * moved student's `classPublicId` changed).
 */
export function useMergeClasses(
  organizationPublicId: string,
  programPublicId: string,
  targetClassPublicId: string,
): UseMutationResult<MergeClassesResponse, unknown, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceClassPublicIds) =>
      mergeClasses(apiClient, organizationPublicId, programPublicId, targetClassPublicId, { sourceClassPublicIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, programPublicId] });
      invalidateClassMemberships(queryClient);
    },
  });
}

/** Creates a new Class under the same Program as `sourceClassPublicId`, then moves the given student subset into it. */
export function useSplitClass(
  organizationPublicId: string,
  programPublicId: string,
  sourceClassPublicId: string,
): UseMutationResult<SplitClassResponse, unknown, SplitClassRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => splitClass(apiClient, organizationPublicId, programPublicId, sourceClassPublicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, programPublicId] });
      invalidateClassMemberships(queryClient);
    },
  });
}
