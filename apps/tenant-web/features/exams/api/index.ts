"use client";

import { useRef, useState } from "react";
import {
  assignProctor,
  bulkEnroll,
  closeSession,
  createSession,
  createUser,
  getAnswer,
  getSession,
  listAnswers,
  listBlueprints,
  listProctorAssignments,
  listSessions,
  listUsers,
  openSession,
  publishBlueprint,
  submitTeacherScore,
  unassignProctor,
  updateProctorRole,
  type AnswerListResponse,
  type AnswerReviewDetailResponse,
  type BlueprintResponse,
  type BulkEnrollResponse,
  type ProctorRole,
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
  ANSWER_QUERY_KEY,
  ANSWERS_QUERY_KEY,
  BLUEPRINTS_QUERY_KEY,
  ENROLLMENTS_QUERY_KEY,
  PROCTOR_ASSIGNMENTS_QUERY_KEY,
  SESSION_QUERY_KEY,
  SESSIONS_QUERY_KEY,
  TENANT_USERS_QUERY_KEY,
} from "../constants";
import type {
  Blueprint,
  BulkCreateSessionsForProgramInput,
  CreateProctorInput,
  CreateSessionInput,
  ExamSession,
  ProctorAssignmentEntry,
  SessionBatchState,
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
    capacity: response.capacity,
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
        capacity: input.capacity ?? null,
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
        return proctor ? [{ assignmentPublicId: assignment.publicId, proctor, role: assignment.role }] : [];
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

interface AssignProctorInput {
  proctorPublicId: string;
  role: ProctorRole;
}

/** Assign an already-existing Proctor (picked by publicId) to this session, with a chosen role. */
export function useAssignProctor(
  sessionPublicId: string,
): UseMutationResult<void, unknown, AssignProctorInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proctorPublicId, role }) => {
      await assignProctor(apiClient, sessionPublicId, { proctorPublicId, role });
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

interface UpdateProctorRoleInput {
  assignmentPublicId: string;
  role: ProctorRole;
}

export function useUpdateProctorRole(
  sessionPublicId: string,
): UseMutationResult<void, unknown, UpdateProctorRoleInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentPublicId, role }) => {
      await updateProctorRole(apiClient, sessionPublicId, assignmentPublicId, { role });
    },
    onSuccess: () => invalidateProctorAssignments(queryClient, sessionPublicId),
  });
}

/**
 * Create a brand-new Proctor account (not yet assigned to anything). Uses a
 * Host-supplied password, mirroring vendor-web's `useCreateLoginAccount` —
 * a one-at-a-time form has no need for the bulk-import password generator.
 */
/**
 * A session's submitted answers, tenant-scoped server-side (host never
 * passes tenantId — see scoring's ScoringReviewService doc comment).
 * `statusFilter` empty string means "all statuses".
 */
export function useAnswers(
  sessionPublicId: string,
  statusFilter: string,
  page: number,
): UseQueryResult<AnswerListResponse> {
  return useQuery({
    queryKey: [...ANSWERS_QUERY_KEY, sessionPublicId, statusFilter, page],
    queryFn: () =>
      listAnswers(apiClient, {
        sessionPublicId,
        status: statusFilter || undefined,
        page,
      }),
    enabled: sessionPublicId.length > 0,
  });
}

/** Full decoded content (+ presigned audio URL when applicable) for one answer, fetched only when a detail modal is open. */
export function useAnswer(answerPublicId: string | null): UseQueryResult<AnswerReviewDetailResponse> {
  return useQuery({
    queryKey: [...ANSWER_QUERY_KEY, answerPublicId],
    queryFn: () => getAnswer(apiClient, answerPublicId as string),
    enabled: !!answerPublicId,
  });
}

/**
 * Records a host's own independent score — parallel to the AI's `rawScore`,
 * never gated by answer status, never affects attempt completion (see
 * scoring's ScoringReviewService.submitTeacherScore doc comment).
 */
export function useSubmitTeacherScore(
  answerPublicId: string,
): UseMutationResult<void, unknown, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (score) => {
      await submitTeacherScore(apiClient, answerPublicId, { score });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...ANSWER_QUERY_KEY, answerPublicId] });
      void queryClient.invalidateQueries({ queryKey: ANSWERS_QUERY_KEY });
    },
  });
}

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

interface BulkEnrollStudentsInput {
  sessionPublicId: string;
  studentPublicIds: string[];
}

/**
 * Enrolls a resolved list of students into a session. Unlike `useUnenroll`/
 * `useSessionRoster`, the target session isn't known at hook-instantiation
 * time here — Phase 10's whole-Program flow only learns the session's
 * publicId once `useCreateSession` resolves — so `sessionPublicId` travels
 * with each `mutate()` call instead of being bound as a hook argument.
 */
export function useBulkEnrollStudents(): UseMutationResult<BulkEnrollResponse, unknown, BulkEnrollStudentsInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionPublicId, studentPublicIds }) =>
      bulkEnroll(apiClient, sessionPublicId, { studentPublicIds }),
    onSuccess: (_response, { sessionPublicId }) => {
      void queryClient.invalidateQueries({ queryKey: [...ENROLLMENTS_QUERY_KEY, sessionPublicId] });
    },
  });
}

/**
 * Splits a roster into `ceil(N / studentsPerSession)` contiguous,
 * non-overlapping chunks — standard array chunking, so "every student
 * appears in exactly one batch" holds by construction, not by a runtime
 * check. Omitted/non-positive `studentsPerSession` (Phase 10's original
 * call shape) yields exactly one batch containing the whole roster.
 */
function splitIntoBatches(studentPublicIds: string[], studentsPerSession?: number): string[][] {
  if (!studentsPerSession || studentsPerSession <= 0) {
    return [studentPublicIds];
  }
  const batches: string[][] = [];
  for (let i = 0; i < studentPublicIds.length; i += studentsPerSession) {
    batches.push(studentPublicIds.slice(i, i + studentsPerSession));
  }
  return batches;
}

/** Only suffixed when actually split — a single batch keeps Phase 10's original, unsuffixed session name. */
function batchSessionName(baseName: string, index: number, total: number): string {
  return total > 1 ? `${baseName} - Batch ${index + 1}` : baseName;
}

interface RunSessionFields {
  name: string;
  blueprintPublicId: string;
  opensAt: string;
  closesAt: string;
  capacity?: number;
}

/**
 * Orchestrates Phase 10/11's whole-Program exam creation: split the
 * already-resolved roster into capacity-sized batches (one batch = Phase
 * 10's original single-session behavior), then for each batch, sequentially
 * (never parallel, per Design Constraints) create a session and bulk-enroll
 * that batch into it. Each created session's own `capacity` is set to the
 * Host-specified `studentsPerSession` ceiling — so even if this client-side
 * batch math ever has a bug and a batch ends up oversized, `bulkEnroll`'s
 * server-side capacity check (Phase 11) rejects it rather than silently
 * over-enrolling.
 *
 * Reuses `useCreateSession`/`useBulkEnrollStudents` (their `mutateAsync`)
 * for the actual network calls and cache invalidation, driving them with a
 * plain imperative loop rather than one shared `useMutation` — needed
 * because this is N sequential steps of unknown-until-runtime count, not a
 * single request/response pair. `retryBatch` resumes the sequential loop
 * from the failed batch onward (re-attempting session creation too, if that
 * was the step that failed) rather than requiring the Host to retry every
 * batch by hand.
 *
 * `cancelledRef` (quality-gate finding: closing the modal mid-run
 * previously kept creating every remaining batch silently in the
 * background, since unmounting this hook doesn't cancel its in-flight
 * `async` loop) — `reset()` sets it, and `runFrom`'s loop checks it before
 * starting each new batch, so closing stops any batch that hasn't started
 * yet. The one batch already in flight at the moment of closing still
 * completes (this repo's `apiClient` has no `AbortController` wiring to
 * cancel an in-progress request) — a deliberately-scoped, documented
 * residual limitation, not the original "every remaining batch fires"
 * problem.
 *
 * **Accepted residual risk (quality-gate finding, reverted after a worse
 * regression):** a Host-triggered `retryBatch` after a client-observed
 * session-creation failure (e.g. a dropped connection) whose request
 * actually committed server-side will create a second, orphaned session
 * for that batch rather than detecting and reusing the first. An earlier
 * version of this hook tried to guard against that by reusing any existing
 * tenant-wide session sharing the batch's exact name — but `listSessions`
 * has no Program/blueprint scoping and `ExamSession` carries none either,
 * so that lookup could just as easily match a *different*, unrelated exam
 * that happens to share a name (a realistic collision — Hosts commonly
 * reuse names like "Mid-term PTE Mock Test" every term), silently
 * enrolling this batch's students into someone else's session instead.
 * That failure mode (misdirected enrollment) is strictly worse than the
 * one being guarded against (an extra, correctly-enrolled session), so the
 * lookup was removed. Fixing this properly needs real
 * idempotency-key infrastructure (none exists anywhere in this repo today)
 * — out of this phase's scope; the narrower duplicate-session risk is
 * accepted instead.
 */
export function useBulkCreateSessionForProgram(): {
  batches: SessionBatchState[];
  isRunning: boolean;
  run: (input: BulkCreateSessionsForProgramInput) => void;
  retryBatch: (index: number) => void;
  reset: () => void;
} {
  const createSessionMutation = useCreateSession();
  const bulkEnrollStudentsMutation = useBulkEnrollStudents();
  const [batches, setBatches] = useState<SessionBatchState[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const sessionFieldsRef = useRef<RunSessionFields>({ name: "", blueprintPublicId: "", opensAt: "", closesAt: "" });
  const cancelledRef = useRef(false);

  const runBatch = async (index: number, current: SessionBatchState[]): Promise<SessionBatchState[]> => {
    let working = current;
    const patch = (update: Partial<SessionBatchState>): void => {
      working = working.map((batch, i) => (i === index ? { ...batch, ...update } : batch));
      setBatches(working);
    };

    let session = working[index].session;
    if (!session) {
      patch({ status: "creatingSession", error: null });
      try {
        session = await createSessionMutation.mutateAsync({
          name: batchSessionName(sessionFieldsRef.current.name, index, working.length),
          blueprintPublicId: sessionFieldsRef.current.blueprintPublicId,
          opensAt: sessionFieldsRef.current.opensAt,
          closesAt: sessionFieldsRef.current.closesAt,
          capacity: sessionFieldsRef.current.capacity,
        });
      } catch (error) {
        patch({ status: "sessionError", error });
        return working;
      }
      patch({ session, status: "enrolling" });
    } else {
      patch({ status: "enrolling", error: null });
    }

    try {
      const response = await bulkEnrollStudentsMutation.mutateAsync({
        sessionPublicId: session.id,
        studentPublicIds: working[index].studentPublicIds,
      });
      patch({ status: "success", enrolled: response.enrolled });
    } catch (error) {
      patch({ status: "enrollError", error });
    }
    return working;
  };

  const runFrom = async (startIndex: number, initial: SessionBatchState[]): Promise<void> => {
    setIsRunning(true);
    let current = initial;
    for (let i = startIndex; i < current.length; i += 1) {
      if (cancelledRef.current) break;
      current = await runBatch(i, current);
      if (current[i].status !== "success") break;
    }
    setIsRunning(false);
  };

  const run = (input: BulkCreateSessionsForProgramInput): void => {
    cancelledRef.current = false;
    sessionFieldsRef.current = {
      name: input.name,
      blueprintPublicId: input.blueprintPublicId,
      opensAt: input.opensAt,
      closesAt: input.closesAt,
      capacity: input.studentsPerSession,
    };
    const chunks = splitIntoBatches(input.studentPublicIds, input.studentsPerSession);
    const initial: SessionBatchState[] = chunks.map((studentPublicIds, index) => ({
      index,
      total: chunks.length,
      studentPublicIds,
      session: null,
      enrolled: [],
      status: "pending",
      error: null,
    }));
    setBatches(initial);
    void runFrom(0, initial);
  };

  const retryBatch = (index: number): void => {
    cancelledRef.current = false;
    void runFrom(index, batches);
  };

  const reset = (): void => {
    cancelledRef.current = true;
    createSessionMutation.reset();
    bulkEnrollStudentsMutation.reset();
    setBatches([]);
    setIsRunning(false);
  };

  return { batches, isRunning, run, retryBatch, reset };
}
