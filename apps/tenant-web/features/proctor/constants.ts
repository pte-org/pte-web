import type { AttemptStatus, ProctorAuditAction } from "./types";
import type {
  AttendanceStatus,
  IdentityVerificationStatus,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from "@pte/api-client";

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
  BACK_TO_SESSIONS_BTN: "Danh sách ca thi",
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
  FORCE_SUBMIT_CONFIRM_MSG_PREFIX: "Bạn có chắc chắn muốn nộp bài bắt buộc cho thí sinh ",
  FORCE_SUBMIT_EXAM_LABEL: " (Bài thi: ",
  FORCE_SUBMIT_CONFIRM_MSG_SUFFIX: ")? Thí sinh sẽ không thể tiếp tục làm bài.",
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
  STUDENT_PREFIX: "Thí sinh: ",
  PANEL_STARTED_PREFIX: "Bắt đầu: ",
  PANEL_SUBMITTED_PREFIX: "Nộp: ",
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
  ENTER_MONITORING: "Live monitoring",
  SESSION_LIST: "Assigned sessions",
  ERROR_TITLE: "Could not load audit data",
  ERROR_DESC: "An error occurred while loading audit entries. Please try again.",
  RETRY: "Retry",
  FILTER_DATE_RANGE: "Date range",
  TABS_ARIA_LABEL: "Audit log tabs",
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
  EMPTY_ROLES: "—",
  VIEW_ASSIGNED_SESSIONS: "Xem ca thi được phân công",
  ROLES_SEPARATOR: ", ",
  RETRY: "Retry",
} as const;

export function getAttendanceBadgeVariant(
  status: AttendanceStatus,
): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "PRESENT":
      return "success";
    case "LATE":
      return "warning";
    case "ABSENT":
      return "danger";
    case "UNMARKED":
    default:
      return "neutral";
  }
}

export function getAttendanceStatusLabel(status: AttendanceStatus | null | undefined): string {
  switch (status) {
    case "PRESENT":
      return "Có mặt";
    case "LATE":
      return "Đến trễ";
    case "ABSENT":
      return "Vắng mặt";
    case "UNMARKED":
    default:
      return "Chưa điểm danh";
  }
}

export function getIdentityBadgeProps(
  status: IdentityVerificationStatus = "UNVERIFIED",
): {
  label: string;
  variant: "success" | "danger" | "neutral";
} {
  switch (status) {
    case "VERIFIED":
      return { label: "Đã xác minh", variant: "success" };
    case "FAILED":
      return { label: "Nghi vấn / Không xác minh được", variant: "danger" };
    case "UNVERIFIED":
    default:
      return { label: "Chưa xác minh", variant: "neutral" };
  }
}

export function getIncidentSeverityBadge(
  severity: IncidentSeverity = "LOW",
): {
  label: string;
  variant: "danger" | "warning" | "neutral";
} {
  switch (severity) {
    case "HIGH":
      return { label: "Nghiêm trọng (HIGH)", variant: "danger" };
    case "MEDIUM":
      return { label: "Trung bình (MEDIUM)", variant: "warning" };
    case "LOW":
    default:
      return { label: "Thấp (LOW)", variant: "neutral" };
  }
}

export function getIncidentStatusBadge(
  status: IncidentStatus = "NEW",
): {
  label: string;
  variant: "danger" | "info" | "success" | "warning" | "neutral";
} {
  switch (status) {
    case "NEW":
      return { label: "Mới tiếp nhận", variant: "warning" };
    case "IN_PROGRESS":
      return { label: "Đang xử lý", variant: "info" };
    case "ESCALATED":
      return { label: "Đã chuyển cấp Admin", variant: "danger" };
    case "RESOLVED":
      return { label: "Đã giải quyết", variant: "success" };
    case "CLOSED":
    default:
      return { label: "Đã đóng", variant: "neutral" };
  }
}

export const PROCTOR_ATTENDANCE_SUMMARY_TEXT = {
  TOTAL_STUDENTS_LABEL: "Tổng số thí sinh",
  TOTAL_STUDENTS_FOOTNOTE: "Tổng số lượng thí sinh đăng ký",
  UNMARKED_LABEL: "Chưa điểm danh",
  UNMARKED_FOOTNOTE: "Chưa cập nhật trạng thái",
  PRESENT_LABEL: "Có mặt",
  PRESENT_FOOTNOTE: "Đã xác nhận có mặt",
  ABSENT_LABEL: "Vắng mặt",
  ABSENT_FOOTNOTE: "Ghi nhận vắng mặt",
  LATE_LABEL: "Đến trễ",
  LATE_FOOTNOTE: "Ghi nhận đến muộn",
} as const;

export const PROCTOR_TOOLBAR_TEXT = {
  ALL_TAB: "Tất cả",
  SEARCH_PLACEHOLDER: "Tìm tên hoặc email...",
  SEARCH_BTN: "Tìm",
  REFRESH_TITLE: "Làm mới",
  REFRESH_BTN: "Tải lại",
} as const;

export const PROCTOR_ROSTER_TEXT = {
  COL_STUDENT: "Thí sinh",
  COL_ATTENDANCE: "Điểm danh",
  COL_IDENTITY: "Xác minh danh tính",
  COL_ACTIVITY: "Hoạt động bài thi",
  COL_LAST_ACTION: "Cập nhật gần nhất",
  NOT_STARTED: "Chưa bắt đầu",
  BY_PREFIX: "Bởi: ",
  ACTION_PRESENT: "Có mặt",
  ACTION_LATE: "Đến trễ",
  ACTION_ABSENT: "Vắng mặt",
  ACTION_RESET: "Đặt lại",
  ACTION_VERIFY_IDENTITY: "Xác minh danh tính",
  ACTION_VIEW_HISTORY: "Lịch sử điểm danh",
  ACTION_MENU_LABEL: "Thao tác điểm danh",
  EMPTY_TITLE: "Không có dữ liệu thí sinh phù hợp.",
} as const;

export const PROCTOR_HISTORY_MODAL_TEXT = {
  TITLE_PREFIX: "Lịch sử điểm danh: ",
  CLOSE_BTN: "Đóng",
  EMAIL_PREFIX: "Email: ",
  ERROR_TITLE: "Không thể tải lịch sử điểm danh",
  RETRY_BTN: "Thử lại",
  EMPTY_TITLE: "Chưa có ghi nhận điểm danh nào cho thí sinh này.",
  COL_TIME: "Thời gian",
  COL_ACTOR: "Người thực hiện",
  COL_CHANGE: "Thay đổi",
  COL_REASON: "Lý do / Ghi chú",
} as const;

export const PROCTOR_RECORD_MODAL_TEXT = {
  TITLE: "Xác nhận ghi nhận điểm danh",
  CLOSE_BTN: "Đóng",
  CANCEL_BTN: "Hủy",
  PROCESSING_BTN: "Đang xử lý...",
  RETRY_EXACT_BTN: "Thử lại chính xác",
  CONFIRM_BTN: "Xác nhận",
  CURRENT_LABEL: "Hiện tại:",
  TARGET_LABEL: "Mục tiêu:",
  DISCREPANCY_TITLE: "Cảnh báo bất đồng bộ bài thi",
  DISCREPANCY_PREFIX: "Thí sinh có ghi nhận hoạt động bài thi (Trạng thái: ",
  DISCREPANCY_SUFFIX: "). Thao tác đánh dấu VẮNG MẶT không hủy bỏ hay ngắt bài thi của thí sinh.",
  REASON_REQUIRED_LABEL: "Lý do thay đổi (bắt buộc)",
  REASON_OPTIONAL_LABEL: "Ghi chú (tùy chọn)",
  REASON_REQUIRED_PLACEHOLDER: "Nhập lý do điều chỉnh trạng thái điểm danh...",
  REASON_OPTIONAL_PLACEHOLDER: "Nhập ghi chú nếu có...",
  REASON_VALIDATION_ERROR: "Vui lòng nhập lý do thay đổi điểm danh.",
  STALE_CONFLICT_ERROR: "Dữ liệu điểm danh đã được thay đổi bởi người khác. Vui lòng tải lại trang để xem trạng thái mới nhất.",
  UNKNOWN_NETWORK_ERROR: "Lỗi kết nối hoặc phản hồi máy chủ chưa xác định. Bạn có thể gửi lại chính xác lệnh này hoặc hủy để tải lại.",
} as const;

export const PROCTOR_IDENTITY_MODAL_TEXT = {
  TITLE: "Xác minh danh tính thí sinh",
  CLOSE_BTN: "Đóng",
  SAVING_BTN: "Đang lưu...",
  SAVE_BTN: "Lưu xác minh",
  CURRENT_STATUS_LABEL: "Trạng thái hiện tại:",
  VALIDATION_ERROR_TITLE: "Thông tin chưa hợp lệ",
  VALIDATION_ERROR_DESC: "Vui lòng nhập mô tả hoặc lý do không xác minh được danh tính.",
  SAVE_ERROR_FALLBACK: "Không thể lưu xác minh danh tính. Vui lòng thử lại.",
  RESULT_LABEL: "Kết quả đối chiếu danh tính *",
  STATUS_VERIFIED: "Hợp lệ (VERIFIED)",
  STATUS_FAILED: "Nghi vấn (FAILED)",
  STATUS_UNVERIFIED: "Chưa xác minh",
  NOTE_LABEL_PREFIX: "Ghi chú đối chiếu ",
  NOTE_REQUIRED_SUFFIX: "(Bắt buộc)",
  NOTE_OPTIONAL_SUFFIX: "(Tùy chọn)",
  NOTE_PLACEHOLDER: "Ghi nhận kết quả kiểm tra giấy tờ tùy thân, thẻ sinh viên...",
  ESCALATION_TITLE: "Thủ tục chuyển giao sự cố",
  ESCALATION_DESC: "Trường hợp không xác minh được danh tính, quy chế yêu cầu lập biên bản sự cố gửi Host để xử lý hoặc chuyển cấp Admin.",
  OPEN_INCIDENTS_BTN: "Mở quản lý sự cố ca thi",
} as const;

export const PROCTOR_INCIDENT_CATEGORY_OPTIONS: ReadonlyArray<{
  value: IncidentCategory;
  label: string;
}> = [
  { value: "IDENTITY_VERIFICATION", label: "Nghi vấn xác minh danh tính" },
  { value: "RULE_VIOLATION", label: "Vi phạm quy chế thi" },
  { value: "TECHNICAL_ISSUE", label: "Sự cố kỹ thuật / Thiết bị" },
  { value: "DISRUPTION", label: "Mất trật tự / Can thiệp phòng thi" },
  { value: "OTHER", label: "Sự cố khác" },
];

export const PROCTOR_INCIDENT_SEVERITY_OPTIONS: ReadonlyArray<{
  value: IncidentSeverity;
  label: string;
  desc: string;
}> = [
  { value: "LOW", label: "Thấp (LOW)", desc: "Không ảnh hưởng nhiều tới tiến trình làm bài" },
  { value: "MEDIUM", label: "Trung bình (MEDIUM)", desc: "Cần giám thị hoặc Host theo dõi, nhắc nhở" },
  { value: "HIGH", label: "Nghiêm trọng (HIGH)", desc: "Nghi vấn gian lận hoặc sự cố cần chuyển cấp khẩn cấp" },
];

export const PROCTOR_INCIDENT_REPORT_TEXT = {
  TITLE: "Báo cáo sự cố phòng thi mới",
  CANCEL_BTN: "Hủy bỏ",
  SUBMITTING_BTN: "Đang gửi báo cáo...",
  SUBMIT_BTN: "Gửi báo cáo sự cố",
  ERROR_TITLE: "Lỗi gửi báo cáo",
  ERROR_TITLE_REQUIRED: "Vui lòng nhập tiêu đề sự cố.",
  ERROR_DESC_REQUIRED: "Vui lòng nhập mô tả chi tiết sự cố.",
  ERROR_FALLBACK: "Không thể tạo báo cáo sự cố. Vui lòng thử lại.",
  FIELD_TITLE: "Tiêu đề sự cố *",
  TITLE_PLACEHOLDER: "Ví dụ: Thí sinh không mang giấy tờ tùy thân hợp lệ...",
  FIELD_CATEGORY: "Phân loại sự cố *",
  FIELD_SEVERITY: "Mức độ nghiêm trọng *",
  FIELD_STUDENT_ID: "Mã định danh thí sinh liên quan (tùy chọn)",
  STUDENT_ID_PLACEHOLDER: "Nhập mã định danh công khai của thí sinh (nếu có)...",
  FIELD_DESCRIPTION: "Mô tả chi tiết sự cố *",
  DESCRIPTION_PLACEHOLDER: "Mô tả cụ thể thời điểm phát hiện, hành vi hoặc hiện tượng quan sát thấy...",
} as const;

export const PROCTOR_INCIDENT_STATUS_TABS: ReadonlyArray<{
  id: IncidentStatus | "ALL";
  label: string;
}> = [
  { id: "ALL", label: "Tất cả" },
  { id: "NEW", label: "Mới báo cáo" },
  { id: "IN_PROGRESS", label: "Đang xử lý" },
  { id: "ESCALATED", label: "Chuyển cấp Admin" },
  { id: "RESOLVED", label: "Đã giải quyết" },
  { id: "CLOSED", label: "Đã đóng" },
];

export const PROCTOR_INCIDENT_LIST_TEXT = {
  BACK_BTN: "Danh sách ca thi",
  REPORT_NEW_BTN: "+ Báo cáo sự cố mới",
  FILTER_STATUS_LABEL: "Trạng thái",
  TITLE_PREFIX: "Sự cố phòng thi: #",
  SUBTITLE: "Theo dõi, điều phối và chuyển cấp các sự cố xảy ra trong ca thi.",
  ERROR_TITLE: "Không thể tải danh sách sự cố",
  ERROR_DESC: "Đã có lỗi xảy ra khi truy vấn dữ liệu từ máy chủ. Vui lòng thử lại.",
  RETRY_BTN: "Thử lại",
  EMPTY_TITLE: "Chưa có sự cố nào được ghi nhận cho ca thi này.",
  ACTION_DETAIL: "Chi tiết",
  COL_TITLE_CATEGORY: "Tiêu đề & Phân loại",
  COL_STUDENT: "Thí sinh liên quan",
  COL_SEVERITY: "Mức độ",
  COL_STATUS: "Trạng thái",
  COL_OWNER: "Phụ trách hiện tại",
  COL_UPDATED: "Cập nhật",
  STUDENT_FALLBACK: "Thí sinh",
  ALL_SESSION_SCOPE: "Toàn ca thi",
} as const;

export const PROCTOR_INCIDENT_DETAIL_TEXT = {
  BACK_BTN: "Danh sách sự cố ca thi",
  LOADING: "Đang tải chi tiết sự cố...",
  ERROR_TITLE: "Không thể tải chi tiết sự cố",
  ERROR_DESC: "Đã có lỗi xảy ra khi truy vấn dữ liệu từ máy chủ. Vui lòng thử lại.",
  RETRY_BTN: "Thử lại",
  BTN_TAKE_OWNERSHIP: "Tiếp nhận xử lý",
  BTN_ESCALATE: "Chuyển cấp Admin",
  BTN_RESOLVE: "Giải quyết sự cố",
  BTN_CLOSE: "Đóng hồ sơ sự cố",
  BTN_ADD_NOTE: "Bổ sung ghi chú",
  ACTION_FAILED_TITLE: "Thao tác thất bại",
  ACTION_FAILED_DEFAULT: "Thao tác không thành công.",
  ACTION_TAKE_OWNERSHIP_NOTE: "Tiếp nhận xử lý sự cố",
  ACTION_CLOSE_NOTE: "Đóng sự cố",
  COL_TIME: "Thời gian",
  COL_ACTOR: "Người thực hiện",
  COL_ACTION_STATUS: "Thao tác & Trạng thái",
  COL_NOTES: "Ghi chú / Biên bản",
  SECTION_DESCRIPTION: "Nội dung mô tả sự cố",
  SECTION_RESOLUTION: "Kết luận / Phương án giải quyết",
  EMPTY_RESOLUTION: "Chưa có kết luận giải quyết.",
  TIMELINE_TITLE: "Lịch sử xử lý & Bàn giao sự cố",
  TIMELINE_EMPTY: "Chưa có bản ghi lịch sử xử lý nào.",
  MODAL_TITLE_ESCALATE: "Chuyển cấp sự cố lên Admin",
  MODAL_TITLE_RESOLVE: "Xác nhận giải quyết sự cố",
  MODAL_TITLE_NOTE: "Bổ sung ghi chú vào hồ sơ sự cố",
  MODAL_CANCEL_BTN: "Hủy",
  MODAL_SAVING_BTN: "Đang lưu...",
  MODAL_CONFIRM_BTN: "Xác nhận",
  LABEL_ESCALATE: "Lý do và nội dung chuyển cấp Admin *",
  LABEL_RESOLVE: "Tóm tắt kết quả và phương án giải quyết *",
  LABEL_NOTE: "Nội dung ghi chú *",
  PLACEHOLDER_ACTION_NOTE: "Nhập nội dung chi tiết...",
  CATEGORY_LABEL: "Phân loại: ",
  REPORTER_LABEL: "Người báo cáo: ",
  TIME_LABEL: "Lúc ",
  DEFAULT_ACTOR_ROLE: "EXAMINER",
} as const;

export const PROCTOR_ATTENDANCE_VIEW_TEXT = {
  BACK_BTN: "Danh sách ca thi",
  UPDATED_PREFIX: "Cập nhật lúc: ",
  TITLE_PREFIX: "Điểm danh ca thi: ",
  SUBTITLE: "Quản lý và cập nhật danh sách có mặt / vắng mặt của thí sinh trong ca thi.",
  PORTAL_LOCKED_TITLE: "Cổng điểm danh bị khóa",
  REASON_PRE_OPEN: "Điểm danh chỉ mở trước giờ thi 30 phút.",
  REASON_CLOSED: "Ca thi đã kết thúc thời gian điểm danh.",
  REASON_CANCELLED: "Ca thi đã bị hủy bỏ.",
  WINDOW_OPENS_AT_PREFIX: "Thời gian mở điểm danh: ",
  ERROR_TITLE: "Không thể tải danh sách thí sinh",
  ERROR_DESC: "Đã có lỗi xảy ra khi truy vấn dữ liệu từ máy chủ.",
  RETRY_BTN: "Thử lại",
} as const;

export const PROCTOR_PICKER_TEXT = {
  ATTENDANCE: {
    TITLE: "Điểm danh ca thi",
    SUBTITLE: "Chọn ca thi bạn được phân công giám thị để thực hiện điểm danh thí sinh.",
    PAGE_TITLE: "Điểm danh ca thi | Giám thị",
  },
  INCIDENTS: {
    TITLE: "Sự cố phòng thi",
    SUBTITLE: "Chọn ca thi bạn được phân công giám thị để quản lý, báo cáo và theo dõi sự cố.",
    PAGE_TITLE: "Sự cố phòng thi | Giám thị",
  },
  AUDIT_LOG: {
    TITLE: "Nhật ký ca thi",
    SUBTITLE: "Chọn một ca thi được phân công để xem nhật ký giám sát và vi phạm",
    PAGE_TITLE: "Nhật ký ca thi | Giám thị",
  },
} as const;

