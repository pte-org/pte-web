"use client";

import {
  assignProctor,
  commitExaminerAssignment,
  closeSession,
  cancelExam,
  deleteSession as deleteSessionRequest,
  addAudienceSources,
  createSession,
  createExamDraft,
  DEFAULT_PAGE_SIZE,
  getAnswer,
  getHostScoreReview,
  getActiveScoreTemplate,
  getExaminerAssignmentRoster,
  getSession,
  getSessionExamPreview,
  listAnswers,
  preflightReportPublication,
  publishSessionReports,
  getReportPublicationSummary,
  listAllExamStaff,
  listProctorAssignments,
  listSessions,
  listUsers,
  openSession,
  patchExamDraft,
  patchExamPolicy,
  patchExamSchedule,
  preflightExam,
  generateExam,
  publishExam,
  unassignProctor,
  updateProctorRole,
  type AnswerListResponse,
  type AnswerReviewDetailResponse,
  type HostScoreReviewResponse,
  type ReportPublicationReadinessResponse,
  type ReportPublicationSummaryResponse,
  type CommitExaminerAssignmentRequest,
  type ExaminerAssignmentRosterResponse,
  type ExamPreviewResponse,
  type ExamPolicyResponse,
  type LockdownMode,
  type PatchExamDraftRequest,
  type PatchExamPolicyRequest,
  type PatchExamScheduleRequest,
  type ProctorRole,
  type SessionStatus,
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
import { HOST_DASHBOARD_QUERY_KEY } from "@/features/hostDashboard/constants";
import { ExamPreflightBlockedError } from "../utils/examPreflight";
import {
  CREATE_EXAM_WIZARD_ERRORS,
  ANSWER_QUERY_KEY,
  EXAM_PREVIEW_QUERY_KEY,
  ANSWERS_QUERY_KEY,
  PROCTOR_ASSIGNMENTS_QUERY_KEY,
  SESSION_QUERY_KEY,
  SESSIONS_QUERY_KEY,
  TENANT_USERS_QUERY_KEY,
  EXAMINER_ASSIGNMENT_ROSTER_QUERY_KEY,
  EXAMINER_DIRECTORY_QUERY_KEY,
  HOST_SCORE_REVIEW_QUERY_KEY,
  REPORT_PUBLICATION_READINESS_QUERY_KEY,
  REPORT_PUBLICATION_SUMMARY_QUERY_KEY,
  OFFICIAL_EXAM_LOCKDOWN_MODE,
  OFFICIAL_EXAM_MODE,
} from "../constants";
import type {
  CreateSessionInput,
  ExamSession,
  ExamSkill,
  ProctorAssignmentEntry,
  CreateExamWorkflowInput,
} from "../types";

const PROCTOR_ROLE = "PROCTOR";

export type ExamStatusTransitionTarget = SessionStatus;

function sessionResponseToExamSession(response: SessionResponse): ExamSession {
  return {
    id: response.publicId,
    sessionCode: response.sessionCode ?? response.publicId,
    name: response.name,
    subscriptionPublicId: response.subscriptionPublicId,
    examVersionPublicId: response.examVersionPublicId,
    opensAt: response.opensAt,
    closesAt: response.closesAt,
    status: response.status,
    capacity: response.capacity,
    templatePublicId: response.examDefinitionPublicId,
    examDefinitionVersion: response.examDefinitionVersion,
    reusePolicy: response.reusePolicy,
    seriesKey: response.seriesKey,
    draftVersion: response.draftVersion,
    examMode: response.examMode,
    policy: response.policy ?? null,
    selectedSkills: (response.selectedSkills ?? []) as ExamSkill[],
    maxRetriesPerStudent: response.maxRetriesPerStudent ?? 0,
  };
}

function assertResolvedPolicy(response: SessionResponse, expected: LockdownMode): void {
  if (response.policy?.lockdownMode !== expected) {
    throw new UserFacingError(CREATE_EXAM_WIZARD_ERRORS.POLICY_MISMATCH);
  }
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

function replaceSessionPolicyInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  publicId: string,
  policy: ExamPolicyResponse,
): void {
  queryClient.setQueryData<ExamSession[]>(SESSIONS_QUERY_KEY, (previous = []) =>
    previous.map((session) => (session.id === publicId ? { ...session, policy } : session)),
  );
  queryClient.setQueryData<ExamSession>([...SESSION_QUERY_KEY, publicId], (previous) =>
    previous ? { ...previous, policy } : previous,
  );
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
    refetchInterval: (query) =>
      query.state.data?.status === "OPEN" || query.state.data?.status === "SCHEDULED"
        ? 30_000
        : false,
  });
}

export function useUpdateExamDraft(
  publicId: string,
): UseMutationResult<ExamSession, unknown, PatchExamDraftRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      sessionResponseToExamSession(await patchExamDraft(apiClient, publicId, payload)),
    onSuccess: (session) => replaceSessionInCache(queryClient, session),
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY, publicId] });
    },
  });
}

export function useUpdateExamPolicy(
  publicId: string,
): UseMutationResult<ExamPolicyResponse, unknown, PatchExamPolicyRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => patchExamPolicy(apiClient, publicId, payload),
    onSuccess: (policy) => replaceSessionPolicyInCache(queryClient, publicId, policy),
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY, publicId] });
    },
  });
}

export function useUpdateExamSchedule(
  publicId: string,
): UseMutationResult<ExamSession, unknown, PatchExamScheduleRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      sessionResponseToExamSession(await patchExamSchedule(apiClient, publicId, payload)),
    onSuccess: (session) => replaceSessionInCache(queryClient, session),
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY, publicId] });
    },
  });
}

export function useSessionExamPreview(
  publicId: string,
  enabled: boolean,
): UseQueryResult<ExamPreviewResponse> {
  return useQuery({
    queryKey: [...EXAM_PREVIEW_QUERY_KEY, publicId],
    queryFn: () => getSessionExamPreview(apiClient, publicId),
    enabled: enabled && publicId.length > 0,
    staleTime: 4 * 60 * 1000,
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
      void queryClient.invalidateQueries({ queryKey: HOST_DASHBOARD_QUERY_KEY });
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
      const expectedLockdownMode = OFFICIAL_EXAM_LOCKDOWN_MODE;
      // selectedSkills is omitted on purpose: the server then uses the full template scope.
      const draft = await createExamDraft(apiClient, {
        name: input.name.trim(),
        examDefinitionPublicId: input.templatePublicId,
        subscriptionPublicId: input.subscriptionPublicId,
        opensAt: new Date(input.opensAt).toISOString(),
        closesAt: new Date(input.closesAt).toISOString(),
        examMode: OFFICIAL_EXAM_MODE,
        lockdownMode: expectedLockdownMode,
        maxRetriesPerStudent: Number(input.maxRetriesPerStudent),
        reusePolicy: input.reusePolicy,
        seriesKey: input.seriesKey.trim() || null,
        capacity: Number(input.capacity),
      });
      assertResolvedPolicy(draft, expectedLockdownMode);
      // One atomic request: the draft never ends up with a partial audience.
      await addAudienceSources(apiClient, draft.publicId, input.sources);
      const preflight = await preflightExam(apiClient, draft.publicId);
      assertExamPreflightReady(preflight);
      await generateExam(apiClient, draft.publicId, globalThis.crypto.randomUUID());
      const published = await publishExam(apiClient, draft.publicId);
      assertResolvedPolicy(published, expectedLockdownMode);
      return sessionResponseToExamSession(published);
    },
    onSuccess: (session) => {
      queryClient.setQueryData<ExamSession[]>(SESSIONS_QUERY_KEY, (previous = []) => [
        session,
        ...previous.filter((existing) => existing.id !== session.id),
      ]);
      void queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: HOST_DASHBOARD_QUERY_KEY });
    },
  });
}

function assertExamPreflightReady(preflight: Awaited<ReturnType<typeof preflightExam>>): void {
  if (preflight.ready) return;
  throw new ExamPreflightBlockedError(preflight.issues);
}

/** Runs the backend-owned command for a selected status rather than patching status directly. */
export function useTransitionExamStatus(
  publicId: string,
): UseMutationResult<ExamSession, unknown, ExamStatusTransitionTarget> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target) => {
      if (target === "READY" || target === "SCHEDULED") {
        assertExamPreflightReady(await preflightExam(apiClient, publicId));
        await generateExam(apiClient, publicId, globalThis.crypto.randomUUID());
        if (target === "READY") {
          return sessionResponseToExamSession(await getSession(apiClient, publicId));
        }
        return sessionResponseToExamSession(await publishExam(apiClient, publicId));
      }
      if (target === "OPEN") {
        return sessionResponseToExamSession(await openSession(apiClient, publicId));
      }
      if (target === "CLOSED") {
        return sessionResponseToExamSession(await closeSession(apiClient, publicId));
      }
      return sessionResponseToExamSession(await cancelExam(apiClient, publicId));
    },
    onSuccess: (session) => replaceSessionInCache(queryClient, session),
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: [...SESSION_QUERY_KEY, publicId] });
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

export function useDeleteSession(): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId) => deleteSessionRequest(apiClient, publicId),
    onSuccess: (_result, publicId) => {
      queryClient.setQueryData<ExamSession[]>(SESSIONS_QUERY_KEY, (previous = []) =>
        previous.filter((session) => session.id !== publicId),
      );
      queryClient.removeQueries({ queryKey: [...SESSION_QUERY_KEY, publicId] });
    },
  });
}

export function useExaminerAssignmentRoster(
  sessionPublicId: string,
): UseQueryResult<ExaminerAssignmentRosterResponse> {
  return useQuery({
    queryKey: [...EXAMINER_ASSIGNMENT_ROSTER_QUERY_KEY, sessionPublicId],
    queryFn: () => getExaminerAssignmentRoster(apiClient, sessionPublicId),
    enabled: sessionPublicId.length > 0,
  });
}

export function useActiveExaminers(): UseQueryResult<UserResponse[]> {
  return useQuery({
    queryKey: EXAMINER_DIRECTORY_QUERY_KEY,
    queryFn: () =>
      listAllExamStaff(apiClient, {
        size: 100,
        role: "EXAMINER",
        status: "ACTIVE",
        sort: "FULL_NAME",
        direction: "ASC",
      }),
  });
}

export function useCommitExaminerAssignment(
  sessionPublicId: string,
): UseMutationResult<ExaminerAssignmentRosterResponse, unknown, CommitExaminerAssignmentRequest> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => commitExaminerAssignment(apiClient, sessionPublicId, payload),
    onSuccess: (roster) =>
      queryClient.setQueryData(
        [...EXAMINER_ASSIGNMENT_ROSTER_QUERY_KEY, sessionPublicId],
        roster,
      ),
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
  size = DEFAULT_PAGE_SIZE,
  attemptPublicId?: string,
  search = "",
): UseQueryResult<AnswerListResponse> {
  return useQuery({
    queryKey: [
      ...ANSWERS_QUERY_KEY,
      sessionPublicId,
      attemptPublicId ?? "",
      statusFilter,
      search,
      page,
      size,
    ],
    queryFn: () =>
      listAnswers(apiClient, {
        sessionPublicId,
        attemptPublicId,
        status: statusFilter || undefined,
        search,
        page,
        size,
      }),
    enabled: sessionPublicId.length > 0,
  });
}

export function useHostScoreReview(
  sessionPublicId: string,
): UseQueryResult<HostScoreReviewResponse> {
  return useQuery({
    queryKey: [...HOST_SCORE_REVIEW_QUERY_KEY, sessionPublicId],
    queryFn: () => getHostScoreReview(apiClient, sessionPublicId),
    enabled: sessionPublicId.length > 0,
  });
}

export function useReportPublicationPreflight(
  sessionPublicId: string,
  enabled: boolean,
): UseQueryResult<ReportPublicationReadinessResponse> {
  return useQuery({
    queryKey: [...REPORT_PUBLICATION_READINESS_QUERY_KEY, sessionPublicId],
    queryFn: () => preflightReportPublication(apiClient, sessionPublicId),
    enabled: enabled && sessionPublicId.length > 0,
    staleTime: 30_000,
  });
}

export function useReportPublicationSummary(
  sessionPublicId: string,
  enabled: boolean,
): UseQueryResult<ReportPublicationSummaryResponse | null> {
  return useQuery({
    queryKey: [...REPORT_PUBLICATION_SUMMARY_QUERY_KEY, sessionPublicId],
    queryFn: () => getReportPublicationSummary(apiClient, sessionPublicId),
    enabled: enabled && sessionPublicId.length > 0,
    staleTime: 30_000,
  });
}

export function usePublishSessionReports(
  sessionPublicId: string,
): UseMutationResult<void, unknown, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => publishSessionReports(apiClient, sessionPublicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...HOST_SCORE_REVIEW_QUERY_KEY, sessionPublicId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...REPORT_PUBLICATION_READINESS_QUERY_KEY, sessionPublicId],
      });
      void queryClient.invalidateQueries({
        queryKey: [...REPORT_PUBLICATION_SUMMARY_QUERY_KEY, sessionPublicId],
      });
    },
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

