"use client";

import {
  bulkCreateUsers,
  bulkEnroll,
  listEnrollments,
  listUsers,
  resetPassword as resetPasswordRequest,
  unenroll,
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
import {
  ENROLLMENTS_QUERY_KEY,
  TENANT_USERS_QUERY_KEY,
} from "@/features/exams/constants";
import type { CreatedAccount, RosterRow } from "./types";

const PENDING_IMPORT_KEY_PREFIX = "pte.pendingImport.";
const STUDENT_ROLE = "STUDENT";

function pendingImportKey(sessionPublicId: string): string {
  return `${PENDING_IMPORT_KEY_PREFIX}${sessionPublicId}`;
}

/** Persists step 1's result until step 2 confirms, so a crash/failed enroll never strands a generated password. Best-effort — sessionStorage may throw (private browsing). */
export function savePendingImport(sessionPublicId: string, created: CreatedAccount[]): void {
  try {
    sessionStorage.setItem(pendingImportKey(sessionPublicId), JSON.stringify(created));
  } catch {
    // best-effort — ignore
  }
}

export function loadPendingImport(sessionPublicId: string): CreatedAccount[] | null {
  try {
    const raw = sessionStorage.getItem(pendingImportKey(sessionPublicId));
    return raw ? (JSON.parse(raw) as CreatedAccount[]) : null;
  } catch {
    return null;
  }
}

export function clearPendingImport(sessionPublicId: string): void {
  try {
    sessionStorage.removeItem(pendingImportKey(sessionPublicId));
  } catch {
    // best-effort — ignore
  }
}

/** Step 1: create N accounts via Excel roster. Persists the result to
 * sessionStorage immediately on success — see `savePendingImport`. */
export function useCreateRosterAccounts(
  sessionPublicId: string,
): UseMutationResult<BulkCreateUsersResponse, unknown, RosterRow[]> {
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
    onSuccess: (response) => savePendingImport(sessionPublicId, response.created),
  });
}

/** Step 2: enroll the accounts step 1 created into this session. Clears the
 * sessionStorage entry only on success — a failed/retried call leaves it in
 * place so the recovery banner can offer another retry. */
export function useEnrollRosterAccounts(
  sessionPublicId: string,
): UseMutationResult<void, unknown, CreatedAccount[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (created) => {
      await bulkEnroll(apiClient, sessionPublicId, {
        studentPublicIds: created.map((account) => account.publicId),
      });
    },
    onSuccess: async () => {
      clearPendingImport(sessionPublicId);
      // Must resolve before the roster invalidation below — useSessionRoster
      // joins against this cache, so a stale read here would drop the
      // just-enrolled students from the roster.
      await queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [...ENROLLMENTS_QUERY_KEY, sessionPublicId] });
    },
  });
}

export interface AddStudentInput {
  email: string;
  fullName: string;
  studentCode?: string;
  className?: string;
  phone?: string;
  dateOfBirth?: string;
}

/**
 * "Add individually" reuses `bulkCreateUsers` with a single row instead of
 * a plain `POST /users`, so the server-generated `XXXX-XXXX` password format
 * doesn't need duplicating client-side. Deliberately create-only — the
 * caller enrolls separately via `useEnrollRosterAccounts` (a single-element
 * array is a valid "batch"), so an enroll failure can't strand the
 * write-once `generatedPassword` with no recovery path.
 */
export function useCreateStudent(): UseMutationResult<CreatedAccount, unknown, AddStudentInput> {
  return useMutation({
    mutationFn: async (input) => {
      const response = await bulkCreateUsers(apiClient, {
        rows: [
          {
            email: input.email,
            fullName: input.fullName,
            studentCode: input.studentCode ?? null,
            className: input.className ?? null,
            phone: input.phone ?? null,
            dateOfBirth: input.dateOfBirth ?? null,
          },
        ],
        tenantId: null,
      });
      const [created] = response.created;
      if (!created) {
        const [skipped] = response.skipped;
        throw new Error(skipped ? skipped.reason : "Unable to create account");
      }
      return created;
    },
  });
}

/**
 * All STUDENT accounts in the caller's tenant. Shares `queryKey`+`queryFn`
 * with `useTenantProctors` (`features/exams/api`) — one cache entry, split
 * via `select`, not two different `queryFn`s under the same key (which would
 * let whichever resolves first silently populate the cache for both).
 */
export function useTenantStudents(): UseQueryResult<UserResponse[]> {
  return useQuery({
    queryKey: TENANT_USERS_QUERY_KEY,
    queryFn: () => listUsers(apiClient),
    select: (users) => users.filter((user) => user.roles.includes(STUDENT_ROLE)),
  });
}

export interface RosterEntry {
  enrollmentPublicId: string;
  student: UserResponse;
}

/**
 * This session's roster, joined client-side against the tenant's students
 * (scheduling's `EnrollmentResponse` only carries `studentPublicId` — the
 * name/email join happens here rather than a new cross-service call from
 * scheduling, per Phase 1's Design Constraints).
 */
export function useSessionRoster(sessionPublicId: string): UseQueryResult<RosterEntry[]> {
  const students = useTenantStudents();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...ENROLLMENTS_QUERY_KEY, sessionPublicId],
    queryFn: async () => {
      const enrollments = await listEnrollments(apiClient, sessionPublicId);
      // Read the cache directly rather than closing over `students.data` (a
      // per-render snapshot) — this can run before a re-render has picked up
      // a just-refetched list, silently dropping just-enrolled students.
      const allUsers = queryClient.getQueryData<UserResponse[]>(TENANT_USERS_QUERY_KEY) ?? students.data ?? [];
      const byId = new Map(
        allUsers
          .filter((user) => user.roles.includes(STUDENT_ROLE))
          .map((student) => [student.publicId, student]),
      );
      return enrollments.flatMap((enrollment) => {
        const student = byId.get(enrollment.studentPublicId);
        return student ? [{ enrollmentPublicId: enrollment.publicId, student }] : [];
      });
    },
    enabled: sessionPublicId.length > 0 && students.data !== undefined,
  });
}

export function useResetStudentPassword(
  studentPublicId: string,
): UseMutationResult<UserResponse, unknown, string> {
  return useMutation({
    mutationFn: (newPassword) =>
      resetPasswordRequest(apiClient, studentPublicId, { newPassword }),
  });
}

export function useUnenroll(sessionPublicId: string): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentPublicId) => unenroll(apiClient, sessionPublicId, enrollmentPublicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...ENROLLMENTS_QUERY_KEY, sessionPublicId] });
    },
  });
}
