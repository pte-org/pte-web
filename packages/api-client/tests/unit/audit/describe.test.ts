import { describe, expect, it } from "vitest";
import type { AuditLogResponse } from "../../../src/types/admin/auditLog";
import {
  auditActionTone,
  describeAuditEntry,
  describeAuditSummary,
  formatAuditTime,
  isSystemActor,
  resourceNameFromSummary,
  shortAuditId,
} from "../../../src/audit";

const wording = { program: "Chương trình", class: "Lớp học" };
const vi = (action: string, summary: string, name?: string): string | null =>
  describeAuditSummary(action, summary, name, "vi", wording);

const log = (overrides: Partial<AuditLogResponse>): AuditLogResponse => ({
  publicId: "1",
  actorUserId: "6843c327-83cf-494f-b733-9f5bc682d56c",
  actorRole: null,
  hasStateChange: false,
  aggregateType: "ExamSession",
  aggregateId: "3350e0ee-d75f-4b67",
  resourceName: null,
  resourceCode: null,
  action: "ExamPublished",
  summary: "",
  createdAt: "2026-11-26T10:04:36Z",
  ...overrides,
});

describe("describeAuditSummary", () => {
  it("words the scheduler's state change with the localized states", () => {
    expect(vi("ExamAutoOpened", "Test 1 222 (SCHEDULED -> OPEN)")).toBe("Đã lên lịch → Đang mở");
    expect(vi("ExamAutoClosed", "Test 1 (OPEN -> CLOSED)")).toBe("Đang mở → Đã đóng");
  });

  it("fixes the singular and plural of audience sources", () => {
    expect(vi("ExamAudienceSourceAdded", "1 sources")).toBe("Thêm 1 nguồn thí sinh");
    expect(describeAuditSummary("ExamAudienceSourceAdded", "1 sources", null, "en", wording)).toBe(
      "1 audience source added",
    );
    expect(describeAuditSummary("ExamAudienceSourceAdded", "3 sources", null, "en", wording)).toBe(
      "3 audience sources added",
    );
  });

  it("uses the organization's own words for a class and says who was skipped only when someone was", () => {
    expect(vi("StudentAssignedToClass", 'Bulk-assigned 3 student(s) to Class "Test Class 1" (0 already assigned)')).toBe(
      'Thêm 3 học viên vào Lớp học "Test Class 1"',
    );
    expect(vi("StudentAssignedToClass", 'Bulk-assigned 5 student(s) to Class "A" (2 already assigned)')).toBe(
      'Thêm 5 học viên vào Lớp học "A" (2 đã có sẵn)',
    );
    expect(vi("StudentAssignedToClass", 'Assigned student to Class "A"')).toBe('Thêm học viên vào Lớp học "A"');
    expect(vi("ClassSplit", 'Split Class into new Class "B" (3 student(s) moved)')).toBe(
      'Tách Lớp học thành Lớp học mới "B" (chuyển 3 học viên)',
    );
  });

  it("words support ticket events", () => {
    expect(vi("TicketClosed", "Host closed ticket")).toBe("Tổ chức đã đóng yêu cầu");
    expect(vi("TicketSubmitted", "Submitted ticket [BUG]")).toBe("Gửi yêu cầu · Lỗi / kỹ thuật");
    expect(vi("TicketStatusUpdated", "Status updated to IN_PROGRESS")).toBe("Chuyển sang Đang xử lý");
    expect(vi("TicketNoteAdded", "Admin added note")).toBe("Quản trị viên đã phản hồi");
  });

  it("words the platform admin's own events", () => {
    expect(vi("REVIEW_APPLICATION", "Approved tenant application")).toBe("Duyệt đơn đăng ký tổ chức");
    expect(vi("REVIEW_APPLICATION", "Rejected tenant application")).toBe("Từ chối đơn đăng ký tổ chức");
    expect(vi("CREATED", "Created question draft")).toBe("Tạo bản nháp câu hỏi");
    expect(vi("PUBLISHED", "Published question")).toBe("Phát hành câu hỏi");
    expect(vi("CREATED", "Created host template from default version 2")).toBe(
      "Tạo mẫu điểm cho tổ chức từ phiên bản mặc định 2",
    );
  });

  it("keeps a license grant to the contract and start date, not the ids", () => {
    const withDate =
      "Granted plan 6de5ff75 to tenant 67e7a067 under contract 213123123123 starting 2026-11-24T13:28:22.868588748Z";
    expect(vi("LICENSE_GRANT", withDate)).toBe("Cấp gói theo hợp đồng 213123123123, hiệu lực từ 24/11/2026");
    expect(vi("LICENSE_GRANT", "Granted plan a to tenant b under contract 99 starting null")).toBe(
      "Cấp gói theo hợp đồng 99",
    );
  });

  it("drops a summary that only repeats the resource name", () => {
    expect(vi("ExamPublished", "PTE local exam", "PTE local exam")).toBeNull();
  });

  it("keeps what it does not recognise exactly as stored", () => {
    expect(vi("SomethingNew", "Did a new thing")).toBe("Did a new thing");
    expect(vi("TicketClosed", "Closed in some other way")).toBe("Closed in some other way");
  });
});

describe("describeAuditEntry", () => {
  it("shows two lines for a resource with a name and code, and the short id for a ticket", () => {
    const exam = describeAuditEntry(
      log({ resourceName: "Test 1 222", resourceCode: "NINHLE2-261126-G6LH", summary: "Test 1 222" }),
      { locale: "vi" },
    );
    expect(exam.name).toBe("Test 1 222");
    expect(exam.detail).toBe("Kỳ thi · NINHLE2-261126-G6LH");
    expect(exam.summary).toBeNull();

    const ticket = describeAuditEntry(
      log({ aggregateType: "SupportTicket", action: "TicketClosed", summary: "Host closed ticket" }),
      { locale: "vi" },
    );
    expect(ticket.name).toBe("#3350E0EE");
    expect(ticket.detail).toBe("Yêu cầu hỗ trợ");
  });

  it("names a class from the sentence and uses the organization's word for it", () => {
    const entry = describeAuditEntry(
      log({ aggregateType: "TrainingClass", action: "ClassCreated", summary: 'Created Class "Lớp A"' }),
      { locale: "vi", class: "Lớp" },
    );
    expect(entry.name).toBe("Lớp A");
    expect(entry.detail).toBe("Lớp");
    expect(entry.summary).toBe('Tạo Lớp "Lớp A"');
  });

  it("marks scheduler jobs as system and falls back to readable words for unknown codes", () => {
    const entry = describeAuditEntry(
      log({ actorUserId: "00000000-0000-0000-0000-000000000000", action: "SomethingNew", aggregateType: "Thing" }),
      { locale: "en" },
    );
    expect(entry.isSystem).toBe(true);
    expect(entry.actionLabel).toBe("Something new");
    expect(entry.kind).toBe("Thing");
  });
});

describe("audit helpers", () => {
  it("tells scheduler jobs from people by the nil actor id", () => {
    expect(isSystemActor("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isSystemActor("6843c327-83cf-494f-b733-9f5bc682d56c")).toBe(false);
  });

  it("groups actions by what they do", () => {
    expect(auditActionTone("ExamPublished")).toBe("create");
    expect(auditActionTone("ExamAutoClosed")).toBe("close");
    expect(auditActionTone("OrganizationUpdated")).toBe("update");
  });

  it("splits the time into a four-digit-year date and a time with seconds", () => {
    const parts = formatAuditTime("2026-11-26T10:04:36Z", "vi");
    expect(parts.date).toBe("26/11/2026");
    expect(parts.time).toMatch(/^\d{2}:\d{2}:36$/);
  });

  it("lifts a name out of a sentence and shortens an id", () => {
    expect(resourceNameFromSummary("ClassCreated", 'Created Class "Local seed class"')).toBe("Local seed class");
    expect(resourceNameFromSummary("ExamPublished", 'Published "x"')).toBeNull();
    expect(shortAuditId("3350e0ee-d75f-4b67")).toBe("#3350E0EE");
  });
});
