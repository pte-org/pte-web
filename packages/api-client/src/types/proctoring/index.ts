import type { PagedResult } from "../../client/client";
import type { ProctorRole, SessionStatus } from "../scheduling";

export type AttemptStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "ABANDONED";
export type SecurityAuditSource = "PROCTOR" | "STUDENT_LOCKDOWN";
export type ProctorSessionStatus = "ACTIVE" | "ENDED";

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

export type AssignedProctorSessionPage = PagedResult<AssignedProctorSessionResponse>;

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
  accessibleCount: number;
  upcomingCount: number;
  todayCount: number;
  priorityCount: number;
}

export interface ProctorWorkspaceOverviewResponse {
  counts: ProctorOverviewCounts;
  prioritySessions: ProctorWorkspaceSessionResponse[];
  asOf: string;
  timezone: string;
  dayStart: string;
  dayEnd: string;
}

export interface ProctorAssignedSessionsPageResponse {
  items: ProctorWorkspaceSessionResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ProctorMonitoringSessionView {
  sessionPublicId: string;
  name: string;
  status: SessionStatus;
  opensAt: string;
  closesAt: string;
  timeLimitMinutes: number | null;
  totalEnrolled: number;
}

export interface MonitoringSummaryResponse {
  registeredCount: number;
  notStartedCount: number;
  inProgressCount: number;
  submittedCount: number;
  createdCount: number;
  snapshotAt: string;
}

export interface MonitoringStudentResponse {
  studentPublicId: string;
  displayName: string;
  email: string | null;
  attemptPublicId: string | null;
  attemptNumber: number | null;
  status: AttemptStatus | null;
  startedAt: string | null;
  submittedAt: string | null;
  lastSeenAt: string | null;
  attemptCount: number;
  manualViolationCount: number;
}

export interface MonitoringSnapshotResponse {
  session: ProctorMonitoringSessionView;
  summary: MonitoringSummaryResponse;
  students: PagedResult<MonitoringStudentResponse>;
  snapshotAt: string;
}

export interface MonitoringAttemptSummaryView {
  attemptPublicId: string;
  studentPublicId: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  lastSeenAt: string | null;
}

export type MonitoringAttemptHistoryPage = PagedResult<MonitoringAttemptSummaryView>;

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
  sequenceNo: number;
  hash: string;
  detectedAt: string;
  sessionPublicId?: string;
  proctorPublicId?: string;
  note?: string | null;
  createdAt?: string;
}

export interface ProctorSessionResponse {
  publicId: string;
  sessionPublicId: string;
  proctorPublicId: string;
  status: ProctorSessionStatus;
  startedAt: string;
  endedAt: string | null;
}

export interface ProctorOperationResultResponse {
  requestId: string;
  operation: "OPEN" | "FORCE_SUBMIT" | "FLAG_VIOLATION";
  targetPublicId: string;
  outcome: "OPENED" | "APPLIED" | "NO_OP" | "SAVED";
  eventPublicId?: string | null;
  occurredAt: string;
}

export interface ProctorOperationErrorResponse {
  requestId: string;
  operation: string;
  targetPublicId?: string | null;
  status: number;
  code: string;
}
