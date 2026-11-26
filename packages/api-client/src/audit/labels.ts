/** Audit codes the backend writes, in the words each portal shows. Anything missing falls back to a readable form of the code. */
export type AuditLocale = "vi" | "en";

export interface AuditWord {
  en: string;
  vi: string;
}

export const AUDIT_ACTION_LABELS: Record<string, AuditWord> = {
  ExamAudienceSourceAdded: { en: "Exam audience source added", vi: "Đã thêm nguồn thí sinh vào kỳ thi" },
  ExamAutoOpened: { en: "Exam opened automatically", vi: "Đã tự động mở kỳ thi" },
  ExamAutoClosed: { en: "Exam closed automatically", vi: "Đã tự động đóng kỳ thi" },
  ExamDraftCreated: { en: "Exam draft created", vi: "Đã tạo bản nháp kỳ thi" },
  ExamDraftUpdated: { en: "Exam draft updated", vi: "Đã cập nhật bản nháp kỳ thi" },
  ExamGenerated: { en: "Exam generated", vi: "Đã sinh đề thi" },
  ExamScheduleUpdated: { en: "Exam schedule updated", vi: "Đã cập nhật lịch kỳ thi" },
  ExamPublished: { en: "Exam published", vi: "Đã phát hành kỳ thi" },
  ExamClosed: { en: "Exam closed", vi: "Đã đóng kỳ thi" },
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
  REVIEW_APPLICATION: { en: "Application reviewed", vi: "Đã xét duyệt đơn đăng ký" },
  TicketSubmitted: { en: "Support ticket submitted", vi: "Đã gửi yêu cầu hỗ trợ" },
  TicketStatusUpdated: { en: "Support ticket status updated", vi: "Đã cập nhật trạng thái yêu cầu hỗ trợ" },
  TicketNoteAdded: { en: "Support ticket reply added", vi: "Đã phản hồi yêu cầu hỗ trợ" },
  TicketClosed: { en: "Support ticket closed", vi: "Đã đóng yêu cầu hỗ trợ" },
  TenantOnboarded: { en: "Organization onboarded", vi: "Đã khởi tạo tổ chức" },
  TenantSuspended: { en: "Organization suspended", vi: "Đã tạm ngưng tổ chức" },
  TenantReactivated: { en: "Organization reactivated", vi: "Đã kích hoạt lại tổ chức" },
  TenantBrandingUpdated: { en: "Organization branding updated", vi: "Đã cập nhật nhận diện tổ chức" },
  PlatformUserCreated: { en: "Platform user created", vi: "Đã tạo người dùng nền tảng" },
  PlatformUserRolesUpdated: { en: "Platform user roles updated", vi: "Đã cập nhật vai trò người dùng nền tảng" },
  PlatformUserSuspended: { en: "Platform user suspended", vi: "Đã tạm ngưng người dùng nền tảng" },
  PlatformUserReactivated: { en: "Platform user reactivated", vi: "Đã kích hoạt lại người dùng nền tảng" },
  CREATED: { en: "Created", vi: "Đã tạo" },
  UPDATED: { en: "Updated", vi: "Đã cập nhật" },
  PUBLISHED: { en: "Published", vi: "Đã phát hành" },
  ACTIVATED: { en: "Activated", vi: "Đã kích hoạt" },
  ARCHIVED: { en: "Archived", vi: "Đã lưu trữ" },
  AUTHORIZATION_DENIED: { en: "Authorization denied", vi: "Từ chối cấp quyền" },
};

/** What kind of thing a log is about; a program or class is worded by the organization instead (see the options). */
export const AUDIT_RESOURCE_LABELS: Record<string, AuditWord> = {
  Tenant: { en: "Organization", vi: "Tổ chức" },
  Organization: { en: "Organization", vi: "Tổ chức" },
  TENANT_APPLICATION: { en: "Organization application", vi: "Đơn đăng ký tổ chức" },
  Plan: { en: "Plan", vi: "Gói" },
  LicenseCode: { en: "License code", vi: "Mã bản quyền" },
  Order: { en: "Order", vi: "Đơn hàng" },
  Subscription: { en: "Subscription", vi: "Gói đăng ký" },
  User: { en: "User", vi: "Người dùng" },
  PlatformUser: { en: "Platform user", vi: "Người dùng nền tảng" },
  ANNOUNCEMENT: { en: "Announcement", vi: "Thông báo" },
  EXAM_BLUEPRINT: { en: "Exam blueprint", vi: "Cấu trúc kỳ thi" },
  SCORE_TEMPLATE: { en: "Score template", vi: "Mẫu điểm" },
  Question: { en: "Question", vi: "Câu hỏi" },
  TASK_TYPE: { en: "Task type", vi: "Dạng bài" },
  SupportTicket: { en: "Support ticket", vi: "Yêu cầu hỗ trợ" },
  ExamSession: { en: "Exam", vi: "Kỳ thi" },
};

export const AUDIT_EXAM_STATUS_LABELS: Record<string, AuditWord> = {
  DRAFT: { en: "Draft", vi: "Bản nháp" },
  SCHEDULED: { en: "Scheduled", vi: "Đã lên lịch" },
  PUBLISHED: { en: "Published", vi: "Đã phát hành" },
  OPEN: { en: "Open", vi: "Đang mở" },
  CLOSED: { en: "Closed", vi: "Đã đóng" },
  CANCELLED: { en: "Cancelled", vi: "Đã hủy" },
};

export const AUDIT_TICKET_STATUS_LABELS: Record<string, AuditWord> = {
  OPEN: { en: "Open", vi: "Đang mở" },
  IN_PROGRESS: { en: "In progress", vi: "Đang xử lý" },
  RESOLVED: { en: "Resolved", vi: "Đã xử lý" },
  CLOSED: { en: "Closed", vi: "Đã đóng" },
};

export const AUDIT_TICKET_CATEGORY_LABELS: Record<string, AuditWord> = {
  BUG: { en: "Bug / technical", vi: "Lỗi / kỹ thuật" },
  CONTENT_COMPLAINT: { en: "Content complaint", vi: "Khiếu nại nội dung" },
  GENERAL_FEEDBACK: { en: "General feedback", vi: "Phản hồi chung" },
};

/** "ExamAutoOpened" / "LICENSE_GRANT" as plain words, for a code this table does not know yet. */
export function humanizeAuditCode(value: string): string {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLocaleLowerCase();
  return spaced.charAt(0).toLocaleUpperCase() + spaced.slice(1);
}

export function auditWord(table: Record<string, AuditWord>, code: string, locale: AuditLocale): string {
  return table[code]?.[locale] ?? humanizeAuditCode(code);
}
