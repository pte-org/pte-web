import type { InboxItemResponse } from "@pte/api-client";
import { describe, expect, it } from "vitest";
import { notificationTargetHref } from "../../../../features/notifications/targetHref";

const item = (targetType: string, targetPublicId = "abc"): InboxItemResponse =>
  ({ targetType, targetPublicId }) as InboxItemResponse;

describe("notificationTargetHref (host)", () => {
  it("sends a notification about something to that page", () => {
    expect(notificationTargetHref(item("SESSION"))).toBe("/host/exams/abc");
    expect(notificationTargetHref(item("SUPPORT_TICKET"))).toBe("/host/support-tickets/abc");
    expect(notificationTargetHref(item("SUBSCRIPTION"))).toBe("/host/billing");
    expect(notificationTargetHref(item("QUOTA"))).toBe("/host/quota");
    expect(notificationTargetHref(item("ORDER", "a b"))).toBe("/host/orders?publicId=a%20b");
  });

  it("has no page for a message-only notification, which is read in a dialog", () => {
    expect(notificationTargetHref(item("ANNOUNCEMENT"))).toBeNull();
  });
});
