"use client";

import {
  assignProctor,
  closeSession,
  createSession,
  createUser,
  getSession,
  listBlueprints,
  listProctorAssignments,
  listSessions,
  listUsers,
  openSession,
  publishBlueprint,
  unassignProctor,
  type BlueprintResponse,
  type SessionResponse,
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
  BLUEPRINTS_QUERY_KEY,
  PROCTOR_ASSIGNMENTS_QUERY_KEY,
  SESSION_QUERY_KEY,
  SESSIONS_QUERY_KEY,
  TENANT_USERS_QUERY_KEY,
} from "../constants";
import type {
  Blueprint,
  CreateProctorInput,
  CreateSessionInput,
  ExamSession,
  ProctorAssignmentEntry,
} from "../types";

const PROCTOR_ROLE = "PROCTOR";

function sessionResponseToExamSession(response: SessionResponse): ExamSession {
  return {
    id: response.publicId,
    name: response.name,
    snapshotPublicId: response.snapshotPublicId,
    opensAt: response.opensAt,
    closesAt: response.closesAt,
    status: response.status,
  };
}

function blueprintResponseToBlueprint(response: BlueprintResponse): Blueprint {
  return { id: response.publicId, name: response.name };
}

function replaceSessionInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: ExamSession,
): void {
  queryClient.setQueryData<ExamSession[]>(SESSIONS_QUERY_KEY, (previous = []) =>
    previous.map((session) => (session.id === updated.id ? updated : session)),
  );
  queryClient.setQueryData([...SESSION_QUERY_KEY, updated.id], updated);
}

export function useSessions(): UseQueryResult<ExamSession[]> {
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: async () => (await listSessions(apiClient)).map(sessionResponseToExamSession),
  });
}

export function useSession(publicId: string): UseQueryResult<ExamSession> {
  return useQuery({
    queryKey: [...SESSION_QUERY_KEY, publicId],
    queryFn: async () => sessionResponseToExamSession(await getSession(apiClient, publicId)),
    enabled: publicId.length > 0,
  });
}

export function useBlueprints(): UseQueryResult<Blueprint[]> {
  return useQuery({
    queryKey: BLUEPRINTS_QUERY_KEY,
    queryFn: async () => (await listBlueprints(apiClient)).map(blueprintResponseToBlueprint),
  });
}

/**
 * Publishes the chosen blueprint to a fresh snapshot, then creates the
 * session with that snapshot's publicId — one guided action from the
 * caller's perspective. Does not support re-using an already-published
 * blueprint's snapshot (no `GET /snapshots` list exists to look one up) —
 * documented limitation, see plan.md Research Summary item 5.
 *
 * No compensating action if `createSession` fails after `publishBlueprint`
 * already succeeded (quality-gate QUAL-002, accepted as-is): the new
 * snapshot stays published, unattached to any session. A same-blueprint
 * retry re-publishes again rather than reusing it (same root limitation as
 * above), so a failed create-after-publish followed by retries accumulates
 * unused snapshot rows — low-cost (no data corruption, no security impact,
 * just extra rows), not silently unconsidered.
 */
export function useCreateSession(): UseMutationResult<
  ExamSession,
  unknown,
  CreateSessionInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const snapshot = await publishBlueprint(apiClient, input.blueprintPublicId);
      const response = await createSession(apiClient, {
        name: input.name.trim(),
        snapshotPublicId: snapshot.publicId,
        opensAt: new Date(input.opensAt).toISOString(),
        closesAt: new Date(input.closesAt).toISOString(),
      });
      return sessionResponseToExamSession(response);
    },
    onSuccess: (session) => {
      queryClient.setQueryData<ExamSession[]>(SESSIONS_QUERY_KEY, (previous = []) => [
        session,
        ...previous.filter((existing) => existing.id !== session.id),
      ]);
      void queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}

export function useOpenSession(publicId: string): UseMutationResult<ExamSession, unknown, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => sessionResponseToExamSession(await openSession(apiClient, publicId)),
    onSuccess: (session) => replaceSessionInCache(queryClient, session),
  });
}

export function useCloseSession(publicId: string): UseMutationResult<ExamSession, unknown, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => sessionResponseToExamSession(await closeSession(apiClient, publicId)),
    onSuccess: (session) => replaceSessionInCache(queryClient, session),
  });
}

/**
 * All PROCTOR accounts in the caller's tenant (`GET /users`). Same
 * `queryKey`/`queryFn` as examoperations' `useTenantStudents` — a
 * genuinely shared cache entry, split via `select` (quality-gate
 * QUAL-101 fix — see that hook's doc comment for why `select`, not a
 * second differing `queryFn` under the same key, is required here).
 */
export function useTenantProctors(): UseQueryResult<UserResponse[]> {
  return useQuery({
    queryKey: TENANT_USERS_QUERY_KEY,
    queryFn: () => listUsers(apiClient),
    select: (users) => users.filter((user) => user.roles.includes(PROCTOR_ROLE)),
  });
}

/**
 * This session's assigned proctors, joined client-side against the
 * tenant's proctors (`ProctorAssignmentResponse` only carries
 * `proctorPublicId` — same join-here-not-in-scheduling reasoning as
 * Phase 1's Design Constraints for `EnrollmentResponse`).
 */
export function useProctorAssignments(sessionPublicId: string): UseQueryResult<ProctorAssignmentEntry[]> {
  const proctors = useTenantProctors();

  return useQuery({
    queryKey: [...PROCTOR_ASSIGNMENTS_QUERY_KEY, sessionPublicId],
    queryFn: async () => {
      const assignments = await listProctorAssignments(apiClient, sessionPublicId);
      const byId = new Map((proctors.data ?? []).map((proctor) => [proctor.publicId, proctor]));
      return assignments.flatMap((assignment) => {
        const proctor = byId.get(assignment.proctorPublicId);
        return proctor ? [{ assignmentPublicId: assignment.publicId, proctor }] : [];
      });
    },
    enabled: sessionPublicId.length > 0 && proctors.data !== undefined,
  });
}

function invalidateProctorAssignments(
  queryClient: ReturnType<typeof useQueryClient>,
  sessionPublicId: string,
): void {
  void queryClient.invalidateQueries({ queryKey: [...PROCTOR_ASSIGNMENTS_QUERY_KEY, sessionPublicId] });
}

/** Assign an already-existing Proctor (picked by publicId) to this session. */
export function useAssignProctor(sessionPublicId: string): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proctorPublicId) => {
      await assignProctor(apiClient, sessionPublicId, { proctorPublicId });
    },
    onSuccess: () => invalidateProctorAssignments(queryClient, sessionPublicId),
  });
}

export function useUnassignProctor(sessionPublicId: string): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentPublicId) => unassignProctor(apiClient, sessionPublicId, assignmentPublicId),
    onSuccess: () => invalidateProctorAssignments(queryClient, sessionPublicId),
  });
}

/**
 * Create a brand-new Proctor account (tenant-wide identity — not yet
 * assigned to anything). Uses single `POST /users` with a Host-supplied
 * password (mirrors vendor-web's `useCreateLoginAccount` precedent:
 * "admin sets a password directly" — unlike Phase 4's Excel-import path,
 * this is a one-at-a-time form, so there's no auto-generation need and no
 * `PasswordGenerator` format to duplicate).
 */
export function useCreateProctorAccount(): UseMutationResult<UserResponse, unknown, CreateProctorInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) =>
      createUser(apiClient, {
        email: input.email.trim(),
        fullName: input.fullName.trim(),
        password: input.password,
        roles: [PROCTOR_ROLE],
        tenantId: null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
    },
  });
}
