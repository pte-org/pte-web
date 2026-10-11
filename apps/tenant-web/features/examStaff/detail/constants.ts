import type { StaffSessionStatus, StaffWorkStatus } from "@pte/api-client";

export const STAFF_WORKSPACE_QUERY_KEY = ["examStaff", "detail"] as const;
export const STAFF_WORKSPACE_PAGE_SIZE = 20;
export const STAFF_BOARD_PAGE_SIZE = 5;
export const STAFF_PREVIEW_PAGE_SIZE = 3;
export const STAFF_BOARD_STATUSES: readonly StaffWorkStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];
export const STAFF_WORKSPACE_TIMEZONE = "Asia/Ho_Chi_Minh";
// V1 has no configurable organization zone. This zone has no DST.
export const STAFF_WORKSPACE_UTC_OFFSET_MINUTES = 7 * 60;
export const STAFF_WORKSPACE_DATE_ERROR = "STAFF_WORKSPACE_DATE_INVALID";
export const STAFF_WORK_STATUSES: readonly StaffWorkStatus[] = [
  "PENDING", "IN_PROGRESS", "COMPLETED", "UNAVAILABLE",
];
export const STAFF_SESSION_STATUSES: readonly StaffSessionStatus[] = [
  "DRAFT", "PREPARING", "READY", "SCHEDULED", "OPEN", "CLOSED", "CANCELLED",
];
export const STAFF_DETAIL_ROUTES = {
  list: "/host/exam-staff",
  detail: (id: string): string => `/host/exam-staff/${encodeURIComponent(id)}`,
  session: (id: string): string => `/host/exams/${encodeURIComponent(id)}`,
} as const;
