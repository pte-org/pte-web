"use client";

import {
  bulkCreateUsers,
  listClassMemberships,
  type ClassMembershipResponse,
  type BulkCreateUsersResponse,
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
import { useTenantStudents } from "@/features/examoperations/api";
import { TENANT_USERS_QUERY_KEY } from "@/features/exams/constants";
import type { RosterRow } from "@/features/examoperations/types";
import { CLASS_MEMBERSHIPS_QUERY_KEY } from "../constants";
import type { StudentSearchResult } from "../types";

/**
 * Tenant-wide roster (Phase 3's `GET /class-memberships`, unfiltered) — the
 * other half of this feature's client-side join against
 * `useTenantStudents()`. Shares no cache key with `features/classes`' or
 * `features/programs`' per-Program calls (those use `?programPublicId=`);
 * this hook always calls the unfiltered variant. Exported — also reused by
 * `features/classes`' `ImportOrAssignModal` to compute which tenant
 * students are not currently in any Class.
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
    },
  });
}

function matchesQuery(user: UserResponse, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return (
    user.fullName.toLowerCase().includes(needle) ||
    (user.phone ?? "").toLowerCase().includes(needle)
  );
}

interface StudentSearchState {
  results: StudentSearchResult[];
  isLoading: boolean;
}

/**
 * Joins iam's `GET /users` (tenant-scoped) against admin's
 * `GET /class-memberships` (also tenant-scoped) entirely client-side —
 * both lists are already fetched/cached as a whole, so this is a plain
 * in-memory filter+join, not a per-keystroke network call. `query` is
 * expected to already be debounced by the caller.
 */
export function useTenantStudentSearch(query: string): StudentSearchState {
  const students = useTenantStudents();
  const memberships = useClassMemberships();

  const isLoading = students.isLoading || memberships.isLoading;
  if (isLoading || !students.data) {
    return { results: [], isLoading };
  }

  const membershipByStudent = new Map(
    (memberships.data ?? []).map((membership) => [membership.studentPublicId, membership]),
  );

  const results: StudentSearchResult[] = students.data
    .filter((student) => matchesQuery(student, query))
    .map((student) => {
      const membership = membershipByStudent.get(student.publicId);
      return {
        student,
        className: membership?.className ?? null,
        programName: membership?.programName ?? null,
      };
    });

  return { results, isLoading: false };
}
