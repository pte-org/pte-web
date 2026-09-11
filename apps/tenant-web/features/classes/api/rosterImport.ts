"use client";

import {
  bulkCreateUsers,
  listStudentEnrollments,
  type BulkCreateUsersResponse,
  type StudentEnrollmentResponse,
} from "@pte/api-client";
import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { RosterRow } from "@/features/examoperations/types";

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
