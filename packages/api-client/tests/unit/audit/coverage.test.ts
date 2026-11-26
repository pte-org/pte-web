import { describe, expect, it } from "vitest";
import { AUDIT_ACTION_LABELS, AUDIT_RESOURCE_LABELS, auditActionTone, describeAuditSummary } from "../../../src/audit";

const wording = { program: "Chương trình", class: "Lớp học" };
const vi = (action: string, summary: string): string | null => describeAuditSummary(action, summary, null, "vi", wording);

/** Every action code the backend writes to the audit log (see the services that call AuditLogService / AuditLogChangeWriter). */
const BACKEND_ACTIONS = [
  "CREATE_DRAFT", "UPDATE_DRAFT", "DELETE_DRAFT", "PUBLISH", "RETRY_DELIVERY",
  "ExamAudienceSourceAdded", "ExamAudienceSourceRemoved", "ExamAutoClosed", "ExamAutoOpened", "ExamCancelled",
  "ExamClosed", "ExamDraftCreated", "ExamDraftDeleted", "ExamDraftUpdated", "ExamGenerated", "ExamPublished",
  "ExamScheduleUpdated", "OrganizationUpdated", "TenantOnboarded", "TenantSuspended", "TenantReactivated",
  "TenantBrandingUpdated", "ProgramCreated", "ProgramUpdated", "ProgramArchived", "ProgramStatusChanged",
  "ClassCreated", "ClassUpdated", "ClassArchived", "ClassStatusChanged", "ClassSplit", "ClassesMerged",
  "StudentAssignedToClass", "StudentTransferredClass", "StudentUnassignedFromClass", "UserPasswordChangedSelf",
  "UserPasswordReset", "UserPasswordResetSelf", "UserCredentialsEmailed", "UserProfileUpdated",
  "PlatformUserCreated", "PlatformUserRolesUpdated", "PlatformUserSuspended", "PlatformUserReactivated",
  "PlatformUserArchived", "PlatformUserRestored", "PlatformUserPasswordReset", "PlatformUserProfileUpdated",
  "PlatformAuthorizationDenied", "LICENSE_GRANT", "LICENSE_ISSUE", "LicenseCodeRevealed", "PLAN_TRANSITION",
  "PlanDraftDeleted", "PLATFORM_SETTING_UPDATED", "REVIEW_APPLICATION", "TicketSubmitted", "TicketStatusUpdated",
  "TicketNoteAdded", "TicketClosed", "CREATED", "UPDATED", "PUBLISHED", "ACTIVATED", "ARCHIVED", "UNARCHIVED",
  "SUBMITTED_FOR_APPROVAL", "APPROVED", "REJECTED_TO_DRAFT", "REVISION_CREATED", "RETIRED", "CLONED",
  "DELETED_DRAFT", "CEFR_TARGETS_UPDATED", "TIME_FRAME_UPDATED", "QuestionDraftDeleted", "AUTHORIZATION_DENIED",
  "VALIDATION_FAILED", "SOURCE_SELECTED", "ATTENDANCE_RECORDED", "IDENTITY_VERIFIED", "INCIDENT_CHANGED",
  "START", "SAVE_DRAFT", "SCORE_CHANGE", "FINALIZE", "REOPEN", "REGRADE", "REPORT_ISSUE", "RESOLVE_ISSUE", "REASSIGN",
];

const BACKEND_RESOURCES = [
  "ANNOUNCEMENT", "ExamSession", "LicenseCode", "Organization", "Plan", "PlatformSetting", "PlatformUser", "Program",
  "Question", "SCORE_TEMPLATE", "SupportTicket", "TENANT_APPLICATION", "TrainingClass", "User", "Tenant", "Order",
  "Subscription", "EXAM_BLUEPRINT", "EXAM_SNAPSHOT", "TASK_TYPE", "MEDIA", "QUESTION_GENERATION_BATCH",
  "SCORE_SOURCE_SELECTION", "EXAMINER_WORK", "EXAM_INCIDENT", "SESSION_ATTENDANCE",
];

describe("audit wording covers what the backend writes", () => {
  it.each(BACKEND_ACTIONS)("has Vietnamese and English wording for action %s", (code) => {
    expect(AUDIT_ACTION_LABELS[code]?.vi).toBeTruthy();
    expect(AUDIT_ACTION_LABELS[code]?.en).toBeTruthy();
  });

  it.each(BACKEND_RESOURCES.filter((code) => code !== "Tenant"))("names the resource %s", (code) => {
    expect(AUDIT_RESOURCE_LABELS[code]?.vi).toBeTruthy();
  });

  it("words the announcement sentences seen in the log", () => {
    expect(vi("PUBLISH", "Announcement published to 7 eligible hosts")).toBe("Phát hành tới 7 tổ chức đủ điều kiện");
    expect(vi("CREATE_DRAFT", "Announcement draft created")).toBe("Tạo bản nháp thông báo");
    expect(vi("RETRY_DELIVERY", "Reset 0 failed announcement deliveries")).toBe("Đặt lại 0 lượt giao thất bại");
  });

  it("words version and task type sentences, and leaves an unknown one as stored", () => {
    expect(vi("ACTIVATED", "Activated version 3")).toBe("Kích hoạt phiên bản 3");
    expect(vi("RETIRED", "Retired version 2 after activating version 3")).toBe("Ngừng phiên bản 2 sau khi kích hoạt phiên bản 3");
    expect(vi("CREATED", "Created task type SPEAKING_X")).toBe("Tạo dạng bài SPEAKING_X");
    expect(vi("PLATFORM_SETTING_UPDATED", "Updated platform setting a.b from 1 to 2")).toBe("Đổi a.b: 1 → 2");
    expect(vi("PlatformUserSuspended", "Something new")).toBe("Something new");
  });

  it("tones the new actions", () => {
    expect(auditActionTone("PUBLISH")).toBe("create");
    expect(auditActionTone("CREATE_DRAFT")).toBe("create");
    expect(auditActionTone("DELETE_DRAFT")).toBe("close");
    expect(auditActionTone("RETRY_DELIVERY")).toBe("update");
  });
});
