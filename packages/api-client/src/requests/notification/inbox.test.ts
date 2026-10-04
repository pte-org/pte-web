import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import type { InboxItemResponse } from "../../types/notification";
import {
  getInboxItem,
  getInboxUnreadCount,
  listInbox,
  markAllInboxRead,
  markInboxItemRead,
  NOTIFICATION_INBOX_ENDPOINTS,
} from "./inbox";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    uploadDownload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("notification inbox requests", () => {
  it("anchors list filters in the server-owned query contract", async () => {
    const client = fakeClient();

    await listInbox(client, {
      page: 1,
      size: 20,
      filter: "UNREAD",
      category: "SESSION",
      snapshot: "opaque snapshot",
    });

    expect(client.request).toHaveBeenCalledWith(
      `${NOTIFICATION_INBOX_ENDPOINTS.inbox}?page=1&size=20&filter=UNREAD&category=SESSION&snapshot=opaque+snapshot`,
    );
  });

  it("encodes the support category and models support-ticket targets", async () => {
    const client = fakeClient();

    const supportItem: InboxItemResponse = {
      publicId: "item-id",
      notificationType: "SUPPORT_TICKET_NOTE_ADDED",
      category: "SUPPORT",
      importance: "INFO",
      title: "Admin response",
      body: "An administrator responded to your feedback.",
      targetType: "SUPPORT_TICKET",
      targetPublicId: "ticket-id",
      sequenceNo: 1,
      deliveredAt: "2026-10-04T00:00:00Z",
      readAt: null,
    };

    await listInbox(client, { category: "SUPPORT" });

    expect(supportItem.targetType).toBe("SUPPORT_TICKET");
    expect(client.request).toHaveBeenCalledWith(
      `${NOTIFICATION_INBOX_ENDPOINTS.inbox}?page=0&size=20&filter=ALL&category=SUPPORT`,
    );
  });

  it("uses self-scoped detail and read-state endpoints", async () => {
    const client = fakeClient();

    await getInboxUnreadCount(client);
    await getInboxItem(client, "item-id");
    await markInboxItemRead(client, "item-id");
    await markAllInboxRead(client, "opaque snapshot");

    expect(client.request).toHaveBeenNthCalledWith(1, NOTIFICATION_INBOX_ENDPOINTS.unreadCount);
    expect(client.request).toHaveBeenNthCalledWith(2, NOTIFICATION_INBOX_ENDPOINTS.item("item-id"));
    expect(client.request).toHaveBeenNthCalledWith(
      3,
      NOTIFICATION_INBOX_ENDPOINTS.read("item-id"),
      {
        method: "PUT",
      },
    );
    expect(client.request).toHaveBeenNthCalledWith(4, NOTIFICATION_INBOX_ENDPOINTS.readAll, {
      method: "POST",
      body: { snapshotToken: "opaque snapshot" },
    });
  });
});
