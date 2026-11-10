import { DEFAULT_PAGE_SIZE, type ApiClient } from "../client/client";
import type {
  AssignedProctorSessionResponse,
  AttemptActionResultResponse,
  ProctorAssignedSessionsPageResponse,
  ProctorScope,
  ProctorWorkspaceOverviewResponse,
  SecurityAuditPageResponse,
  ViolationEventResponse,
} from "../types/proctoring";

export const PROCTORING_ENDPOINTS = {
  myAssignments: "/api/v1/proctor-assignments/mine",
  myOverview: "/api/v1/proctor-assignments/mine/overview",
  myAssignment: (sessionPublicId: string) =>
    `/api/v1/proctor-assignments/mine/${encodeURIComponent(sessionPublicId)}`,
  attemptStatus: (sessionPublicId: string, attemptPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/attempts/${encodeURIComponent(attemptPublicId)}/status`,
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

/** One exam session assigned to the current proctor; 403 when the proctor is not assigned. */
export function getMyProctorAssignment(
  client: ApiClient,
  sessionPublicId: string,
): Promise<AssignedProctorSessionResponse> {
  return client.request<AssignedProctorSessionResponse>(
    PROCTORING_ENDPOINTS.myAssignment(sessionPublicId),
  );
}

/** Submits a Student's in-progress attempt on the proctor's behalf. */
export function forceSubmitAttempt(
  client: ApiClient,
  sessionPublicId: string,
  attemptPublicId: string,
): Promise<AttemptActionResultResponse> {
  return client.request<AttemptActionResultResponse>(
    PROCTORING_ENDPOINTS.attemptStatus(sessionPublicId, attemptPublicId),
    { method: "PATCH", body: { action: "FORCE_SUBMIT" } },
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
