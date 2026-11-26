import type { InboxItemResponse } from "@pte/api-client";

export const NOTIFICATIONS_PATH = "/admin/notifications";

/**
 * The page a notification is about, or null when it only carries a message (an announcement, a system notice) and is
 * read in a dialog instead.
 */
export function notificationTargetHref(item: InboxItemResponse): string | null {
  switch (item.targetType) {
    case "APPLICATION":
      return `/admin/applications/${item.targetPublicId}`;
    case "SUPPORT_TICKET":
      return `/admin/support-tickets/${item.targetPublicId}`;
    default:
      return null;
  }
}
