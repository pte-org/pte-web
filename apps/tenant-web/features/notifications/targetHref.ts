import type { InboxItemResponse } from "@pte/api-client";

export const NOTIFICATIONS_PATH = "/host/notifications";

/**
 * The page a notification is about, or null when it only carries a message (a system notice) and is read in a dialog
 * instead.
 */
export function notificationTargetHref(item: InboxItemResponse): string | null {
  switch (item.targetType) {
    case "SESSION":
      return `/host/exams/${item.targetPublicId}`;
    case "ORDER":
      return `/host/orders?publicId=${encodeURIComponent(item.targetPublicId)}`;
    case "SUBSCRIPTION":
      return "/host/billing";
    case "QUOTA":
      return "/host/quota";
    case "SUPPORT_TICKET":
      return `/host/support-tickets/${item.targetPublicId}`;
    default:
      return null;
  }
}
