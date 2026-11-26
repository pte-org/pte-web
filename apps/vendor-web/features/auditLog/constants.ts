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
    SYSTEM: "System",
    LOAD_FAILED: "Unable to load the system log.",
    SEARCH_PLACEHOLDER: "Search by action, resource, code…",
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
    SYSTEM: "Hệ thống",
    LOAD_FAILED: "Không thể tải nhật ký hệ thống.",
    SEARCH_PLACEHOLDER: "Tìm theo thao tác, tài nguyên, mã…",
    SEARCH_ARIA_LABEL: "Tìm nhật ký hệ thống theo tên, mã tài nguyên, thao tác hoặc nội dung",
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
  { value: "SCORE_TEMPLATE", label: { en: "Score template", vi: "Mẫu điểm" } },
  { value: "Question", label: { en: "Question", vi: "Câu hỏi" } },
  { value: "TASK_TYPE", label: { en: "Task type", vi: "Dạng bài" } },
  { value: "SupportTicket", label: { en: "Support ticket", vi: "Yêu cầu hỗ trợ" } },
] as const;
