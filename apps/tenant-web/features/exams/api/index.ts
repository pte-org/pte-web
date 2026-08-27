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
 * caller's perspective. No `GET /snapshots` list exists, so an already-
 * published blueprint's snapshot can't be reused; a retry after a
 * publish-succeeded-but-create-failed run re-publishes again, accumulating
 * unattached snapshot rows (accepted — no data/security impact, just extra rows).
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
 * All PROCTOR accounts in the caller's tenant. Shares `queryKey`+`queryFn`
 * with examoperations' `useTenantStudents` — one cache entry, split via
 * `select` (see that hook's doc comment for why).
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
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...PROCTOR_ASSIGNMENTS_QUERY_KEY, sessionPublicId],
    queryFn: async () => {
      const assignments = await listProctorAssignments(apiClient, sessionPublicId);
      // Read the cache directly rather than closing over `proctors.data` (a
      // per-render snapshot) — same race as examoperations' useSessionRoster.
      const allUsers = queryClient.getQueryData<UserResponse[]>(TENANT_USERS_QUERY_KEY) ?? proctors.data ?? [];
      const byId = new Map(
        allUsers
          .filter((user) => user.roles.includes(PROCTOR_ROLE))
          .map((proctor) => [proctor.publicId, proctor]),
      );
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
 * Create a brand-new Proctor account (not yet assigned to anything). Uses a
 * Host-supplied password, mirroring vendor-web's `useCreateLoginAccount` —
 * a one-at-a-time form has no need for the bulk-import password generator.
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
    // Awaited so AssignProctorModal's chained useAssignProctor call (fired
    // from this mutation's onSuccess) sees the just-created proctor already
    // in the tenant-users cache.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TENANT_USERS_QUERY_KEY });
    },
  });
}
