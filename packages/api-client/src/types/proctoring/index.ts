import type { PagedResult } from "../../client/client";
import type { ProctorRole, SessionStatus } from "../scheduling";

export type AttemptStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "ABANDONED";
export type SecurityAuditSource = "PROCTOR" | "STUDENT_LOCKDOWN";

export interface AssignedProctorSessionResponse {
  assignmentPublicId: string;
  examSessionPublicId: string;
  name: string;
  sessionCode?: string | null;
  status: SessionStatus;
  opensAt: string;
  closesAt: string;
  assignmentRole: string;
  sessionPublicId?: string;
  role?: ProctorRole | string;
  canMonitor?: boolean;
  monitoringBlockingReason?: string | null;
}

export type AssignedProctorSessionPage = ProctorAssignedSessionsPageResponse;

export type ProctorScope = "ALL" | "ACCESSIBLE" | "UPCOMING" | "TODAY";

export interface ProctorWorkspaceSessionResponse {
  assignmentPublicId: string;
  examSessionPublicId: string;
  name: string;
  sessionCode?: string | null;
  status: SessionStatus | string;
  opensAt: string;
  closesAt: string;
  assignmentRole: string;
  canMonitor: boolean;
  monitoringBlockingReason: string | null;
}

export interface ProctorOverviewCounts {
  accessible: number;
  upcoming: number;
  today: number;
  /** Backward compatibility aliases */
  accessibleCount?: number;
  upcomingCount?: number;
  todayCount?: number;
  priorityCount?: number;
}

export interface ProctorWorkspaceOverviewResponse {
  counts: ProctorOverviewCounts;
  prioritySessions: ProctorWorkspaceSessionResponse[];
  asOf: string;
  timezone: string;
  dayStart: string;
  dayEnd: string;
}

export interface ProctorAssignedSessionsPageResponse extends PagedResult<AssignedProctorSessionResponse> {
  asOf?: string;
  timezone?: string;
  dayStart?: string;
  dayEnd?: string;
}

export interface SecurityAuditEntryResponse {
  publicId: string;
  source: SecurityAuditSource;
  attemptPublicId: string;
  studentPublicId: string | null;
  violationType: string;
  severity: string;
  detectedAt: string;
  clientEventId: string | null;
  detail: string | null;
}

export interface SecurityAuditPageResponse {
  entries: SecurityAuditEntryResponse[];
  nextCursor: string | null;
  items?: SecurityAuditEntryResponse[];
}

export interface ViolationEventResponse {
  publicId: string;
  attemptPublicId: string;
  violationType: string;
  detail: string | null;
  detectedAt: string;
  sessionPublicId?: string;
  proctorPublicId?: string;
  note?: string | null;
  createdAt?: string;
}

/** Result of a proctor action on one attempt: NO_OP when the attempt was no longer in progress. */
export interface AttemptActionResultResponse {
  attemptPublicId: string;
  outcome: "APPLIED" | "NO_OP";
}
