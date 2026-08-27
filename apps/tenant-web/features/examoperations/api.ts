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

/** Persists step 1's (bulk-create) result until step 2 (bulk-enroll)
 * confirms — so an abandoned tab/browser crash/failed enroll never strands
 * a generated, unrecoverable password. Best-effort: sessionStorage can
 * throw (private browsing, storage disabled) — the download still works
 * this session either way, it just won't survive a reload. */
export function savePendingImport(sessionPublicId: string, created: CreatedAccount[]): void {
  try {
    sessionStorage.setItem(pendingImportKey(sessionPublicId), JSON.stringify(created));
  } catch {
    // ignore — best-effort persistence only
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
    // ignore
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
      // Await the students refetch before invalidating the roster: useSessionRoster
      // joins against students.data by closure, so if the roster refetch fires first
      // it would join against the still-stale (pre-enroll) student list and silently
      // drop the just-enrolled students until some unrelated refetch happens to catch up.
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
 * "Add individually" — deliberately calls `bulkCreateUsers` with a single
 * row rather than the plain single `POST /users` the plan originally
 * sketched: single-create requires the CALLER to supply a password (it was
 * designed for the "admin sets a password directly" UX used elsewhere,
 * e.g. vendor-web's login-account creation), which would mean either the
 * Host typing in a password for a student they're creating, or duplicating
 * Decision #6's `XXXX-XXXX` readable-password format in TypeScript. Reusing
 * the bulk endpoint (already built in Phase 0, its own
 * `PasswordGenerator.generateReadable()` already the single source of
 * truth for that format) avoids both — no new backend endpoint either way.
 *
 * Deliberately create-only, NOT create-then-enroll in one mutation
 * (quality-gate QUAL-001 fix): the original version awaited `enrollStudent`
 * inside the same try as the create call, so an enroll failure discarded
 * `created` — including its write/return-once `generatedPassword` — with no
 * recovery path, the exact risk the bulk-Excel path was already built to
 * avoid. The caller (`AddStudentForm`) now persists the created account via
 * `savePendingImport` immediately, then enrolls with the existing
 * `useEnrollRosterAccounts` (a single-element array is a valid "batch"),
 * getting the same recovery banner/retry/download guarantees the bulk path
 * has, instead of a second, weaker reimplementation of that safety net.
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
 * All STUDENT accounts in the caller's tenant (`GET /users`,
 * caller-tenant-scoped). Same `queryKey`/`queryFn` as `useTenantProctors`
 * (`features/exams/api`) — genuinely the same underlying request, one
 * shared cache entry — with the STUDENT-vs-PROCTOR split applied via
 * `select`, not via the query itself. Fixed a real bug (quality-gate
 * QUAL-101): both hooks previously shared one `queryKey` with two
 * DIFFERENT `queryFn` bodies (one filtering to STUDENT, one to PROCTOR),
 * and since `StudentRosterTable`/`ProctorAssignmentSection` genuinely
 * co-mount on the same session detail page, whichever query resolved
 * first silently populated the shared cache entry for BOTH observers —
 * `select` is the correct react-query mechanism for "same data, different
 * per-observer view," not a second `queryFn` under the same key.
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
      // Read the raw tenant-users cache directly instead of closing over
      // `students.data` (a per-render snapshot): this queryFn can run before
      // a re-render has picked up a just-refetched students list (the
      // await-ordering fix in useEnrollRosterAccounts only guarantees the
      // *cache* is fresh by then, not that this component has re-rendered
      // with it yet), which would otherwise silently drop just-enrolled
      // students from the join.
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
