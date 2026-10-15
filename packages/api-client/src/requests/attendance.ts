import type { ApiClient } from "../client/client";
import type {
  AttendanceCommandReceiptResponse,
  AttendanceHistoryResponse,
  AttendancePageResponse,
  AttendanceRosterParams,
  AttendanceRowResponse,
  RecordAttendanceRequest,
  RecordIdentityVerificationRequest,
} from "../types/attendance";

export const ATTENDANCE_ENDPOINTS = {
  proctorRoster: (sessionPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance`,
  proctorRecord: (sessionPublicId: string, studentPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance/students/${encodeURIComponent(studentPublicId)}`,
  proctorIdentity: (sessionPublicId: string, studentPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance/students/${encodeURIComponent(studentPublicId)}/identity`,
  proctorReceipt: (sessionPublicId: string, requestPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance/receipts/${encodeURIComponent(requestPublicId)}`,
  proctorHistory: (sessionPublicId: string, studentPublicId: string) =>
    `/api/v1/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance/students/${encodeURIComponent(studentPublicId)}/history`,

  hostRoster: (sessionPublicId: string) =>
    `/api/v1/host/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance`,
  hostRecord: (sessionPublicId: string, studentPublicId: string) =>
    `/api/v1/host/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance/students/${encodeURIComponent(studentPublicId)}`,
  hostIdentity: (sessionPublicId: string, studentPublicId: string) =>
    `/api/v1/host/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance/students/${encodeURIComponent(studentPublicId)}/identity`,
  hostReceipt: (sessionPublicId: string, requestPublicId: string) =>
    `/api/v1/host/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance/receipts/${encodeURIComponent(requestPublicId)}`,
  hostHistory: (sessionPublicId: string, studentPublicId: string) =>
    `/api/v1/host/exam-sessions/${encodeURIComponent(sessionPublicId)}/attendance/students/${encodeURIComponent(studentPublicId)}/history`,
} as const;

export function getAttendanceRoster(
  client: ApiClient,
  sessionPublicId: string,
  params?: AttendanceRosterParams,
): Promise<AttendancePageResponse> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "ALL") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();
  const url = `${ATTENDANCE_ENDPOINTS.proctorRoster(sessionPublicId)}${qs ? `?${qs}` : ""}`;
  return client.request<AttendancePageResponse>(url);
}

export function recordAttendance(
  client: ApiClient,
  sessionPublicId: string,
  studentPublicId: string,
  request: RecordAttendanceRequest,
): Promise<AttendanceCommandReceiptResponse> {
  return client.request<AttendanceCommandReceiptResponse>(
    ATTENDANCE_ENDPOINTS.proctorRecord(sessionPublicId, studentPublicId),
    {
      method: "PATCH",
      body: request,
    },
  );
}

export function getAttendanceReceipt(
  client: ApiClient,
  sessionPublicId: string,
  requestPublicId: string,
): Promise<AttendanceCommandReceiptResponse> {
  return client.request<AttendanceCommandReceiptResponse>(
    ATTENDANCE_ENDPOINTS.proctorReceipt(sessionPublicId, requestPublicId),
  );
}

export function getAttendanceHistory(
  client: ApiClient,
  sessionPublicId: string,
  studentPublicId: string,
  page = 0,
  size = 20,
): Promise<AttendanceHistoryResponse> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return client.request<AttendanceHistoryResponse>(
    `${ATTENDANCE_ENDPOINTS.proctorHistory(sessionPublicId, studentPublicId)}?${query.toString()}`,
  );
}

export function getHostAttendanceRoster(
  client: ApiClient,
  sessionPublicId: string,
  params?: AttendanceRosterParams,
): Promise<AttendancePageResponse> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "ALL") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();
  const url = `${ATTENDANCE_ENDPOINTS.hostRoster(sessionPublicId)}${qs ? `?${qs}` : ""}`;
  return client.request<AttendancePageResponse>(url);
}

export function recordHostAttendance(
  client: ApiClient,
  sessionPublicId: string,
  studentPublicId: string,
  request: RecordAttendanceRequest,
): Promise<AttendanceCommandReceiptResponse> {
  return client.request<AttendanceCommandReceiptResponse>(
    ATTENDANCE_ENDPOINTS.hostRecord(sessionPublicId, studentPublicId),
    {
      method: "PATCH",
      body: request,
    },
  );
}

export function getHostAttendanceReceipt(
  client: ApiClient,
  sessionPublicId: string,
  requestPublicId: string,
): Promise<AttendanceCommandReceiptResponse> {
  return client.request<AttendanceCommandReceiptResponse>(
    ATTENDANCE_ENDPOINTS.hostReceipt(sessionPublicId, requestPublicId),
  );
}

export function getHostAttendanceHistory(
  client: ApiClient,
  sessionPublicId: string,
  studentPublicId: string,
  page = 0,
  size = 20,
): Promise<AttendanceHistoryResponse> {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return client.request<AttendanceHistoryResponse>(
    `${ATTENDANCE_ENDPOINTS.hostHistory(sessionPublicId, studentPublicId)}?${query.toString()}`,
  );
}

export function recordIdentityVerification(
  client: ApiClient,
  sessionPublicId: string,
  studentPublicId: string,
  request: RecordIdentityVerificationRequest,
): Promise<AttendanceRowResponse> {
  return client.request<AttendanceRowResponse>(
    ATTENDANCE_ENDPOINTS.proctorIdentity(sessionPublicId, studentPublicId),
    {
      method: "PATCH",
      body: request,
    },
  );
}

export function recordHostIdentityVerification(
  client: ApiClient,
  sessionPublicId: string,
  studentPublicId: string,
  request: RecordIdentityVerificationRequest,
): Promise<AttendanceRowResponse> {
  return client.request<AttendanceRowResponse>(
    ATTENDANCE_ENDPOINTS.hostIdentity(sessionPublicId, studentPublicId),
    {
      method: "PATCH",
      body: request,
    },
  );
}

