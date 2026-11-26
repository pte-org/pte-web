import type {
  AttendanceStatus,
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
/** Poll cadence for the session header and other proctor views that must follow status changes. */
export const POLL_INTERVAL_MS = 3000;

/** Attempt status (from the attendance row) for which force submit is offered. */
export const ATTEMPT_IN_PROGRESS = "IN_PROGRESS";
export const ATTEMPT_SUBMITTED = "SUBMITTED";

/** Force submit from the attendance roster: only for a Student whose attempt is in progress. */
export const PROCTOR_FORCE_SUBMIT_TEXT = {
  ACTION: "Buộc nộp bài",
  TITLE: "Xác nhận buộc nộp bài",
  MESSAGE_PREFIX: "Bài làm của thí sinh ",
  MESSAGE_SUFFIX: " sẽ được nộp ngay và thí sinh không thể tiếp tục làm bài.",
  CONFIRM: "Nộp bài",
  CANCEL: "Hủy",
  PROCESSING: "Đang xử lý...",
  ERROR: "Không thể buộc nộp bài. Vui lòng thử lại.",
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
      return { label: "Mới báo cáo", variant: "warning" };
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
  FILTER_STATUS_LABEL: "Trạng thái điểm danh",
  ALL_TAB: "Tất cả",
  SEARCH_PLACEHOLDER: "Tìm tên hoặc email...",
  SEARCH_BTN: "Tìm",
  REFRESH_TITLE: "Làm mới",
  REFRESH_BTN: "Tải lại",
} as const;

export const PROCTOR_ROSTER_TEXT = {
  ACTIVITY_IN_PROGRESS: "Đang làm bài",
  ACTIVITY_SUBMITTED: "Đã nộp bài",
  ACTIVITY_ABANDONED: "Đã rời bài thi",
  ACTIVITY_CREATED: "Đã tạo lượt thi",
  ACTIVITY_UNKNOWN: "Chưa có thông tin",
  BLOCKED_GENERIC: "Hiện không thể chỉnh sửa điểm danh.",
  COL_STUDENT: "Thí sinh",
  COL_ATTENDANCE: "Điểm danh",
  COL_ACTIVITY: "Hoạt động bài thi",
  COL_LAST_ACTION: "Cập nhật gần nhất",
  NOT_STARTED: "Chưa bắt đầu",
  BY_PREFIX: "Bởi: ",
  ACTION_PRESENT: "Có mặt",
  ACTION_LATE: "Đến trễ",
  ACTION_ABSENT: "Vắng mặt",
  ACTION_RESET: "Đặt lại",
  ACTION_VIEW_HISTORY: "Lịch sử điểm danh",
  ACTION_MENU_LABEL: "Thao tác điểm danh",
  EMPTY_TITLE: "Không có dữ liệu thí sinh phù hợp.",
} as const;

export const PROCTOR_HISTORY_MODAL_TEXT = {
  TITLE: "Lịch sử điểm danh",
  SUBTITLE: "Theo dõi các lần cập nhật trạng thái và lý do điều chỉnh của thí sinh.",
  NO_NOTE: "Không có ghi chú bổ sung.",
  RECORDS: "lần cập nhật",
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

export const PROCTOR_INCIDENT_CATEGORY_OPTIONS: ReadonlyArray<{
  value: IncidentCategory;
  label: string;
}> = [
  { value: "IDENTITY_VERIFICATION", label: "Nghi vấn xác minh danh tính" },
  { value: "RULE_VIOLATION", label: "Vi phạm quy chế thi" },
  { value: "TECHNICAL_ISSUE", label: "Sự cố kỹ thuật / Thiết bị" },
  { value: "DISRUPTION", label: "Mất trật tự phòng thi" },
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
  FIELD_STUDENT_ID: "Thí sinh liên quan (tùy chọn)",
  STUDENT_NONE: "Không chọn (sự cố chung của ca thi)",
  STUDENT_LOADING: "Đang tải danh sách thí sinh...",
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
  { id: "RESOLVED", label: "Đã giải quyết" },
  { id: "CLOSED", label: "Đã đóng" },
];

export const PROCTOR_INCIDENT_LIST_TEXT = {
  SEARCH_PLACEHOLDER: "Tìm tiêu đề hoặc nội dung sự cố...",
  BACK_BTN: "Danh sách ca thi",
  REPORT_NEW_BTN: "+ Báo cáo sự cố mới",
  REPORT_CLOSED_HINT: "Ca thi đã kết thúc nên không thể báo cáo sự cố mới.",
  FILTER_STATUS_LABEL: "Trạng thái",
  TITLE_PREFIX: "Sự cố phòng thi: #",
  SUBTITLE: "Theo dõi và điều phối các sự cố xảy ra trong ca thi.",
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
  MODAL_TITLE_RESOLVE: "Xác nhận giải quyết sự cố",
  MODAL_TITLE_NOTE: "Bổ sung ghi chú vào hồ sơ sự cố",
  MODAL_CANCEL_BTN: "Hủy",
  MODAL_SAVING_BTN: "Đang lưu...",
  MODAL_CONFIRM_BTN: "Xác nhận",
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
  TITLE_PREFIX: "Điểm danh ca thi: ",
  SUBTITLE: "Quản lý và cập nhật danh sách có mặt / vắng mặt của thí sinh trong ca thi.",
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
} as const;

