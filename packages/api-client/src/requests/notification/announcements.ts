import type { ApiClient } from "../../client/client";
import type {
  AnnouncementAudiencePreviewResponse,
  AnnouncementCreateRequest,
  AnnouncementDeleteRequest,
  AnnouncementPage,
  AnnouncementPublishRequest,
  AnnouncementResponse,
  AnnouncementUpdateRequest,
  ListAnnouncementsParams,
} from "../../types/notification";

export const ANNOUNCEMENT_ENDPOINTS = {
  announcements: "/api/v1/announcements",
  announcement: (publicId: string) => `/api/v1/announcements/${publicId}`,
  audiencePreview: (publicId: string) => `/api/v1/announcements/${publicId}/audience-preview`,
  publish: (publicId: string) => `/api/v1/announcements/${publicId}/publish`,
  retryDelivery: (publicId: string) => `/api/v1/announcements/${publicId}/retry-delivery`,
} as const;

export function listAnnouncements(
  client: ApiClient,
  params: ListAnnouncementsParams = {},
): Promise<AnnouncementPage> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  return client.request<AnnouncementPage>(
    `${ANNOUNCEMENT_ENDPOINTS.announcements}?${query.toString()}`,
  );
}

export function createAnnouncement(
  client: ApiClient,
  payload: AnnouncementCreateRequest,
): Promise<AnnouncementResponse> {
  return client.request<AnnouncementResponse>(ANNOUNCEMENT_ENDPOINTS.announcements, {
    method: "POST",
    body: payload,
  });
}

export function getAnnouncement(
  client: ApiClient,
  publicId: string,
): Promise<AnnouncementResponse> {
  return client.request<AnnouncementResponse>(ANNOUNCEMENT_ENDPOINTS.announcement(publicId));
}

export function updateAnnouncement(
  client: ApiClient,
  publicId: string,
  payload: AnnouncementUpdateRequest,
): Promise<AnnouncementResponse> {
  return client.request<AnnouncementResponse>(ANNOUNCEMENT_ENDPOINTS.announcement(publicId), {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAnnouncement(
  client: ApiClient,
  publicId: string,
  payload?: AnnouncementDeleteRequest,
): Promise<void> {
  return client.request<void>(ANNOUNCEMENT_ENDPOINTS.announcement(publicId), {
    method: "DELETE",
    ...(payload === undefined ? {} : { body: payload }),
  });
}

export function previewAnnouncementAudience(
  client: ApiClient,
  publicId: string,
): Promise<AnnouncementAudiencePreviewResponse> {
  return client.request<AnnouncementAudiencePreviewResponse>(
    ANNOUNCEMENT_ENDPOINTS.audiencePreview(publicId),
  );
}

export function publishAnnouncement(
  client: ApiClient,
  publicId: string,
  payload: AnnouncementPublishRequest,
): Promise<AnnouncementResponse> {
  return client.request<AnnouncementResponse>(ANNOUNCEMENT_ENDPOINTS.publish(publicId), {
    method: "POST",
    body: payload,
  });
}

export function retryAnnouncementDelivery(
  client: ApiClient,
  publicId: string,
): Promise<AnnouncementResponse> {
  return client.request<AnnouncementResponse>(ANNOUNCEMENT_ENDPOINTS.retryDelivery(publicId), {
    method: "POST",
  });
}
