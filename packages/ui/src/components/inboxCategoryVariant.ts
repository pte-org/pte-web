import type { InboxItemResponse } from "@pte/api-client";
import type { BadgeVariant } from "./Badge";

/** One colour per kind of notification, so a list can be scanned by colour before it is read. */
const CATEGORY_VARIANT: Record<string, BadgeVariant> = {
  SYSTEM_NOTICE: "info",
  MAINTENANCE: "warning",
  BILLING: "success",
  SUPPORT: "warning",
};

/** The badge colour of a notification: its category's colour, or the warning colour when it is marked important. */
export function inboxBadgeVariant(item: Pick<InboxItemResponse, "category" | "importance">): BadgeVariant {
  if (item.importance === "IMPORTANT") return "warning";
  return CATEGORY_VARIANT[item.category] ?? "neutral";
}
