"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  closeProctorSession,
  getMonitoringSnapshot,
  getProctorSecurityAudit,
  getStudentAttemptHistory,
  listAssignedProctorSessions,
  listViolations,
  type AssignedProctorSessionPage,
  type MonitoringAttemptHistoryPage,
  type MonitoringSnapshotResponse,
  type ViolationEventResponse,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import { usePollingInterval } from "./hooks/usePollingInterval";
import { POLL_INTERVAL_MS } from "./constants";
import { PROCTOR_QUERY_KEYS } from "./queryKeys";
import type {
  ProctorAuditLogEntry,
  ProctorLiveAttempt,
  ProctorSecurityAuditEntry,
} from "./types";

export interface ProctorSecurityAuditPage {
  items: ProctorSecurityAuditEntry[];
  cursor: string | null;
  hasNext: boolean;
}

export function useAssignedProctorSessions(
  page = 0,
  size = 20,
): UseQueryResult<AssignedProctorSessionPage> {
  return useQuery<AssignedProctorSessionPage>({
    queryKey: PROCTOR_QUERY_KEYS.myAssignments(page, size),
    queryFn: () => listAssignedProctorSessions(apiClient, page, size),
    staleTime: 10_000,
  });
}

export function useMonitoringSnapshot(
  sessionPublicId: string,
  page = 0,
  size = 50,
  options?: { poll?: boolean },
): UseQueryResult<MonitoringSnapshotResponse> {
  const { refetchInterval, refetchIntervalInBackground } = usePollingInterval({
    intervalMs: options?.poll ? POLL_INTERVAL_MS : 0,
  });

  return useQuery<MonitoringSnapshotResponse>({
    queryKey: PROCTOR_QUERY_KEYS.monitoringSnapshot(sessionPublicId, page, size),
    queryFn: () => getMonitoringSnapshot(apiClient, sessionPublicId, page, size),
    enabled: Boolean(sessionPublicId),
    refetchInterval,
    refetchIntervalInBackground,
  });
}

export function useStudentAttemptHistory(
  sessionPublicId: string,
  studentPublicId: string,
  page = 0,
  size = 20,
): UseQueryResult<MonitoringAttemptHistoryPage> {
  return useQuery<MonitoringAttemptHistoryPage>({
    queryKey: PROCTOR_QUERY_KEYS.studentAttempts(sessionPublicId, studentPublicId, page, size),
    queryFn: () =>
      getStudentAttemptHistory(apiClient, sessionPublicId, studentPublicId, page, size),
    enabled: Boolean(sessionPublicId && studentPublicId),
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
        items: list.map((it, idx) => ({
          publicId: it.publicId,
          recordedAt: it.detectedAt,
          eventType: it.violationType,
          hashPosition: idx + 1,
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

export function useCloseProctorSession(): UseMutationResult<void, Error, string> {
  return useMutation<void, Error, string>({
    mutationFn: (proctorSessionPublicId: string) =>
      closeProctorSession(apiClient, proctorSessionPublicId),
  });
}

/**
 * Adapter hook for existing LiveMonitoringView component.
 * Maps live snapshot roster students to ProctorLiveAttempt shapes.
 */
export function useProctorLiveAttempts(
  sessionPublicId: string,
): UseQueryResult<ProctorLiveAttempt[]> {
  const { refetchInterval, refetchIntervalInBackground } = usePollingInterval({
    intervalMs: POLL_INTERVAL_MS,
  });

  return useQuery<MonitoringSnapshotResponse, Error, ProctorLiveAttempt[]>({
    queryKey: PROCTOR_QUERY_KEYS.monitoringSnapshot(sessionPublicId, 0, 50),
    queryFn: () => getMonitoringSnapshot(apiClient, sessionPublicId, 0, 50),
    enabled: Boolean(sessionPublicId),
    refetchInterval,
    refetchIntervalInBackground,
    select: (snapshot) =>
      (snapshot.students.data ?? []).map((s) => ({
        attemptPublicId: s.attemptPublicId ?? s.studentPublicId,
        studentPublicId: s.studentPublicId,
        studentName: s.displayName,
        status:
          s.status === "SUBMITTED"
            ? "COMPLETED"
            : s.status === "IN_PROGRESS"
              ? "IN_PROGRESS"
              : "PENDING",
        startedAt: s.startedAt,
        lastHeartbeatAt: s.lastSeenAt,
        flagged: s.manualViolationCount > 0,
        notesCount: s.attemptCount,
      })),
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
          fullName: "",
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