export const AUDIT_LOGS_QUERY_KEY = ["auditLogs"] as const;
export const AUDIT_LOG_ACTORS_QUERY_KEY = ["auditLogActors"] as const;

/** Mirrors the backend `EnrollmentConstants.AGGREGATE_PROGRAM`/`AGGREGATE_CLASS` string values exactly. */
export const AUDIT_LOG_AGGREGATE_TYPES = {
  PROGRAM: "Program",
  CLASS: "TrainingClass",
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
  { value: "TrainingClass", label: "Class" },
  { value: "User", label: "User" },
  { value: "ExamSession", label: "Exam session" },
  { value: "SupportTicket", label: "Support ticket" },
] as const;

export const AUDIT_LOG_ACTION_LABELS: Record<string, { en: string; vi: string }> = {
  ExamAudienceSourceAdded: { en: "Exam audience source added", vi: "Đã thêm nguồn thí sinh vào kỳ thi" },
  ExamAutoOpened: { en: "Exam opened automatically", vi: "Đã tự động mở kỳ thi" },
  ExamDraftCreated: { en: "Exam draft created", vi: "Đã tạo bản nháp kỳ thi" },
  ExamGenerated: { en: "Exam generated", vi: "Đã sinh đề thi" },
  OrganizationUpdated: { en: "Organization updated", vi: "Đã cập nhật hồ sơ tổ chức" },
  ProgramCreated: { en: "Program created", vi: "Đã tạo chương trình" },
  ClassCreated: { en: "Class created", vi: "Đã tạo lớp học" },
  ClassSplit: { en: "Class split", vi: "Đã tách lớp học" },
  StudentAssignedToClass: { en: "Students added to class", vi: "Đã thêm học viên vào lớp" },
  UserPasswordChangedSelf: { en: "Password changed", vi: "Đã đổi mật khẩu" },
  UserPasswordReset: { en: "Password reset", vi: "Đã đặt lại mật khẩu" },
  UserProfileUpdated: { en: "Profile updated", vi: "Đã cập nhật hồ sơ" },
  PLAN_TRANSITION: { en: "Plan activated", vi: "Đã kích hoạt gói" },
  LICENSE_GRANT: { en: "Plan granted", vi: "Đã cấp gói" },
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

/** Exam session states as the scheduler logs them. */
export const AUDIT_EXAM_STATUS_LABELS: Record<string, { en: string; vi: string }> = {
  DRAFT: { en: "Draft", vi: "Bản nháp" },
  SCHEDULED: { en: "Scheduled", vi: "Đã lên lịch" },
  PUBLISHED: { en: "Published", vi: "Đã phát hành" },
  OPEN: { en: "Open", vi: "Đang mở" },
  CLOSED: { en: "Closed", vi: "Đã đóng" },
  CANCELLED: { en: "Cancelled", vi: "Đã hủy" },
};

/** Resource kinds the log names by code, beyond those the organization labels itself. */
export const AUDIT_RESOURCE_LABELS: Record<string, { en: string; vi: string }> = {
  Organization: { en: "Organization", vi: "Tổ chức" },
  User: { en: "User", vi: "Người dùng" },
  Plan: { en: "Plan", vi: "Gói" },
  LicenseCode: { en: "License", vi: "Giấy phép" },
};
