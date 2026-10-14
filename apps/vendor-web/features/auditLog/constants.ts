export const PLATFORM_AUDIT_LOG_QUERY_KEY = ["platformAuditLogs"] as const;
export const PLATFORM_AUDIT_ACTORS_QUERY_KEY = ["platformAuditActors"] as const;

export const PLATFORM_AUDIT_LOG_COPY = {
  en: {
    TITLE: "System log",
    WHEN: "When",
    ACTION: "Action",
    RESOURCE: "Resource",
    ACTOR: "Actor",
    SUMMARY: "Summary",
    ALL_ACTIVITY: "All activity",
    EMPTY: "No platform activity yet",
    EMPTY_DESCRIPTION: "Administrative changes will appear here as the platform is managed.",
    UNKNOWN_ACTOR: "Unknown",
    LOAD_FAILED: "Unable to load the system log.",
    SEARCH_PLACEHOLDER: "Search by resource name, code, action, or summary",
    SEARCH_ARIA_LABEL: "Search system log by resource name, code, action, or summary",
  },
  vi: {
    TITLE: "Nhật ký hệ thống",
    WHEN: "Thời điểm",
    ACTION: "Thao tác",
    RESOURCE: "Tài nguyên",
    ACTOR: "Người thực hiện",
    SUMMARY: "Tóm tắt",
    ALL_ACTIVITY: "Tất cả hoạt động",
    EMPTY: "Chưa có hoạt động nền tảng",
    EMPTY_DESCRIPTION: "Các thay đổi quản trị sẽ xuất hiện ở đây khi nền tảng được vận hành.",
    UNKNOWN_ACTOR: "Không xác định",
    LOAD_FAILED: "Không thể tải nhật ký hệ thống.",
    SEARCH_PLACEHOLDER: "Tìm theo tên, mã tài nguyên, thao tác hoặc nội dung",
    SEARCH_ARIA_LABEL: "Tìm nhật ký hệ thống theo tên, mã tài nguyên, thao tác hoặc nội dung",
  },
} as const;

export const PLATFORM_AUDIT_RESOURCE_TYPES = [
  { value: "Tenant", label: { en: "Tenant", vi: "Tenant" } },
  { value: "Organization", label: { en: "Organization", vi: "Tổ chức" } },
  { value: "TENANT_APPLICATION", label: { en: "Tenant application", vi: "Đơn đăng ký tenant" } },
  { value: "Plan", label: { en: "Plan", vi: "Gói" } },
  { value: "LicenseCode", label: { en: "License code", vi: "Mã bản quyền" } },
  { value: "Order", label: { en: "Order", vi: "Đơn hàng" } },
  { value: "Subscription", label: { en: "Subscription", vi: "Gói đăng ký" } },
  { value: "PlatformUser", label: { en: "Platform user", vi: "Người dùng platform" } },
  { value: "ANNOUNCEMENT", label: { en: "Announcement", vi: "Thông báo" } },
  { value: "EXAM_BLUEPRINT", label: { en: "Exam blueprint", vi: "Blueprint kỳ thi" } },
  { value: "SCORE_TEMPLATE", label: { en: "Score template", vi: "Mẫu điểm" } },
  { value: "Question", label: { en: "Question", vi: "Câu hỏi" } },
  { value: "TASK_TYPE", label: { en: "Task type", vi: "Dạng bài" } },
  { value: "SupportTicket", label: { en: "Support ticket", vi: "Yêu cầu hỗ trợ" } },
] as const;

export const PLATFORM_AUDIT_ACTION_LABELS: Record<string, { en: string; vi: string }> = {
  TenantOnboarded: { en: "Tenant onboarded", vi: "Đã khởi tạo tenant" },
  TenantSuspended: { en: "Tenant suspended", vi: "Đã tạm ngưng tenant" },
  TenantReactivated: { en: "Tenant reactivated", vi: "Đã kích hoạt lại tenant" },
  TenantBrandingUpdated: {
    en: "Tenant branding updated",
    vi: "Đã cập nhật nhận diện tenant",
  },
  PlatformUserCreated: { en: "Platform user created", vi: "Đã tạo người dùng platform" },
  PlatformUserRolesUpdated: {
    en: "Platform user roles updated",
    vi: "Đã cập nhật vai trò người dùng platform",
  },
  PlatformUserSuspended: { en: "Platform user suspended", vi: "Đã tạm ngưng người dùng platform" },
  PlatformUserReactivated: {
    en: "Platform user reactivated",
    vi: "Đã kích hoạt lại người dùng platform",
  },
  ExamDraftUpdated: { en: "Exam draft updated", vi: "Đã cập nhật bản nháp kỳ thi" },
  ExamPublished: { en: "Exam published", vi: "Đã phát hành kỳ thi" },
  TicketSubmitted: { en: "Support ticket submitted", vi: "Đã gửi yêu cầu hỗ trợ" },
  TicketStatusUpdated: {
    en: "Support ticket status updated",
    vi: "Đã cập nhật trạng thái yêu cầu hỗ trợ",
  },
  TicketNoteAdded: { en: "Support ticket note added", vi: "Đã thêm ghi chú yêu cầu hỗ trợ" },
  TicketClosed: { en: "Support ticket closed", vi: "Đã đóng yêu cầu hỗ trợ" },
  CREATED: { en: "Created", vi: "Đã tạo" },
  UPDATED: { en: "Updated", vi: "Đã cập nhật" },
  ACTIVATED: { en: "Activated", vi: "Đã kích hoạt" },
  ARCHIVED: { en: "Archived", vi: "Đã lưu trữ" },
  AUTHORIZATION_DENIED: { en: "Authorization denied", vi: "Từ chối cấp quyền" },
};

export function humanizePlatformAuditCode(value: string): string {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLocaleLowerCase();
  return spaced.charAt(0).toLocaleUpperCase() + spaced.slice(1);
}
