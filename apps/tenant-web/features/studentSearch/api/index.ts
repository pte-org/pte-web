"use client";

import { listClassMemberships, type ClassMembershipResponse, type UserResponse } from "@pte/api-client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useTenantStudents } from "@/features/examoperations/api";
import { CLASS_MEMBERSHIPS_QUERY_KEY } from "../constants";
import type { StudentSearchResult } from "../types";

/**
 * Tenant-wide roster (Phase 3's `GET /class-memberships`, unfiltered) — the
 * other half of this feature's client-side join against
 * `useTenantStudents()`. Shares no cache key with `features/classes`' or
 * `features/programs`' per-Program calls (those use `?programPublicId=`);
 * this hook always calls the unfiltered variant.
 */
function useClassMemberships(): UseQueryResult<ClassMembershipResponse[]> {
  return useQuery({
    queryKey: CLASS_MEMBERSHIPS_QUERY_KEY,
    queryFn: () => listClassMemberships(apiClient),
  });
}

function matchesQuery(user: UserResponse, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return (
    user.fullName.toLowerCase().includes(needle) || (user.phone ?? "").toLowerCase().includes(needle)
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
