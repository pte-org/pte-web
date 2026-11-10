export const INCIDENT_POPUP_TEXT = {
  TITLE: "Chi tiết sự cố",
  VIEW: "Xem",
  ACTIONS: "Thao tác sự cố",
  CLOSE: "Đóng",
  CATEGORY: "Phân loại",
  STUDENT: "Thí sinh liên quan",
  STUDENT_UNAVAILABLE: "Chưa có tên thí sinh",
  ALL_SESSION: "Toàn ca thi",
  REPORTER: "Người báo cáo",
  REPORTED_AT: "Thời điểm báo cáo",
  UPDATED_AT: "Cập nhật gần nhất",
  OWNER: "Bên đang xử lý",
  DESCRIPTION: "Nội dung sự cố",
  RESOLUTION: "Kết quả xử lý",
  NO_RESOLUTION: "Chưa có kết quả xử lý từ bên phụ trách.",
  HISTORY: "Lịch sử xử lý",
  HISTORY_ERROR: "Không thể tải lịch sử xử lý",
  NOTE: "Bổ sung thông tin",
  NOTE_HINT: "Thông tin bổ sung được lưu vào hồ sơ để Host theo dõi.",
  SAVE: "Gửi bổ sung",
  SAVED: "Đã bổ sung thông tin vào hồ sơ sự cố.",
  SAVING: "Đang gửi…",
  SEVERITY: { LOW: "Thấp", MEDIUM: "Trung bình", HIGH: "Nghiêm trọng" },
  ROLES: {
    PROCTOR: "Giám thị",
    HOST_ADMIN: "Quản trị tổ chức",
    PLATFORM_ADMIN: "Quản trị nền tảng",
    PLATFORM_MANAGER: "Quản lý nền tảng",
    EXAMINER: "Giám khảo",
  },
  UNKNOWN_ROLE: "Nhân sự phụ trách",
} as const;

export function incidentRoleLabel(role: string): string {
  const entry = Object.entries(INCIDENT_POPUP_TEXT.ROLES).find(([key]) => key === role);
  return entry?.[1] ?? INCIDENT_POPUP_TEXT.UNKNOWN_ROLE;
}
