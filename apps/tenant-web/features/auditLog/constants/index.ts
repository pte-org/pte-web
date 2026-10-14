export const AUDIT_LOGS_QUERY_KEY = ["auditLogs"] as const;
export const AUDIT_LOG_ACTORS_QUERY_KEY = ["auditLogActors"] as const;

/** Mirrors admin's real `AdminConstants.AGGREGATE_PROGRAM`/`AGGREGATE_CLASS` string values exactly. */
export const AUDIT_LOG_AGGREGATE_TYPES = {
  PROGRAM: "Program",
  CLASS: "StudentClass",
} as const;

export const AUDIT_LOG_TEXT = {
  title: "System log",
  subtitle: "A record of who changed what, and when.",
  filterLabel: "Filter",
  filterAll: "All activity",
  loadFailed: "Couldn't load the system log.",
  emptyTitle: "No activity yet",
  emptyText: "Changes here will appear as your team works.",
  unknownActor: "Unknown",
  totalItems: (count: number) => `Showing ${count} entr${count === 1 ? "y" : "ies"}`,
} as const;

export const AUDIT_LOG_TABLE_HEADERS = {
  WHEN: "When",
  AGGREGATE_TYPE: "Resource",
  ACTOR: "Actor",
  ACTION: "Action",
  SUMMARY: "Summary",
} as const;

export const AUDIT_LOG_RESOURCE_TYPES = [
  { value: "Tenant", label: "Tenant" },
  { value: "Organization", label: "Organization" },
  { value: "Program", label: "Program" },
  { value: "StudentClass", label: "Class" },
  { value: "User", label: "User" },
  { value: "ExamSession", label: "Exam session" },
  { value: "SupportTicket", label: "Support ticket" },
] as const;

export const AUDIT_LOG_ACTION_LABELS: Record<string, { en: string; vi: string }> = {
  ExamDraftUpdated: { en: "Exam draft updated", vi: "Đã cập nhật bản nháp kỳ thi" },
  ExamAutoClosed: { en: "Exam closed automatically", vi: "Đã tự động đóng kỳ thi" },
  ExamScheduleUpdated: { en: "Exam schedule updated", vi: "Đã cập nhật lịch kỳ thi" },
  ExamPublished: { en: "Exam published", vi: "Đã phát hành kỳ thi" },
  ExamClosed: { en: "Exam closed", vi: "Đã đóng kỳ thi" },
  TicketSubmitted: { en: "Support ticket submitted", vi: "Đã gửi yêu cầu hỗ trợ" },
  TicketStatusUpdated: {
    en: "Support ticket status updated",
    vi: "Đã cập nhật trạng thái yêu cầu",
  },
  TicketNoteAdded: { en: "Support ticket note added", vi: "Đã thêm ghi chú yêu cầu" },
  TicketClosed: { en: "Support ticket closed", vi: "Đã đóng yêu cầu hỗ trợ" },
  TenantOnboarded: { en: "Tenant onboarded", vi: "Đã khởi tạo tenant" },
  TenantSuspended: { en: "Tenant suspended", vi: "Đã tạm ngưng tenant" },
  TenantReactivated: { en: "Tenant reactivated", vi: "Đã kích hoạt lại tenant" },
  PlatformUserCreated: { en: "Platform user created", vi: "Đã tạo người dùng platform" },
  PlatformUserRolesUpdated: {
    en: "Platform user roles updated",
    vi: "Đã cập nhật vai trò người dùng",
  },
  PlatformUserSuspended: { en: "Platform user suspended", vi: "Đã tạm ngưng người dùng platform" },
  PlatformUserReactivated: {
    en: "Platform user reactivated",
    vi: "Đã kích hoạt lại người dùng platform",
  },
};

export function humanizeAuditCode(value: string): string {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLocaleLowerCase();
  return spaced.charAt(0).toLocaleUpperCase() + spaced.slice(1);
}
