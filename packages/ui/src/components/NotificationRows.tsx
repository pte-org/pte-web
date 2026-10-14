"use client";

import type { InboxItemResponse } from "@pte/api-client";
import type { ReactElement } from "react";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";
import { Badge } from "./Badge";

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );

const importanceVariant = (importance: InboxItemResponse["importance"]): "info" | "warning" =>
  importance === "IMPORTANT" ? "warning" : "info";

const NOTIFICATION_CATEGORY_KEYS: Record<string, string> = {
  SYSTEM_NOTICE: "common.notificationCategorySystem",
  MAINTENANCE: "common.notificationCategoryMaintenance",
  SESSION: "common.notificationCategorySession",
  APPLICATION: "common.notificationCategoryApplication",
  BILLING: "common.notificationCategoryBilling",
  SUPPORT: "common.notificationCategorySupport",
};

interface NotificationRowsProps {
  items: InboxItemResponse[];
  onSelectItem: (item: InboxItemResponse) => void;
  compact?: boolean;
  expanded?: boolean;
}

export const NotificationRows = ({
  items,
  onSelectItem,
  compact = false,
  expanded = false,
}: NotificationRowsProps): ReactElement => {
  const { t } = useLocale();

  return (
    <div
      className={cn(
        "divide-y divide-[var(--shell-border)]",
        compact && "max-h-80 overflow-y-auto",
        expanded && "max-h-[min(36rem,calc(100vh-8rem))] overflow-y-auto",
      )}
    >
      {items.map((item) => (
        <button
          key={item.publicId}
          type="button"
          onClick={() => onSelectItem(item)}
          className={cn(
            "block w-full px-4 py-3 text-left transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]",
            item.readAt === null && "bg-[var(--brand-tint)]/50",
          )}
          aria-label={`${item.readAt === null ? `${t("common.unread", "Unread")}: ` : ""}${item.title}`}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--ink-primary)]">
              {item.title}
            </span>
            {item.readAt === null && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-action" />
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-secondary)]">{item.body}</p>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
            <Badge variant={importanceVariant(item.importance)}>
              {NOTIFICATION_CATEGORY_KEYS[item.category]
                ? t(NOTIFICATION_CATEGORY_KEYS[item.category], item.category.replaceAll("_", " "))
                : item.category.replaceAll("_", " ")}
            </Badge>
            <time dateTime={item.deliveredAt}>{formatDate(item.deliveredAt)}</time>
          </div>
        </button>
      ))}
    </div>
  );
};
