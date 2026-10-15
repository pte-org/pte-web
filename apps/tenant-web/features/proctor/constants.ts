import type { AttemptStatus, ProctorAuditAction } from "./types";

/**
 * React Query cache-key roots.
 *
 * Named constants per this repo's established convention (avoids raw-string
 * query-key drift/collisions across the proctor feature and shared features).
 */
export const PROCTOR_LIVE_ATTEMPTS_QUERY_KEY = ["proctor", "liveAttempts"] as const;
export const PROCTOR_AUDIT_LOG_QUERY_KEY = ["proctor", "auditLog"] as const;
export const PROCTOR_AUDIT_SECURITY_QUERY_KEY = ["proctor", "securityAudit"] as const;

/** Default poll cadence for the live monitoring view. */
export const POLL_INTERVAL_MS = 3000;

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const ATTEMPT_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: ATTEMPT_STATUS_LABELS.PENDING },
  { value: "IN_PROGRESS", label: ATTEMPT_STATUS_LABELS.IN_PROGRESS },
  { value: "COMPLETED", label: ATTEMPT_STATUS_LABELS.COMPLETED },
] as const;

export const AUDIT_ACTION_LABELS: Record<ProctorAuditAction, string> = {
  FORCE_SUBMIT: "Force submit",
  FLAG_VIOLATION: "Flag violation",
  CLOSE_SESSION: "Close session",
};

export const PROCTOR_MONITORING_PAGE_SIZES = [25, 50, 100] as const;
export const DEFAULT_PROCTOR_PAGE_SIZE = 50;

export const PROCTOR_VIOLATION_TYPES = [
  { value: "TAB_SWITCH", label: "Chuyển tab / ứng dụng khác" },
  { value: "MULTIPLE_FACES", label: "Nhiều khuôn mặt trong camera" },
  { value: "FACE_NOT_VISIBLE", label: "Không nhận diện được khuôn mặt / rời vị trí" },
  { value: "SUSPICIOUS_AUDIO", label: "Âm thanh bất thường / tiếng nói" },
  { value: "TECHNICAL_ISSUE", label: "Sự cố kỹ thuật thiết bị" },
  { value: "OTHER", label: "Hành vi vi phạm quy chế khác" },
] as const;

export const PROCTOR_LIVE_TEXT = {
  TITLE: "Giám sát phòng thi",
  ROOM_CODE_PREFIX: "Mã phòng: #",
  OPEN_PREFIX: "Mở: ",
  CLOSE_PREFIX: " — Đóng: ",
  MINUTES_SUFFIX: " phút",
  LOADING: "Đang tải dữ liệu phòng giám sát…",
  ERROR_TITLE: "Không thể tải dữ liệu phòng giám sát",
  ERROR_DESCRIPTION: "Đã có lỗi xảy ra khi truy vấn dữ liệu từ máy chủ. Vui lòng thử lại.",
  AUDIT_LOG_BTN: "Nhật ký phòng thi",
  REFRESH_BTN: "Làm mới",
  UPDATING_TEXT: "Đang cập nhật...",
  RETRY: "Thử lại",
  LEAVE_ROOM_BTN: "Rời phòng giám sát",
  LEAVING_ROOM_BTN: "Đang đóng...",
  CLOSE_SESSION_CONFIRM_TITLE: "Xác nhận rời phòng giám sát",
  CLOSE_SESSION_CONFIRM_DESC:
    "Bạn có chắc chắn muốn kết thúc phiên giám sát của mình? Ca thi vẫn tiếp tục với các giám thị khác.",
  CLOSE_SESSION_CONFIRM_ACTION: "Xác nhận rời phòng",
  CANCEL: "Hủy bỏ",
  CONNECTING_ROOM: "Đang kết nối tới máy chủ giám sát...",
  RECONNECTING_ROOM: "Mất kết nối thời gian thực. Đang tự động kết nối lại...",
  DENIED_ROOM: "Phiên giám sát bị từ chối hoặc phân công đã bị thu hồi.",
  DISCONNECTED_ROOM: "Mất kết nối với kênh thông báo thời gian thực.",
  RECONNECT_BTN: "Kết nối lại",
  SESSION_OPEN_PENDING: "Đang kết nối và khởi tạo phiên giám sát với hệ thống...",
  SESSION_OPEN_RETRY: "Thử lại mở phiên",
  UNCONFIRMED_FORCE_SUBMIT_TITLE: "Chưa xác nhận nộp bài:",
  UNCONFIRMED_FORCE_SUBMIT_MSG:
    "Lệnh ép nộp đã được gửi nhưng máy thí sinh chưa xác nhận hoàn tất nộp bài. Vui lòng bấm kiểm tra lại.",
  RECHECK_BTN: "Làm mới kiểm tra",
  CHECKING_BTN: "Đang kiểm tra...",
  SUMMARY_LABEL: "Thống kê phòng thi",
  SUMMARY_REGISTERED: "Đã đăng ký",
  SUMMARY_NOT_STARTED: "Chưa bắt đầu",
  SUMMARY_IN_PROGRESS: "Đang làm bài",
  SUMMARY_SUBMITTED: "Đã nộp bài",
  STUDENTS_SECTION_LABEL: "Danh sách thí sinh",
  STUDENTS_TABLE_TITLE: "Danh sách thí sinh",
  PER_PAGE_SUFFIX: "/ trang",
  PER_PAGE_ARIA: "Số thí sinh mỗi trang",
  EMPTY_STUDENTS_TITLE: "Không có thí sinh nào trong danh sách phòng thi.",
  COL_STUDENT: "Thí sinh",
  COL_ATTEMPT: "Lượt thi",
  COL_STATUS: "Trạng thái",
  COL_STARTED_AT: "Bắt đầu",
  COL_LAST_SEEN: "Tín hiệu cuối",
  COL_VIOLATIONS: "Vi phạm",
  ACTION_DETAILS: "Chi tiết",
  STATUS_IN_PROGRESS: "Đang thi",
  STATUS_SUBMITTED: "Đã nộp",
  STATUS_ABANDONED: "Bỏ dở",
  STATUS_NOT_STARTED: "Chưa thi",
  BACK_TO_PROFILE: "Quay lại hồ sơ",
  PANEL_TITLE: "Chi tiết thí sinh",
  PANEL_CLOSE_ARIA: "Đóng",
  PANEL_NO_EMAIL: "Không có email",
  PANEL_CURRENT_ATTEMPT: "Lượt làm bài hiện tại",
  PANEL_ATTEMPT_ID: "Mã lượt thi",
  PANEL_NOT_AVAILABLE: "Chưa có",
  PANEL_ATTEMPT_COUNT: "Lần thi",
  PANEL_STATUS: "Trạng thái",
  PANEL_VIOLATIONS_RECORDED: "Vi phạm ghi nhận",
  PANEL_STARTED_AT: "Bắt đầu lúc",
  PANEL_LAST_SEEN: "Tín hiệu cuối (Heartbeat)",
  PANEL_FLAG_VIOLATION_BTN: "Ghi nhận vi phạm quy chế",
  PANEL_FORCE_SUBMIT_BTN: "Đình chỉ & Nộp bài bắt buộc",
  PANEL_DISCONNECTED_TOOLTIP: "Không thể thực hiện khi mất kết nối",
  PANEL_ATTEMPT_HISTORY_TITLE: "Lịch sử các lần thi",
  PANEL_LOADING_HISTORY: "Đang tải lịch sử...",
  PANEL_EMPTY_HISTORY_TITLE: "Chưa có lịch sử làm bài",
  PANEL_EMPTY_HISTORY_DESC: "Thí sinh chưa có lượt thi nào trước đây.",
  PANEL_ATTEMPT_NUMBER_PREFIX: "Lần thi #",
  FORCE_SUBMIT_TITLE: "Xác nhận đình chỉ & Nộp bài bắt buộc",
  FORCE_SUBMIT_CONFIRM_BTN: "Xác nhận nộp bài",
  FORCE_SUBMIT_PROCESSING: "Đang xử lý...",
  FORCE_SUBMIT_REASON_LABEL: "Lý do đình chỉ (tùy chọn)",
  FORCE_SUBMIT_REASON_PLACEHOLDER: "Nhập lý do nộp bài bắt buộc hoặc căn cứ biên bản...",
  FORCE_SUBMIT_ERROR: "Không thể đình chỉ bài làm. Vui lòng thử lại.",
  VIOLATION_TITLE: "Ghi nhận vi phạm quy chế thi",
  VIOLATION_CONFIRM_BTN: "Lưu biên bản vi phạm",
  VIOLATION_PROCESSING: "Đang xử lý...",
  VIOLATION_TYPE_LABEL: "Loại vi phạm *",
  VIOLATION_DETAIL_LABEL: "Mô tả chi tiết vi phạm",
  VIOLATION_DETAIL_PLACEHOLDER: "Mô tả hành vi, mốc thời gian hoặc diễn biến...",
  VIOLATION_NO_ATTEMPT_ERROR: "Thí sinh chưa có bài thi để ghi nhận vi phạm.",
  VIOLATION_SUBMIT_ERROR: "Không thể ghi nhận vi phạm. Vui lòng thử lại.",
} as const;

export const PROCTOR_AUDIT_TEXT = {
  TITLE: "Session audit log",
  SUBTITLE:
    "Post-hoc review of proctor actions and security audit events for this session.",
  TAB_VIOLATIONS: "Violations",
  TAB_SECURITY: "Security audit",
  LOADING_VIOLATIONS: "Loading violations…",
  LOADING_AUDIT: "Loading security audit…",
  EMPTY_VIOLATIONS_TITLE: "No violations flagged",
  EMPTY_VIOLATIONS_DESCRIPTION:
    "Violations will appear here once the backend endpoint is wired up. The UI shape ships first.",
  EMPTY_AUDIT_TITLE: "No security audit entries",
  EMPTY_AUDIT_DESCRIPTION:
    "Security audit entries will appear here once the backend endpoint is wired up.",
  LOAD_MORE: "Load more",
  END_OF_AUDIT: "End of audit log",
  COL_TIME: "Time",
  COL_TYPE: "Type",
  COL_PROCTOR: "Proctor",
  COL_DESCRIPTION: "Description",
  COL_HASH: "Hash position",
  BACK_TO_PROFILE: "Back to profile",
} as const;

export const PROCTOR_PROFILE_TEXT = {
  TITLE: "Proctor profile",
  SUBTITLE: "Your account details. This view is read-only.",
  FULL_NAME_LABEL: "Full name",
  EMAIL_LABEL: "Email",
  ROLES_LABEL: "Roles",
  STATUS_LABEL: "Status",
  TENANT_LABEL: "Tenant",
  LOADING: "Loading profile…",
  ERROR_TITLE: "Could not load profile",
  ERROR_DESCRIPTION: "Try refreshing the page. If the problem persists, contact your host admin.",
  EMPTY_FULL_NAME: "(no name set)",
  EMPTY_TENANT: "(no tenant)",
  ROLES_SEPARATOR: ", ",
  RETRY: "Retry",
} as const;
