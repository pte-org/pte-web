import { describe, expect, it } from "vitest";
import { localizeInboxItem } from "../../../src/notification/localize";
import type { InboxItemResponse } from "../../../src/types/notification";

const item = (
  notificationType: InboxItemResponse["notificationType"],
  title: string,
  body: string,
): Pick<InboxItemResponse, "notificationType" | "title" | "body"> => ({ notificationType, title, body });

describe("localizeInboxItem", () => {
  it("words the support ticket notifications with the ticket's category and status in the viewer's language", () => {
    expect(
      localizeInboxItem(
        item("SUPPORT_TICKET_STATUS_CHANGED", "Feedback status updated", "Your GENERAL_FEEDBACK feedback ticket is now RESOLVED."),
        "vi",
      ),
    ).toEqual({
      title: "Trạng thái yêu cầu hỗ trợ đã đổi",
      body: 'Yêu cầu hỗ trợ (Phản hồi chung) của bạn đã chuyển sang trạng thái "Đã xử lý".',
    });
    expect(
      localizeInboxItem(
        item("SUPPORT_TICKET_NOTE_ADDED", "Admin responded to your feedback", "An admin responded to your BUG feedback ticket."),
        "vi",
      ).body,
    ).toBe("Quản trị viên đã phản hồi yêu cầu hỗ trợ (Lỗi / kỹ thuật) của bạn.");
    expect(
      localizeInboxItem(item("SUPPORT_TICKET_SUBMITTED", "New feedback received", "New BUG feedback was submitted for admin review."), "vi").title,
    ).toBe("Có yêu cầu hỗ trợ mới");
  });

  it("words exam and billing notifications, keeping the names and numbers the sentence carries", () => {
    expect(
      localizeInboxItem(
        item("SESSION_PREVIEW_READY", "Exam preview ready", "Exam session 'PTE local' (ABC-1) is ready. Log in to PTE App as a host to preview it without changing the exam status."),
        "vi",
      ).body,
    ).toContain('Kỳ thi "PTE local" (ABC-1) đã sẵn sàng.');
    expect(
      localizeInboxItem(item("COMMERCIAL_OUTCOME_CONFIRMED", "Commercial access updated", "Your student capacity increased by 500 slots from 24/11/2026."), "vi").body,
    ).toBe("Hạn mức học viên của bạn tăng thêm 500 chỗ từ 24/11/2026.");
    expect(
      localizeInboxItem(item("EXAM_INCIDENT_REPORTED", "Exam incident reported", "A HIGH incident was reported: Student left the room"), "vi").body,
    ).toBe("Có sự cố mức cao được báo cáo: Student left the room");
  });

  it("formats the closing time in the viewer's own zone and format", () => {
    const text = localizeInboxItem(
      item("SESSION_CLOSING_SOON", "Exam session closing soon", "Exam session 'Test 1' closes at 2026-11-24T04:27:51Z."),
      "vi",
    );
    expect(text.title).toBe("Kỳ thi sắp đóng");
    expect(text.body).toMatch(/^Kỳ thi "Test 1" sẽ đóng lúc \d{2}:\d{2} · \d{2}\/11\/2026\.$/);
  });

  it("gives the English wording too", () => {
    expect(
      localizeInboxItem(item("ORDER_EXPIRED", "Payment order expired", "Payment order ord-1 expired before payment was confirmed."), "en"),
    ).toEqual({ title: "Payment order expired", body: "Payment order ord-1 expired before payment was confirmed." });
  });

  it("leaves an announcement somebody wrote, and a sentence it does not know, exactly as stored", () => {
    expect(localizeInboxItem(item("PLATFORM_ANNOUNCEMENT", "2323", "232323"), "vi")).toEqual({ title: "2323", body: "232323" });
    expect(localizeInboxItem(item("ORDER_EXPIRED", "Payment order expired", "Something new happened."), "vi")).toEqual({
      title: "Đơn thanh toán đã hết hạn",
      body: "Something new happened.",
    });
  });
});
