import type { PagedResult } from "../../client/client";

export type StaffWorkStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "UNAVAILABLE";
export type StaffPublicationStatus = "PUBLISHED" | "UNPUBLISHED";
export type StaffSessionStatus =
  | "DRAFT" | "PREPARING" | "READY" | "SCHEDULED" | "OPEN" | "CLOSED" | "CANCELLED";

export interface ExamStaffAccountResponse {
  publicId: string;
  fullName: string | null;
  username: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  roles: string[];
  status: "ACTIVE" | "SUSPENDED";
  mustChangePassword: boolean;
  canSendCredentials: boolean;
}

export interface UpdateExamStaffProfileRequest {
  fullName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
}

export interface StaffWorkspaceQuery {
  from?: string;
  to?: string;
  sessionPublicId?: string;
  sessionStatus?: StaffSessionStatus;
  publicationStatus?: StaffPublicationStatus | "ALL";
  workStatus?: StaffWorkStatus | "ALL";
  page?: number;
  size?: number;
  direction?: "asc" | "desc";
}

export interface StaffSessionResponse {
  sessionPublicId: string;
  name: string;
  sessionCode: string | null;
  sessionStatus: StaffSessionStatus;
  opensAt: string | null;
  closesAt: string | null;
}

export interface ExaminerProgressResponse {
  sessionPublicId: string;
  assignedAttemptCount: number;
  batchCount: number;
  frozenEligibleAnswerCount: number | null;
  eligibleAnswerCount: number | null;
  submittedAnswerCount: number | null;
  pendingAttemptCount: number;
  inProgressAttemptCount: number;
  completedAttemptCount: number;
  unavailableAttemptCount: number;
  workStatus: StaffWorkStatus;
  publicationStatus: StaffPublicationStatus;
  progressPercent: number | null;
  diagnosticCodes: string[];
}

export interface ExaminerSessionResponse {
  session: StaffSessionResponse;
  progress: ExaminerProgressResponse;
}

export interface ExaminerSessionPage extends PagedResult<ExaminerSessionResponse> {
  totalByStatus: Record<StaffWorkStatus, number>;
}

export type ProctorSessionPage = PagedResult<StaffSessionResponse>;

export interface ProctorOverviewResponse {
  totalAssignedSessions: number;
  upcoming: number;
  ongoing: number;
  ended: number;
  cancelled: number;
  awaitingOpen: number;
  preparing: number;
  unscheduled: number;
}

export interface ExaminerOverviewResponse {
  totalSessions: number;
  totalByStatus: Record<StaffWorkStatus, number>;
  assignedAttemptCount: number;
  batchCount: number;
  eligibleAnswerCount: number | null;
  submittedAnswerCount: number | null;
  progressPercent: number | null;
  pendingAttemptCount: number;
  inProgressAttemptCount: number;
  completedAttemptCount: number;
  unavailableAttemptCount: number;
  verifiedEligibleAnswerCount: number;
  verifiedSubmittedAnswerCount: number;
  progressCoverageComplete: boolean;
}

export interface StaffOverviewResponse {
  proctor: ProctorOverviewResponse | null;
  examiner: ExaminerOverviewResponse | null;
}
