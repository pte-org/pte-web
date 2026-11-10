"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  decodeAccessTokenClaims,
  forceSubmitAttempt,
  getMyProctorAssignment,
  getProctorSecurityAudit,
  getProctorWorkspaceOverview,
  listAssignedProctorSessions,
  listViolations,
  getAttendanceRoster,
  recordAttendance,
  recordIdentityVerification,
  getAttendanceHistory,
  getHostAttendanceRoster,
  recordHostAttendance,
  recordHostIdentityVerification,
  getHostAttendanceHistory,
  createIncident,
  getIncident,
  getIncidentHistory,
  listIncidents,
  updateIncidentStatus,
  type AssignedProctorSessionPage,
  type AssignedProctorSessionResponse,
  type AttemptActionResultResponse,
  type AttendanceCommandReceiptResponse,
  type AttendanceHistoryResponse,
  type AttendancePageResponse,
  type AttendanceRosterParams,
  type CreateIncidentRequest,
  type IncidentHistoryItemResponse,
  type IncidentPageResponse,
  type IncidentResponse,
  type UpdateIncidentStatusRequest,
  type ProctorScope,
  type ProctorWorkspaceOverviewResponse,
  type AttendanceRowResponse,
  type RecordAttendanceRequest,
  type RecordIdentityVerificationRequest,
  type ViolationEventResponse,
} from "@pte/api-client";
import { useSessionManager } from "@pte/ui";
import { apiClient } from "@/lib/apiClient";
import { usePollingInterval } from "./hooks/usePollingInterval";
import { POLL_INTERVAL_MS } from "./constants";
import { PROCTOR_QUERY_KEYS } from "./queryKeys";
import type {
  ProctorAuditLogEntry,
  ProctorSecurityAuditEntry,
} from "./types";

export interface ProctorSecurityAuditPage {
  items: ProctorSecurityAuditEntry[];
  cursor: string | null;
  hasNext: boolean;
}
export interface UseAssignedProctorSessionsOptions {
  page?: number;
  size?: number;
  scope?: ProctorScope;
  sort?: string;
  timezone?: string | null;
}

export function useProctorWorkspaceOverview(
  timezone: string | null,
): UseQueryResult<ProctorWorkspaceOverviewResponse> {
  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;
  const isReady = Boolean(tenantId && actorId && timezone);

  return useQuery<ProctorWorkspaceOverviewResponse>({
    queryKey: isReady
      ? PROCTOR_QUERY_KEYS.overview(tenantId!, actorId!, timezone!)
      : (["proctor", "unauthenticated", "overview"] as const),
    queryFn: () => getProctorWorkspaceOverview(apiClient, timezone!),
    enabled: isReady,
    staleTime: 30_000,
  });
}

export function useAssignedProctorSessions(
  optionsOrPage: UseAssignedProctorSessionsOptions | number = 0,
  legacySize = 20,
): UseQueryResult<AssignedProctorSessionPage> {
  const options: UseAssignedProctorSessionsOptions =
    typeof optionsOrPage === "number"
      ? { page: optionsOrPage, size: legacySize }
      : optionsOrPage;

  const page = options.page ?? 0;
  const size = options.size ?? 20;
  const scope = options.scope;
  const sort = options.sort;
  const timezone = options.timezone;

  const { session } = useSessionManager();
  const tenantId = session?.tenantId;
  const actorId = session ? decodeAccessTokenClaims(session.accessToken)?.sub : undefined;

  const timezoneReady = scope === "TODAY" ? Boolean(timezone) : true;
  const isReady = Boolean(tenantId && actorId && timezoneReady);

  return useQuery<AssignedProctorSessionPage>({
    queryKey: isReady
      ? PROCTOR_QUERY_KEYS.myAssignments(tenantId!, actorId!, {
          page,
          size,
          scope,
          sort,
          timezone: timezone ?? undefined,
        })
      : (["proctor", "unauthenticated", "assignments"] as const),
    queryFn: () =>
      listAssignedProctorSessions(apiClient, page, size, {
        scope,
        sort,
        timezone: timezone ?? undefined,
      }),
    enabled: isReady,
    staleTime: 30_000,
  });
}

/** The assigned exam session behind the workspace header; polled so status changes show without reload. */
export function useMyProctorAssignment(
  sessionPublicId: string,
): UseQueryResult<AssignedProctorSessionResponse> {
  const { refetchInterval, refetchIntervalInBackground } = usePollingInterval({
    intervalMs: POLL_INTERVAL_MS,
  });

  return useQuery<AssignedProctorSessionResponse>({
    queryKey: PROCTOR_QUERY_KEYS.assignment(sessionPublicId),
    queryFn: () => getMyProctorAssignment(apiClient, sessionPublicId),
    enabled: Boolean(sessionPublicId),
    refetchInterval,
    refetchIntervalInBackground,
  });
}

export function useForceSubmitMutation(
  sessionPublicId: string,
): UseMutationResult<AttemptActionResultResponse, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<AttemptActionResultResponse, Error, string>({
    mutationFn: (attemptPublicId) => forceSubmitAttempt(apiClient, sessionPublicId, attemptPublicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.attendanceRosterPrefix(sessionPublicId),
      });
    },
  });
}

export function useProctorViolations(
  sessionPublicId: string,
): UseQueryResult<ViolationEventResponse[]> {
  return useQuery<ViolationEventResponse[]>({
    queryKey: PROCTOR_QUERY_KEYS.violations(sessionPublicId),
    queryFn: () => listViolations(apiClient, sessionPublicId),
    enabled: Boolean(sessionPublicId),
  });
}

export function useProctorSecurityAudit(
  sessionPublicId: string,
  limit = 20,
): UseInfiniteQueryResult<InfiniteData<ProctorSecurityAuditPage, unknown>> {
  return useInfiniteQuery<ProctorSecurityAuditPage, Error, InfiniteData<ProctorSecurityAuditPage, unknown>, readonly unknown[], string | undefined>({
    queryKey: PROCTOR_QUERY_KEYS.securityAudit(sessionPublicId, limit),
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const resp = await getProctorSecurityAudit(apiClient, sessionPublicId, limit, pageParam);
      const list = resp.entries ?? resp.items ?? [];
      return {
        items: list.map((it) => ({
          publicId: it.publicId,
          recordedAt: it.detectedAt,
          eventType: it.violationType,
          description: it.detail ?? `${it.source} - ${it.severity}`,
        })),
        cursor: resp.nextCursor,
        hasNext: Boolean(resp.nextCursor),
      };
    },
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    enabled: Boolean(sessionPublicId),
  });
}

export interface ProctorAuditLogPage {
  items: ProctorAuditLogEntry[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Adapter hook for existing AuditLogView component violations tab.
 */
export function useProctorAuditLog(
  sessionPublicId: string,
): UseQueryResult<ProctorAuditLogPage> {
  return useQuery<ViolationEventResponse[], Error, ProctorAuditLogPage>({
    queryKey: PROCTOR_QUERY_KEYS.violations(sessionPublicId),
    queryFn: () => listViolations(apiClient, sessionPublicId),
    enabled: Boolean(sessionPublicId),
    select: (violations) => ({
      items: violations.map((v) => ({
        publicId: v.publicId,
        action: "FLAG_VIOLATION" as const,
        sessionPublicId: v.sessionPublicId ?? sessionPublicId,
        attemptPublicId: v.attemptPublicId,
        note: v.detail ?? v.note ?? "",
        createdAt: v.detectedAt ?? v.createdAt ?? new Date().toISOString(),
        performedBy: {
          publicId: v.proctorPublicId ?? "",
          fullName: v.proctorPublicId ? `Proctor #${v.proctorPublicId.slice(0, 8).toUpperCase()}` : "—",
          email: "",
        },
      })),
      page: 0,
      size: 50,
      totalPages: 1,
      totalItems: violations.length,
    }),
  });
}

export function useAttendanceRoster(
  sessionPublicId: string,
  params?: AttendanceRosterParams,
): UseQueryResult<AttendancePageResponse> {
  return useQuery<AttendancePageResponse>({
    queryKey: PROCTOR_QUERY_KEYS.attendanceRoster(sessionPublicId, params),
    queryFn: () => getAttendanceRoster(apiClient, sessionPublicId, params),
    enabled: Boolean(sessionPublicId),
  });
}

export function useRecordAttendanceMutation(sessionPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    AttendanceCommandReceiptResponse,
    Error,
    { studentPublicId: string; request: RecordAttendanceRequest }
  >({
    mutationFn: ({ studentPublicId, request }) =>
      recordAttendance(apiClient, sessionPublicId, studentPublicId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.attendanceRosterPrefix(sessionPublicId),
      });
    },
  });
}

export function useRecordIdentityVerificationMutation(sessionPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    AttendanceRowResponse,
    Error,
    { studentPublicId: string; request: RecordIdentityVerificationRequest }
  >({
    mutationFn: ({ studentPublicId, request }) =>
      recordIdentityVerification(apiClient, sessionPublicId, studentPublicId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.attendanceRosterPrefix(sessionPublicId),
      });
    },
  });
}

export function useAttendanceHistory(
  sessionPublicId: string,
  studentPublicId: string,
  page = 0,
  size = 20,
): UseQueryResult<AttendanceHistoryResponse> {
  return useQuery<AttendanceHistoryResponse>({
    queryKey: PROCTOR_QUERY_KEYS.attendanceHistory(sessionPublicId, studentPublicId, page, size),
    queryFn: () => getAttendanceHistory(apiClient, sessionPublicId, studentPublicId, page, size),
    enabled: Boolean(sessionPublicId && studentPublicId),
  });
}

export function useHostAttendanceRoster(
  sessionPublicId: string,
  params?: AttendanceRosterParams,
): UseQueryResult<AttendancePageResponse> {
  return useQuery<AttendancePageResponse>({
    queryKey: ["host", "attendance", sessionPublicId, params],
    queryFn: () => getHostAttendanceRoster(apiClient, sessionPublicId, params),
    enabled: Boolean(sessionPublicId),
  });
}

export function useRecordHostAttendanceMutation(sessionPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    AttendanceCommandReceiptResponse,
    Error,
    { studentPublicId: string; request: RecordAttendanceRequest }
  >({
    mutationFn: ({ studentPublicId, request }) =>
      recordHostAttendance(apiClient, sessionPublicId, studentPublicId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["host", "attendance", sessionPublicId],
      });
    },
  });
}

export function useRecordHostIdentityVerificationMutation(sessionPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation<
    AttendanceRowResponse,
    Error,
    { studentPublicId: string; request: RecordIdentityVerificationRequest }
  >({
    mutationFn: ({ studentPublicId, request }) =>
      recordHostIdentityVerification(apiClient, sessionPublicId, studentPublicId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["host", "attendance", sessionPublicId],
      });
    },
  });
}

export function useHostAttendanceHistory(
  sessionPublicId: string,
  studentPublicId: string,
  page = 0,
  size = 20,
): UseQueryResult<AttendanceHistoryResponse> {
  return useQuery<AttendanceHistoryResponse>({
    queryKey: ["host", "attendance", sessionPublicId, "history", studentPublicId, page, size],
    queryFn: () => getHostAttendanceHistory(apiClient, sessionPublicId, studentPublicId, page, size),
    enabled: Boolean(sessionPublicId && studentPublicId),
  });
}

export function useIncidentsList(
  sessionPublicId: string,
  params?: { status?: string; search?: string; page?: number; size?: number },
): UseQueryResult<IncidentPageResponse> {
  return useQuery<IncidentPageResponse>({
    queryKey: PROCTOR_QUERY_KEYS.incidentsList(sessionPublicId, params),
    queryFn: () => listIncidents(apiClient, sessionPublicId, params),
    enabled: Boolean(sessionPublicId),
  });
}

export function useIncidentDetail(
  sessionPublicId: string,
  incidentPublicId: string,
): UseQueryResult<IncidentResponse> {
  return useQuery<IncidentResponse>({
    queryKey: PROCTOR_QUERY_KEYS.incidentDetail(sessionPublicId, incidentPublicId),
    queryFn: () => getIncident(apiClient, sessionPublicId, incidentPublicId),
    enabled: Boolean(sessionPublicId && incidentPublicId),
  });
}

export function useIncidentHistory(
  sessionPublicId: string,
  incidentPublicId: string,
): UseQueryResult<IncidentHistoryItemResponse[]> {
  return useQuery<IncidentHistoryItemResponse[]>({
    queryKey: PROCTOR_QUERY_KEYS.incidentHistory(sessionPublicId, incidentPublicId),
    queryFn: () => getIncidentHistory(apiClient, sessionPublicId, incidentPublicId),
    enabled: Boolean(sessionPublicId && incidentPublicId),
  });
}

export function useCreateIncidentMutation(sessionPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation<IncidentResponse, Error, CreateIncidentRequest>({
    mutationFn: (request) => createIncident(apiClient, sessionPublicId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.incidentsListPrefix(sessionPublicId),
      });
    },
  });
}

export function useUpdateIncidentStatusMutation(
  sessionPublicId: string,
  incidentPublicId: string,
) {
  const queryClient = useQueryClient();
  return useMutation<IncidentResponse, Error, UpdateIncidentStatusRequest>({
    mutationFn: (request) =>
      updateIncidentStatus(apiClient, sessionPublicId, incidentPublicId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.incidentDetail(sessionPublicId, incidentPublicId),
      });
      queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.incidentHistory(sessionPublicId, incidentPublicId),
      });
      queryClient.invalidateQueries({
        queryKey: PROCTOR_QUERY_KEYS.incidentsListPrefix(sessionPublicId),
      });
    },
  });
}

