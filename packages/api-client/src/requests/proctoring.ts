import { DEFAULT_PAGE_SIZE, type ApiClient, type PagedResult } from "../client/client";
import type {
  AssignedProctorSessionResponse,
  MonitoringAttemptSummaryView,
  MonitoringSnapshotResponse,
  ProctorAssignedSessionsPageResponse,
  ProctorScope,
  ProctorWorkspaceOverviewResponse,
  SecurityAuditPageResponse,
  ViolationEventResponse,
} from "../types/proctoring";

export const PROCTORING_ENDPOINTS = {
  myAssignments: "/api/v1/proctor-assignments/mine",
  myOverview: "/api/v1/proctor-assignments/mine/overview",
  monitoringSnapshot: (sessionPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/monitoring`,
  studentAttempts: (sessionPublicId: string, studentPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/monitoring/students/${encodeURIComponent(studentPublicId)}/attempts`,
  securityAudit: (sessionPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/security-audit`,
  violations: (sessionPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/violations`,
} as const;

export interface ListAssignedProctorSessionsOptions {
  scope?: ProctorScope;
  sort?: string;
  timezone?: string;
}

export function listAssignedProctorSessions(
  client: ApiClient,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  options?: ListAssignedProctorSessionsOptions,
): Promise<ProctorAssignedSessionsPageResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (options?.scope) params.set("scope", options.scope);
  if (options?.sort) params.set("sort", options.sort);
  if (options?.timezone) params.set("timezone", options.timezone);
  return client.request<ProctorAssignedSessionsPageResponse>(
    `${PROCTORING_ENDPOINTS.myAssignments}?${params.toString()}`,
  );
}

export function getProctorWorkspaceOverview(
  client: ApiClient,
  timezone: string,
): Promise<ProctorWorkspaceOverviewResponse> {
  const params = new URLSearchParams();
  params.set("timezone", timezone);
  return client.request<ProctorWorkspaceOverviewResponse>(
    `${PROCTORING_ENDPOINTS.myOverview}?${params.toString()}`,
  );
}

export function getMonitoringSnapshot(
  client: ApiClient,
  sessionPublicId: string,
  page = 0,
  size = 25,
): Promise<MonitoringSnapshotResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  return client.request<MonitoringSnapshotResponse>(
    `${PROCTORING_ENDPOINTS.monitoringSnapshot(sessionPublicId)}?${params.toString()}`,
  );
}

export function getStudentAttemptHistory(
  client: ApiClient,
  sessionPublicId: string,
  studentPublicId: string,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
): Promise<PagedResult<MonitoringAttemptSummaryView>> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  return client.request<PagedResult<MonitoringAttemptSummaryView>>(
    `${PROCTORING_ENDPOINTS.studentAttempts(sessionPublicId, studentPublicId)}?${params.toString()}`,
  );
}

export function getProctorSecurityAudit(
  client: ApiClient,
  sessionPublicId: string,
  limit = 25,
  cursor?: string | null,
): Promise<SecurityAuditPageResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (cursor) {
    params.set("cursor", cursor);
  }
  return client.request<SecurityAuditPageResponse>(
    `${PROCTORING_ENDPOINTS.securityAudit(sessionPublicId)}?${params.toString()}`,
  );
}

export function listViolations(
  client: ApiClient,
  sessionPublicId: string,
): Promise<ViolationEventResponse[]> {
  return client.request<ViolationEventResponse[]>(
    PROCTORING_ENDPOINTS.violations(sessionPublicId),
  );
}
