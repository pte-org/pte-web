import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  ANNOUNCEMENT_ENDPOINTS,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncement,
  listAnnouncements,
  previewAnnouncementAudience,
  publishAnnouncement,
  retryAnnouncementDelivery,
  updateAnnouncement,
} from "./announcements";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    uploadDownload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("admin announcement requests", () => {
  it("keeps list pagination explicit", async () => {
    const client = fakeClient();

    await listAnnouncements(client, { page: 2, size: 20 });

    expect(client.request).toHaveBeenCalledWith(
      `${ANNOUNCEMENT_ENDPOINTS.announcements}?page=2&size=20`,
    );
  });

  it("uses versioned draft and publication operations", async () => {
    const client = fakeClient();
    const id = "announcement-id";
    const createPayload = {
      title: "Maintenance",
      body: "The platform will be unavailable.",
      category: "MAINTENANCE" as const,
      importance: "IMPORTANT" as const,
      affectedFrom: null,
      affectedUntil: null,
      correctionOfPublicId: null,
    };
    const updatePayload = {
      title: createPayload.title,
      body: createPayload.body,
      category: createPayload.category,
      importance: createPayload.importance,
      affectedFrom: createPayload.affectedFrom,
      affectedUntil: createPayload.affectedUntil,
      expectedDraftVersion: 2,
    };

    await createAnnouncement(client, createPayload);
    await getAnnouncement(client, id);
    await updateAnnouncement(client, id, updatePayload);
    await previewAnnouncementAudience(client, id);
    await publishAnnouncement(client, id, { expectedDraftVersion: 2 });
    await retryAnnouncementDelivery(client, id);
    await deleteAnnouncement(client, id, { expectedDraftVersion: 3 });

    expect(client.request).toHaveBeenNthCalledWith(1, ANNOUNCEMENT_ENDPOINTS.announcements, {
      method: "POST",
      body: createPayload,
    });
    expect(client.request).toHaveBeenNthCalledWith(2, ANNOUNCEMENT_ENDPOINTS.announcement(id));
    expect(client.request).toHaveBeenNthCalledWith(3, ANNOUNCEMENT_ENDPOINTS.announcement(id), {
      method: "PATCH",
      body: updatePayload,
    });
    expect(client.request).toHaveBeenNthCalledWith(4, ANNOUNCEMENT_ENDPOINTS.audiencePreview(id));
    expect(client.request).toHaveBeenNthCalledWith(5, ANNOUNCEMENT_ENDPOINTS.publish(id), {
      method: "POST",
      body: { expectedDraftVersion: 2 },
    });
    expect(client.request).toHaveBeenNthCalledWith(6, ANNOUNCEMENT_ENDPOINTS.retryDelivery(id), {
      method: "POST",
    });
    expect(client.request).toHaveBeenNthCalledWith(7, ANNOUNCEMENT_ENDPOINTS.announcement(id), {
      method: "DELETE",
      body: { expectedDraftVersion: 3 },
    });
  });
});
