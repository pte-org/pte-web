import type { PageMeta } from "../../client/client";

export type AttendanceStatus = "UNMARKED" | "PRESENT" | "ABSENT";

export interface AttendanceRowResponse {
  studentPublicId: string;
  enrollmentPublicId: string;
  displayName: string | null;
  email: string | null;
  status: AttendanceStatus;
  version: number;
  lastActorPublicId: string | null;
  lastActorRole: string | null;
  lastActionAt: string | null;
  lastReasonOrNote: string | null;
  canEdit: boolean;
  blockingReason: string | null;
  latestAttemptActivityStatus: string | null;
  latestAttemptActivityAt: string | null;
}

export interface AttendanceSummaryResponse {
  totalEnrollments: number;
  unmarkedCount: number;
  presentCount: number;
  absentCount: number;
}

export interface AttendancePageResponse {
  sessionPublicId: string;
  data: AttendanceRowResponse[];
  meta: PageMeta;
  summary: AttendanceSummaryResponse;
  canEditSession: boolean;
  sessionBlockingReason: string | null;
  asOf: string;
  opensAt: string | null;
  closesAt: string | null;
  attendanceWindowOpensAt: string | null;
}

export interface RecordAttendanceRequest {
  status: AttendanceStatus;
  enrollmentPublicId: string;
  expectedVersion: number;
  requestPublicId: string;
  reasonOrNote?: string | null;
}

export interface AttendanceCommandReceiptResponse {
  requestPublicId: string;
  sessionPublicId: string;
  studentPublicId: string;
  enrollmentPublicId: string;
  actorPublicId: string;
  actorRole: string;
  appliedVersion: number;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reasonOrNote: string | null;
  serverActionAt: string;
  changed: boolean;
  committedResult: string;
  currentAttendance: AttendanceRowResponse;
}

export interface AttendanceHistoryItemResponse {
  id: string;
  requestPublicId: string;
  studentPublicId: string;
  enrollmentPublicId: string;
  actorPublicId: string;
  actorDisplayName: string | null;
  actorRole: string;
  appliedVersion: number;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reasonOrNote: string | null;
  serverActionAt: string;
}

export interface AttendanceHistoryResponse {
  sessionPublicId: string;
  studentPublicId: string;
  data: AttendanceHistoryItemResponse[];
  meta: PageMeta;
  asOf: string;
}

export interface AttendanceRosterParams {
  status?: AttendanceStatus | "ALL";
  search?: string;
  page?: number;
  size?: number;
}
