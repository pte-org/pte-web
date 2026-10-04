import type { ApiClient } from "../../client/client";
import type {
  InboxItemResponse,
  InboxPageResponse,
  InboxReadAllResponse,
  InboxUnreadCountResponse,
  ListInboxParams,
} from "../../types/notification";

export const NOTIFICATION_INBOX_ENDPOINTS = {
  inbox: "/api/v1/notification-inbox",
  unreadCount: "/api/v1/notification-inbox/unread-count",
  item: (itemPublicId: string) => `/api/v1/notification-inbox/${itemPublicId}`,
  read: (itemPublicId: string) => `/api/v1/notification-inbox/${itemPublicId}/read`,
  readAll: "/api/v1/notification-inbox/read-all",
} as const;

export function listInbox(
  client: ApiClient,
  params: ListInboxParams = {},
): Promise<InboxPageResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));
  query.set("filter", params.filter ?? "ALL");
  if (params.category) query.set("category", params.category);
  if (params.snapshot) query.set("snapshot", params.snapshot);
  return client.request<InboxPageResponse>(
    `${NOTIFICATION_INBOX_ENDPOINTS.inbox}?${query.toString()}`,
  );
}

export function getInboxUnreadCount(client: ApiClient): Promise<InboxUnreadCountResponse> {
  return client.request<InboxUnreadCountResponse>(NOTIFICATION_INBOX_ENDPOINTS.unreadCount);
}

export function getInboxItem(client: ApiClient, itemPublicId: string): Promise<InboxItemResponse> {
  return client.request<InboxItemResponse>(NOTIFICATION_INBOX_ENDPOINTS.item(itemPublicId));
}

export function markInboxItemRead(
  client: ApiClient,
  itemPublicId: string,
): Promise<InboxItemResponse> {
  return client.request<InboxItemResponse>(NOTIFICATION_INBOX_ENDPOINTS.read(itemPublicId), {
    method: "PUT",
  });
}

export function markAllInboxRead(
  client: ApiClient,
  snapshotToken?: string | null,
): Promise<InboxReadAllResponse> {
  return client.request<InboxReadAllResponse>(NOTIFICATION_INBOX_ENDPOINTS.readAll, {
    method: "POST",
    ...(snapshotToken === undefined ? {} : { body: { snapshotToken } }),
  });
}
