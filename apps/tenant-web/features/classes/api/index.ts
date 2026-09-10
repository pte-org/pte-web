"use client";

import {
  activateClass,
  archiveClass,
  assignStudent,
  bulkAssignStudents,
  createClass,
  deactivateClass,
  listClasses,
  listClassMemberships,
  listMyOrganizations,
  listPrograms,
  suspendClass,
  transferStudent,
  unassignStudent,
  type AssignStudentRequest,
  type BulkAssignStudentsResponse,
  type ClassMembershipResponse,
  type ClassResponse,
  type CreateClassRequest,
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
import { CLASS_MEMBERSHIPS_QUERY_KEY } from "@/features/studentSearch/constants";
import { ALL_TENANT_CLASSES_QUERY_KEY, CLASSES_QUERY_KEY } from "../constants";
import { invalidateClassMemberships } from "./shared";

export * from "./shared";
export * from "./lecturerAssignments";
export * from "./mergeSplit";
export * from "./rosterImport";

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
