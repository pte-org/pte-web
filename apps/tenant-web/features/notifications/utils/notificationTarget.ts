import type { InboxItemResponse } from "@pte/api-client";

/** Page a notification opens, or null when it is read in place (announcements, maintenance, system notices). */
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
