"use client";

import {
  assignClass,
  assignProctor,
  closeSession,
  cancelExam,
  addAudienceSource,
  createSession,
  createExamDraft,
  createUser,
  getAnswer,
  getActiveScoreTemplate,
  getSession,
  listAnswers,
  listAssignedClasses,
  listProctorAssignments,
  listSessions,
  listUsers,
  openSession,
  preflightExam,
  generateExam,
  publishExam,
  submitTeacherScore,
  unassignClass,
  unassignProctor,
  updateProctorRole,
  type AnswerListResponse,
  type AnswerReviewDetailResponse,
  type ProctorRole,
  type SessionResponse,
  type ScoreTemplateResponse,
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
import { UserFacingError } from "@/features/examoperations/errorMessage";
import { useAllTenantClasses } from "@/features/classes/api";
import {
  CREATE_EXAM_WIZARD_TEXT,
  ANSWER_QUERY_KEY,
  ANSWERS_QUERY_KEY,
  ASSIGNED_CLASSES_QUERY_KEY,
  ENROLLMENTS_QUERY_KEY,
  PROCTOR_ASSIGNMENTS_QUERY_KEY,
  SESSION_QUERY_KEY,
  SESSIONS_QUERY_KEY,
  TENANT_USERS_QUERY_KEY,
} from "../constants";
import type {
  AssignedClass,
  CreateProctorInput,
  CreateSessionInput,
  ExamSession,
  ProctorAssignmentEntry,
  CreateExamWorkflowInput,
} from "../types";

const PROCTOR_ROLE = "PROCTOR";

function sessionResponseToExamSession(response: SessionResponse): ExamSession {
  return {
    id: response.publicId,
    name: response.name,
    subscriptionPublicId: response.subscriptionPublicId,
    snapshotPublicId: response.snapshotPublicId,
    opensAt: response.opensAt,
    closesAt: response.closesAt,
    status: response.status,
    capacity: response.capacity,
  };
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

/**
 * Creates the exam directly from the chosen skills — the backend randomly
 * generates the question set and publishes it in one all-or-nothing
 * transaction (Plan B). No blueprint/snapshot step on this side anymore.
 */
export function useCreateSession(): UseMutationResult<ExamSession, unknown, CreateSessionInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const response = await createSession(apiClient, {
        name: input.name.trim(),
        subscriptionPublicId: input.subscriptionPublicId,
        skills: input.skills,
        opensAt: new Date(input.opensAt).toISOString(),
        closesAt: new Date(input.closesAt).toISOString(),
        capacity: Number(input.capacity),
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

export function useActiveScoreTemplate(): UseQueryResult<ScoreTemplateResponse> {
  return useQuery({
    queryKey: ["activeScoreTemplate"],
    queryFn: () => getActiveScoreTemplate(apiClient),
  });
}

/** Runs the canonical draft -> audience -> preflight -> generation -> publish flow. */
export function useCreateExamWorkflow(): UseMutationResult<
  ExamSession,
  unknown,
  CreateExamWorkflowInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const draft = await createExamDraft(apiClient, {
        name: input.name.trim(),
        templatePublicId: input.templatePublicId,
        subscriptionPublicId: input.subscriptionPublicId,
        opensAt: new Date(input.opensAt).toISOString(),
        closesAt: new Date(input.closesAt).toISOString(),
        examMode: input.examMode,
        formMode: input.formMode,
        reusePolicy: input.reusePolicy,
        seriesKey: input.seriesKey.trim() || null,
        capacity: Number(input.capacity),
      });
      for (const source of input.sources) {
        await addAudienceSource(apiClient, draft.publicId, source);
      }
      const preflight = await preflightExam(apiClient, draft.publicId);
      if (!preflight.ready) {
        const details = preflight.issues
          .map((issue) => CREATE_EXAM_WIZARD_TEXT.PREFLIGHT_ISSUE_MESSAGES[issue])
          .filter((message): message is string => Boolean(message));
        throw new UserFacingError(
          details.length > 0
            ? `${CREATE_EXAM_WIZARD_TEXT.PREFLIGHT_BLOCKED} ${details.join(" ")}`
            : CREATE_EXAM_WIZARD_TEXT.PREFLIGHT_BLOCKED,
        );
      }
      await generateExam(apiClient, draft.publicId, globalThis.crypto.randomUUID());
      return sessionResponseToExamSession(await publishExam(apiClient, draft.publicId));
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

export function useCancelSession(publicId: string): UseMutationResult<ExamSession, unknown, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => sessionResponseToExamSession(await cancelExam(apiClient, publicId)),
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
export function useProctorAssignments(
  sessionPublicId: string,
): UseQueryResult<ProctorAssignmentEntry[]> {
  const proctors = useTenantProctors();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...PROCTOR_ASSIGNMENTS_QUERY_KEY, sessionPublicId],
    queryFn: async () => {
      const assignments = await listProctorAssignments(apiClient, sessionPublicId);
      // Read the cache directly rather than closing over `proctors.data` (a
      // per-render snapshot) — same race as examoperations' useSessionRoster.
      const allUsers =
        queryClient.getQueryData<UserResponse[]>(TENANT_USERS_QUERY_KEY) ?? proctors.data ?? [];
      const byId = new Map(
        allUsers
          .filter((user) => user.roles.includes(PROCTOR_ROLE))
          .map((proctor) => [proctor.publicId, proctor]),
      );
      return assignments.flatMap((assignment) => {
        const proctor = byId.get(assignment.proctorPublicId);
        return proctor
          ? [{ assignmentPublicId: assignment.publicId, proctor, role: assignment.role }]
          : [];
      });
    },
    enabled: sessionPublicId.length > 0 && proctors.data !== undefined,
  });
}

function invalidateProctorAssignments(
  queryClient: ReturnType<typeof useQueryClient>,
  sessionPublicId: string,
): void {
  void queryClient.invalidateQueries({
    queryKey: [...PROCTOR_ASSIGNMENTS_QUERY_KEY, sessionPublicId],
  });
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

export function useUnassignProctor(
  sessionPublicId: string,
): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentPublicId) =>
      unassignProctor(apiClient, sessionPublicId, assignmentPublicId),
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
export function useAnswer(
  answerPublicId: string | null,
): UseQueryResult<AnswerReviewDetailResponse> {
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

export function useCreateProctorAccount(): UseMutationResult<
  UserResponse,
  unknown,
  CreateProctorInput
> {
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

/**
 * A session's assigned Classes, joined client-side against the tenant's own
 * Class list (`SessionClassAssignmentResponse` only carries `classPublicId`
 * — same join-here-not-in-scheduling shape as `useProctorAssignments` above).
 */
export function useAssignedClasses(sessionPublicId: string): UseQueryResult<AssignedClass[]> {
  const tenantClasses = useAllTenantClasses();

  return useQuery({
    queryKey: [...ASSIGNED_CLASSES_QUERY_KEY, sessionPublicId],
    queryFn: async () => {
      const assignments = await listAssignedClasses(apiClient, sessionPublicId);
      const byId = new Map(
        (tenantClasses.data ?? []).map((option) => [option.classPublicId, option]),
      );
      return assignments.flatMap((assignment) => {
        const option = byId.get(assignment.classPublicId);
        return option
          ? [
              {
                classPublicId: option.classPublicId,
                className: option.className,
                programName: option.programName,
              },
            ]
          : [];
      });
    },
    enabled: sessionPublicId.length > 0 && tenantClasses.data !== undefined,
  });
}

function invalidateClassAssignments(
  queryClient: ReturnType<typeof useQueryClient>,
  sessionPublicId: string,
): void {
  void queryClient.invalidateQueries({
    queryKey: [...ASSIGNED_CLASSES_QUERY_KEY, sessionPublicId],
  });
  void queryClient.invalidateQueries({ queryKey: [...ENROLLMENTS_QUERY_KEY, sessionPublicId] });
}

/** Assigns a Class — enrolls every current member into this session (backend Phase 4). */
export function useAssignClass(sessionPublicId: string): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classPublicId: string) => {
      await assignClass(apiClient, sessionPublicId, { classPublicId });
    },
    onSuccess: () => invalidateClassAssignments(queryClient, sessionPublicId),
  });
}

/** Unassigns a Class — removes the enrollments of that Class's current members only. */
export function useUnassignClass(
  sessionPublicId: string,
): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classPublicId: string) => unassignClass(apiClient, sessionPublicId, classPublicId),
    onSuccess: () => invalidateClassAssignments(queryClient, sessionPublicId),
  });
}
