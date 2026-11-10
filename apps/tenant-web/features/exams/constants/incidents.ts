import type { IncidentStatus } from "@pte/api-client";

export const HOST_INCIDENT_TEXT = {
  TAB: "Sự cố",
  TITLE: "Tiếp nhận và xử lý sự cố",
  INTRO:
    "Các báo cáo của giám thị trong kỳ thi. Mở chi tiết để phản hồi, cập nhật kết quả hoặc bàn giao.",
  WORKFLOW: "Quy trình xử lý sự cố",
  FLOW: "Mới báo cáo → Đang xử lý → Đã giải quyết → Đã đóng. Chuyển cấp Admin khi cần nền tảng hỗ trợ; có thể tiếp nhận lại để tiếp tục xử lý. Sự cố đã đóng không thể chỉnh sửa.",
  UPDATE: "Cập nhật xử lý",
  STATUS: "Trạng thái tiếp theo",
  NOTE: "Phản hồi / ghi chú xử lý",
  RESULT: "Kết luận và phương án giải quyết",
  NOTE_HINT:
    "Nội dung được lưu trong lịch sử để giám thị theo dõi. Khi giải quyết, nội dung này cũng là kết luận xử lý.",
  SAVE: "Lưu cập nhật",
  SAVING: "Đang lưu…",
  SAVED: "Đã cập nhật hồ sơ sự cố.",
  FAILED: "Không thể cập nhật sự cố. Vui lòng thử lại.",
  CLOSED: "Hồ sơ đã đóng. Bạn có thể xem kết quả và toàn bộ lịch sử xử lý.",
  NEW: "Mới báo cáo",
} as const;

/** Forward handling, explicit escalation/reclaim and reopening before the immutable CLOSED state. */
export const HOST_INCIDENT_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  NEW: ["IN_PROGRESS", "ESCALATED"],
  IN_PROGRESS: ["RESOLVED", "ESCALATED"],
  ESCALATED: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
};
