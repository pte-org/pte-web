import { describe, expect, it } from "vitest";
import {
  describeAuditSummary,
  resourceNameFromSummary,
  type AuditSummaryContext,
} from "../../../../features/auditLog/utils/auditSummary";
import {
  actionTone,
  formatAuditTime,
  isSystemActor,
  resourceHref,
  shortResourceId,
} from "../../../../features/auditLog/utils/auditFormat";

const context: AuditSummaryContext = {
  program: "Chương trình",
  class: "Lớp học",
  examStatus: (code) => ({ SCHEDULED: "Đã lên lịch", OPEN: "Đang mở", CLOSED: "Đã đóng" })[code] ?? code,
  ticketStatus: (code) => ({ IN_PROGRESS: "Đang xử lý" })[code] ?? code,
  ticketCategory: (code) => ({ BUG: "Lỗi / kỹ thuật" })[code] ?? code,
};

const vi = (action: string, summary: string, name?: string): string | null =>
  describeAuditSummary(action, summary, name, "vi", context);

describe("describeAuditSummary", () => {
  it("words the scheduler's state change with the localized states", () => {
    expect(vi("ExamAutoOpened", "Test 1 222 (SCHEDULED -> OPEN)")).toBe("Đã lên lịch → Đang mở");
    expect(vi("ExamAutoClosed", "Test 1 (OPEN -> CLOSED)")).toBe("Đang mở → Đã đóng");
  });

  it("fixes the singular and plural of audience sources", () => {
    expect(vi("ExamAudienceSourceAdded", "1 sources")).toBe("Thêm 1 nguồn thí sinh");
    expect(describeAuditSummary("ExamAudienceSourceAdded", "1 sources", null, "en", context)).toBe(
      "1 audience source added",
    );
    expect(describeAuditSummary("ExamAudienceSourceAdded", "3 sources", null, "en", context)).toBe(
      "3 audience sources added",
    );
  });

  it("uses the organization's own words for a class and names the students moved", () => {
    expect(vi("StudentAssignedToClass", 'Bulk-assigned 3 student(s) to Class "Test Class 1" (0 already assigned)')).toBe(
      'Thêm 3 học viên vào Lớp học "Test Class 1" (0 đã có sẵn)',
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
  });

  it("drops a summary that only repeats the resource name", () => {
    expect(vi("ExamPublished", "PTE local exam", "PTE local exam")).toBeNull();
  });

  it("keeps what it does not recognise exactly as stored", () => {
    expect(vi("SomethingNew", "Did a new thing")).toBe("Did a new thing");
    expect(vi("TicketClosed", "Closed in some other way")).toBe("Closed in some other way");
  });
});

describe("resourceNameFromSummary", () => {
  it("lifts the name of a class or program out of the sentence", () => {
    expect(resourceNameFromSummary("ClassCreated", 'Created Class "Local seed class"')).toBe("Local seed class");
    expect(resourceNameFromSummary("ExamPublished", 'Published "x"')).toBeNull();
  });
});

describe("audit formatting", () => {
  it("tells scheduler jobs from people by the nil actor id", () => {
    expect(isSystemActor("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isSystemActor("6843c327-83cf-494f-b733-9f5bc682d56c")).toBe(false);
  });

  it("groups actions by what they do", () => {
    expect(actionTone("ExamPublished")).toBe("create");
    expect(actionTone("ExamAutoClosed")).toBe("close");
    expect(actionTone("OrganizationUpdated")).toBe("update");
  });

  it("splits the time into a four-digit-year date and a time with seconds", () => {
    const parts = formatAuditTime("2026-11-26T10:04:36Z", "vi");
    expect(parts.date).toBe("26/11/2026");
    expect(parts.time).toMatch(/^\d{2}:\d{2}:36$/);
  });

  it("links only the resources whose page the id can reach", () => {
    expect(resourceHref("SupportTicket", "abc")).toBe("/host/support-tickets/abc");
    expect(resourceHref("ExamSession", "abc")).toBe("/host/exams/abc");
    expect(resourceHref("TrainingClass", "abc")).toBeUndefined();
    expect(shortResourceId("3350e0ee-d75f-4b67")).toBe("#3350E0EE");
  });
});
