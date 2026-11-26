"use client";

import type { InboxCategory, InboxReadFilter } from "@pte/api-client";
import type { ReactElement } from "react";
import { useLocale } from "../i18n";
import { Select } from "./Select";
import { Tabs } from "./Tabs";

const CATEGORIES: readonly { value: InboxCategory; key: string; fallback: string }[] = [
  { value: "SYSTEM_NOTICE", key: "common.notificationCategorySystem", fallback: "System notice" },
  { value: "MAINTENANCE", key: "common.notificationCategoryMaintenance", fallback: "Maintenance" },
  { value: "SESSION", key: "common.notificationCategorySession", fallback: "Session" },
  { value: "APPLICATION", key: "common.notificationCategoryApplication", fallback: "Application" },
  { value: "BILLING", key: "common.notificationCategoryBilling", fallback: "Billing" },
  { value: "SUPPORT", key: "common.notificationCategorySupport", fallback: "Support" },
];

interface NotificationHistoryToolbarProps {
  filter: InboxReadFilter;
  category: InboxCategory | undefined;
  onFilterChange: (filter: InboxReadFilter) => void;
  onCategoryChange: (category: InboxCategory | undefined) => void;
}

/** The notification list's filters, in the viewer's language: all or unread, and one category. */
export const NotificationHistoryToolbar = ({
  filter,
  category,
  onFilterChange,
  onCategoryChange,
}: NotificationHistoryToolbarProps): ReactElement => {
  const { t } = useLocale();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs
        variant="segmented"
        ariaLabel={t("common.notificationFilterLabel", "Notification filter")}
        value={filter}
        onChange={(next) => onFilterChange(next as InboxReadFilter)}
        items={[
          { id: "ALL", label: t("common.notificationFilterAll", "All") },
          { id: "UNREAD", label: t("common.notificationFilterUnread", "Unread") },
        ]}
      />
      <Select
        id="notification-category"
        aria-label={t("common.notificationCategoryFilterLabel", "Notification category")}
        options={[
          { label: t("common.notificationAllCategories", "All categories"), value: "" },
          ...CATEGORIES.map((entry) => ({ label: t(entry.key, entry.fallback), value: entry.value })),
        ]}
        value={category ?? ""}
        onChange={(event) => onCategoryChange((event.target.value || undefined) as InboxCategory | undefined)}
      />
    </div>
  );
};
