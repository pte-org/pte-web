import type { InboxItemResponse } from "@pte/api-client";
import { describe, expect, it } from "vitest";
import { notificationTargetHref } from "../../../../features/notifications/targetHref";

const item = (targetType: string): InboxItemResponse =>
  ({ targetType, targetPublicId: "abc" }) as InboxItemResponse;

describe("notificationTargetHref (admin)", () => {
  it("sends applications and tickets to their page", () => {
    expect(notificationTargetHref(item("APPLICATION"))).toBe("/admin/applications/abc");
    expect(notificationTargetHref(item("SUPPORT_TICKET"))).toBe("/admin/support-tickets/abc");
  });

  it("has no page for an announcement, which is read in a dialog", () => {
    expect(notificationTargetHref(item("ANNOUNCEMENT"))).toBeNull();
  });
});
