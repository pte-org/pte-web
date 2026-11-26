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
  CREATE_DRAFT: { en: "Announcement draft created", vi: "Đã tạo bản nháp thông báo" },
  UPDATE_DRAFT: { en: "Announcement draft updated", vi: "Đã cập nhật bản nháp thông báo" },
  DELETE_DRAFT: { en: "Announcement draft deleted", vi: "Đã xóa bản nháp thông báo" },
  PUBLISH: { en: "Announcement published", vi: "Đã phát hành thông báo" },
  RETRY_DELIVERY: { en: "Delivery retried", vi: "Đã gửi lại các lần giao thất bại" },
  ExamAudienceSourceRemoved: { en: "Exam audience source removed", vi: "Đã gỡ nguồn thí sinh khỏi kỳ thi" },
  ExamCancelled: { en: "Exam cancelled", vi: "Đã hủy kỳ thi" },
  ExamDraftDeleted: { en: "Exam draft deleted", vi: "Đã xóa bản nháp kỳ thi" },
  ExamGenerationCancelled: { en: "Exam generation cancelled", vi: "Đã hủy sinh đề thi" },
  OrganizationCreated: { en: "Organization created", vi: "Đã tạo tổ chức" },
  OrganizationSuspended: { en: "Organization suspended", vi: "Đã tạm ngưng tổ chức" },
  OrganizationReactivated: { en: "Organization reactivated", vi: "Đã kích hoạt lại tổ chức" },
  QuotaGranted: { en: "Quota granted", vi: "Đã cấp hạn mức" },
  ProgramUpdated: { en: "Program updated", vi: "Đã cập nhật chương trình" },
  ProgramArchived: { en: "Program archived", vi: "Đã lưu trữ chương trình" },
  ProgramStatusChanged: { en: "Program status changed", vi: "Đã đổi trạng thái chương trình" },
  ClassUpdated: { en: "Class updated", vi: "Đã cập nhật lớp học" },
  ClassArchived: { en: "Class archived", vi: "Đã lưu trữ lớp học" },
  ClassStatusChanged: { en: "Class status changed", vi: "Đã đổi trạng thái lớp học" },
  ClassesMerged: { en: "Classes merged", vi: "Đã gộp lớp học" },
  StudentTransferredClass: { en: "Student transferred to another class", vi: "Đã chuyển học viên sang lớp khác" },
  StudentUnassignedFromClass: { en: "Student removed from class", vi: "Đã xóa học viên khỏi lớp" },
  UserPasswordResetSelf: { en: "Password reset by the user", vi: "Người dùng tự đặt lại mật khẩu" },
  UserCredentialsEmailed: { en: "Credentials emailed", vi: "Đã gửi thông tin đăng nhập qua email" },
  PlatformUserArchived: { en: "Platform user archived", vi: "Đã lưu trữ người dùng nền tảng" },
  PlatformUserRestored: { en: "Platform user restored", vi: "Đã khôi phục người dùng nền tảng" },
  PlatformUserPasswordReset: { en: "Platform user password reset", vi: "Đã đặt lại mật khẩu người dùng nền tảng" },
  PlatformUserProfileUpdated: { en: "Platform user profile updated", vi: "Đã cập nhật hồ sơ người dùng nền tảng" },
  PlatformAuthorizationDenied: { en: "Authorization denied", vi: "Từ chối cấp quyền" },
  LICENSE_ISSUE: { en: "License code issued", vi: "Đã phát hành mã bản quyền" },
  LicenseCodeRevealed: { en: "License code revealed", vi: "Đã xem mã bản quyền" },
  PlanDraftDeleted: { en: "Plan draft deleted", vi: "Đã xóa bản nháp gói" },
  PLATFORM_SETTING_UPDATED: { en: "Platform setting updated", vi: "Đã cập nhật cài đặt nền tảng" },
  READ_APPLICATION: { en: "Application viewed", vi: "Đã xem đơn đăng ký" },
  SUBMITTED_FOR_APPROVAL: { en: "Submitted for approval", vi: "Đã gửi duyệt" },
  APPROVED: { en: "Approved", vi: "Đã duyệt" },
  REJECTED_TO_DRAFT: { en: "Returned to draft", vi: "Đã trả về bản nháp" },
  REVISION_CREATED: { en: "Revision created", vi: "Đã tạo phiên bản chỉnh sửa" },
  UNARCHIVED: { en: "Restored to draft", vi: "Đã khôi phục về bản nháp" },
  RETIRED: { en: "Retired", vi: "Đã ngừng sử dụng" },
  CLONED: { en: "Cloned", vi: "Đã nhân bản" },
  DELETED_DRAFT: { en: "Draft deleted", vi: "Đã xóa bản nháp" },
  CEFR_TARGETS_UPDATED: { en: "CEFR mix updated", vi: "Đã cập nhật tỷ lệ CEFR" },
  TIME_FRAME_UPDATED: { en: "Time frame updated", vi: "Đã cập nhật khung thời gian" },
  QuestionDraftDeleted: { en: "Question draft deleted", vi: "Đã xóa bản nháp câu hỏi" },
  DUPLICATE_REJECTED: { en: "Duplicate rejected", vi: "Đã từ chối do trùng" },
  RUNTIME_CONTRACT_UPDATED: { en: "Runtime contract updated", vi: "Đã cập nhật hợp đồng chạy bài" },
  TASK_TYPE_PUBLICATION_USAGE_RECORDED: { en: "Runtime lock usage recorded", vi: "Đã ghi nhận khóa phiên bản chạy bài" },
  QUESTION_GENERATION_BATCH_CREATED: { en: "Generation batch created", vi: "Đã tạo đợt sinh câu hỏi" },
  QUESTION_GENERATION_BATCH_CANCELLED: { en: "Generation batch cancelled", vi: "Đã hủy đợt sinh câu hỏi" },
  QUESTION_GENERATION_BATCH_DRAFTS_DELETED: { en: "Generation batch drafts deleted", vi: "Đã xóa bản nháp của đợt sinh" },
  VALIDATION_FAILED: { en: "Validation failed", vi: "Kiểm tra dữ liệu thất bại" },
  RUNTIME_CONTRACT_FAILURE: { en: "Runtime contract failure", vi: "Lỗi hợp đồng chạy bài" },
  RUNTIME_MAPPING_REJECTED: { en: "Runtime mapping rejected", vi: "Đã từ chối ánh xạ chạy bài" },
  RUNTIME_LOCK_CONFLICT: { en: "Runtime lock conflict", vi: "Xung đột khóa chạy bài" },
  GENERATION_META_UPDATE_FAILED: { en: "Generation details update failed", vi: "Cập nhật thông tin sinh câu hỏi thất bại" },
  SOURCE_SELECTED: { en: "Score source selected", vi: "Đã chọn nguồn điểm" },
  ATTENDANCE_RECORDED: { en: "Attendance recorded", vi: "Đã ghi nhận điểm danh" },
  IDENTITY_VERIFIED: { en: "Identity verification updated", vi: "Đã cập nhật xác minh danh tính" },
  INCIDENT_CHANGED: { en: "Incident updated", vi: "Đã cập nhật sự cố" },
  START: { en: "Grading started", vi: "Đã bắt đầu chấm" },
  SAVE_DRAFT: { en: "Grading draft saved", vi: "Đã lưu nháp chấm điểm" },
  SCORE_CHANGE: { en: "Score changed", vi: "Đã đổi điểm" },
  FINALIZE: { en: "Grading finalized", vi: "Đã hoàn tất chấm" },
  REOPEN: { en: "Grading reopened", vi: "Đã mở lại chấm điểm" },
  REGRADE: { en: "Regrade started", vi: "Đã bắt đầu chấm lại" },
  REPORT_ISSUE: { en: "Grading issue reported", vi: "Đã báo vấn đề khi chấm" },
  RESOLVE_ISSUE: { en: "Grading issue resolved", vi: "Đã xử lý vấn đề khi chấm" },
  REASSIGN: { en: "Grading reassigned", vi: "Đã giao lại bài chấm" },
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
  Program: { en: "Program", vi: "Chương trình" },
  TrainingClass: { en: "Class", vi: "Lớp học" },
  EXAM_SNAPSHOT: { en: "Exam snapshot", vi: "Bản chốt kỳ thi" },
  MEDIA: { en: "Media file", vi: "Tệp phương tiện" },
  PlatformSetting: { en: "Platform setting", vi: "Cài đặt nền tảng" },
  QUESTION_GENERATION_BATCH: { en: "Generation batch", vi: "Đợt sinh câu hỏi" },
  SCORE_SOURCE_SELECTION: { en: "Score source", vi: "Nguồn điểm" },
  EXAMINER_WORK: { en: "Grading work", vi: "Bài chấm điểm" },
  EXAM_INCIDENT: { en: "Exam incident", vi: "Sự cố kỳ thi" },
  SESSION_ATTENDANCE: { en: "Attendance", vi: "Điểm danh" },
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
