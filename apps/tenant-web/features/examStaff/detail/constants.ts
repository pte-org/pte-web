import type { StaffSessionStatus, StaffWorkStatus } from "@pte/api-client";

export const STAFF_WORKSPACE_QUERY_KEY = ["examStaff", "detail"] as const;
export const STAFF_WORKSPACE_PAGE_SIZE = 20;
export const STAFF_BOARD_PAGE_SIZE = 5;
export const STAFF_PREVIEW_PAGE_SIZE = 3;
export const STAFF_BOARD_STATUSES: readonly StaffVisibleWorkStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
];
export const STAFF_WORKSPACE_TIMEZONE = "Asia/Ho_Chi_Minh";
// V1 has no configurable organization zone. This zone has no DST.
export const STAFF_WORKSPACE_UTC_OFFSET_MINUTES = 7 * 60;
export const STAFF_WORKSPACE_DATE_ERROR = "STAFF_WORKSPACE_DATE_INVALID";
export type StaffVisibleWorkStatus = Exclude<StaffWorkStatus, "UNAVAILABLE">;
export const STAFF_WORK_STATUSES: readonly StaffVisibleWorkStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
];
export const STAFF_SESSION_STATUSES: readonly StaffSessionStatus[] = [
  "DRAFT",
  "PREPARING",
  "READY",
  "SCHEDULED",
  "OPEN",
  "CLOSED",
  "CANCELLED",
];
export type StaffProctorBoardColumnKey = "upcoming" | "ongoing" | "proctored" | "cancelled";
export const STAFF_PROCTOR_BOARD_COLUMNS: readonly {
  key: StaffProctorBoardColumnKey;
  statuses: readonly StaffSessionStatus[];
}[] = [
  { key: "upcoming", statuses: ["DRAFT", "PREPARING", "READY", "SCHEDULED"] },
  { key: "ongoing", statuses: ["OPEN"] },
  { key: "proctored", statuses: ["CLOSED"] },
  { key: "cancelled", statuses: ["CANCELLED"] },
] as const;

export const getStaffProctorBoardColumn = (
  status: StaffSessionStatus,
): StaffProctorBoardColumnKey => {
  const column = STAFF_PROCTOR_BOARD_COLUMNS.find((item) => item.statuses.includes(status));
  return column?.key ?? "upcoming";
};
export const STAFF_DETAIL_ROUTES = {
  list: "/host/exam-staff",
  detail: (id: string): string => `/host/exam-staff/${encodeURIComponent(id)}`,
  session: (id: string): string => `/host/exams/${encodeURIComponent(id)}`,
} as const;
