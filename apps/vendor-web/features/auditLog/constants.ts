export const PLATFORM_AUDIT_LOG_QUERY_KEY = ["platformAuditLogs"] as const;
export const PLATFORM_AUDIT_ACTORS_QUERY_KEY = ["platformAuditActors"] as const;
export const PLATFORM_AUDIT_ENTRY_QUERY_KEY = ["platformAuditEntry"] as const;
/** URL parameter that opens the log filtered to one person (linked from the platform user menu). */
export const ACTOR_ID_SEARCH_PARAM = "actorId";
export const AUDIT_LOG_PATH = "/admin/audit-log";
/** Marks where the log was opened from, so the shell shows a breadcrumb back to that page. */
export const AUDIT_LOG_FROM_PARAM = "from";
export const AUDIT_LOG_FROM_PLATFORM_USERS = "platform-users";
export const ACTORS_STALE_TIME_MS = 60_000;
export const AUDIT_HISTORY_PAGE_SIZE = 50;

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
    SYSTEM: "System",
    LOAD_FAILED: "Unable to load the system log.",
    SEARCH_PLACEHOLDER: "Search by action, resource or code",
    SEARCH_ARIA_LABEL: "Search system log by resource name, code, action, or summary",
    ALL_ACTORS: "All people",
    VIEW_CHANGES: "View changes",
    CHANGES_TITLE: "What changed",
    CHANGES_LOADING: "Loading changes...",
    CHANGES_FAILED: "Unable to load the changes of this entry.",
    NO_FIELD_CHANGES: "No field changed in this action.",
    TRUNCATED: "This snapshot was too large to store in full, so only a preview was kept.",
    FIELD: "Field",
    BEFORE: "Before",
    AFTER: "After",
    EMPTY_VALUE: "(empty)",
    HISTORY_TITLE: "Change history",
    HISTORY_EMPTY: "No recorded change for this item yet.",
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
    SYSTEM: "Hệ thống",
    LOAD_FAILED: "Không thể tải nhật ký hệ thống.",
    SEARCH_PLACEHOLDER: "Tìm theo thao tác, tài nguyên hoặc mã",
    SEARCH_ARIA_LABEL: "Tìm nhật ký hệ thống theo tên, mã tài nguyên, thao tác hoặc nội dung",
    ALL_ACTORS: "Tất cả mọi người",
    VIEW_CHANGES: "Xem thay đổi",
    CHANGES_TITLE: "Nội dung thay đổi",
    CHANGES_LOADING: "Đang tải nội dung thay đổi...",
    CHANGES_FAILED: "Không thể tải nội dung thay đổi của mục này.",
    NO_FIELD_CHANGES: "Thao tác này không làm thay đổi trường nào.",
    TRUNCATED: "Dữ liệu quá lớn nên chỉ lưu bản xem trước, không đủ để so sánh.",
    FIELD: "Trường",
    BEFORE: "Trước",
    AFTER: "Sau",
    EMPTY_VALUE: "(trống)",
    HISTORY_TITLE: "Lịch sử thay đổi",
    HISTORY_EMPTY: "Chưa có thay đổi nào được ghi lại cho mục này.",
  },
} as const;

export const PLATFORM_AUDIT_RESOURCE_TYPES = [
  { value: "Tenant", label: { en: "Tenant", vi: "Tổ chức" } },
  { value: "Organization", label: { en: "Organization", vi: "Tổ chức" } },
  { value: "TENANT_APPLICATION", label: { en: "Tenant application", vi: "Đơn đăng ký tổ chức" } },
  { value: "Plan", label: { en: "Plan", vi: "Gói" } },
  { value: "LicenseCode", label: { en: "License code", vi: "Mã bản quyền" } },
  { value: "Order", label: { en: "Order", vi: "Đơn hàng" } },
  { value: "Subscription", label: { en: "Subscription", vi: "Gói đăng ký" } },
  { value: "PlatformUser", label: { en: "Platform user", vi: "Người dùng platform" } },
  { value: "ANNOUNCEMENT", label: { en: "Announcement", vi: "Thông báo" } },
  { value: "EXAM_BLUEPRINT", label: { en: "Exam blueprint", vi: "Blueprint kỳ thi" } },
  { value: "SCORE_TEMPLATE", label: { en: "Exam template", vi: "Template đề" } },
  { value: "Question", label: { en: "Question", vi: "Câu hỏi" } },
  { value: "TASK_TYPE", label: { en: "Task type", vi: "Dạng bài" } },
  { value: "SupportTicket", label: { en: "Support ticket", vi: "Yêu cầu hỗ trợ" } },
] as const;

export const PLATFORM_AUDIT_ACTION_LABELS: Record<string, { en: string; vi: string }> = {
  TenantOnboarded: { en: "Tenant onboarded", vi: "Đã khởi tạo tổ chức" },
  TenantSuspended: { en: "Tenant suspended", vi: "Đã tạm ngưng tổ chức" },
  TenantReactivated: { en: "Tenant reactivated", vi: "Đã kích hoạt lại tổ chức" },
  TenantBrandingUpdated: {
    en: "Tenant branding updated",
    vi: "Đã cập nhật nhận diện tổ chức",
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
  CLONED: { en: "Cloned", vi: "Đã nhân bản" },
  DELETED_DRAFT: { en: "Draft deleted", vi: "Đã xóa bản nháp" },
  CEFR_TARGETS_UPDATED: { en: "CEFR mix updated", vi: "Đã cập nhật tỉ lệ CEFR" },
  TIME_FRAME_UPDATED: { en: "Time frame updated", vi: "Đã cập nhật khung thời gian" },
  RUNTIME_CONTRACT_UPDATED: {
    en: "Runtime contract updated",
    vi: "Đã cập nhật cấu hình hiển thị và chấm",
  },
  RETIRED: { en: "Retired", vi: "Đã ngừng dùng" },
  PLAN_TRANSITION: { en: "Plan changed", vi: "Đã thay đổi gói" },
  PlanDraftDeleted: { en: "Plan draft deleted", vi: "Đã xóa gói nháp" },
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
