"use client";

import { localizeInboxItem, type InboxItemResponse } from "@pte/api-client";
import { useLocale } from "../i18n";
import { formatShortDateTime } from "../utils/formatShortDateTime";

const NOTIFICATION_CATEGORY_KEYS: Record<string, string> = {
  SYSTEM_NOTICE: "common.notificationCategorySystem",
  MAINTENANCE: "common.notificationCategoryMaintenance",
  SESSION: "common.notificationCategorySession",
  APPLICATION: "common.notificationCategoryApplication",
  BILLING: "common.notificationCategoryBilling",
  SUPPORT: "common.notificationCategorySupport",
};

export interface InboxItemText {
  title: string;
  body: string;
  categoryLabel: string;
  /** When it was delivered, as "16:25 · 26/11/2026" in the viewer's language. */
  time: string;
}

/** A notification as the viewer should read it: its text, category and time in the language of the screen. */
export function useInboxItemText(
  item: Pick<InboxItemResponse, "notificationType" | "title" | "body" | "category" | "deliveredAt">,
): InboxItemText {
  const { locale, t } = useLocale();
  const lang = locale === "vi" ? "vi" : "en";
  const { title, body } = localizeInboxItem(item, lang);
  const key = NOTIFICATION_CATEGORY_KEYS[item.category];
  const fallback = item.category.replaceAll("_", " ");
  return {
    title,
    body,
    categoryLabel: key ? t(key, fallback) : fallback,
    time: formatShortDateTime(item.deliveredAt, lang),
  };
}
