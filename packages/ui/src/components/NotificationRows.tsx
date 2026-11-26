"use client";

import type { InboxItemResponse } from "@pte/api-client";
import type { ReactElement } from "react";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";
import { Badge } from "./Badge";
import { inboxBadgeVariant } from "./inboxCategoryVariant";
import { useInboxItemText } from "./useInboxItemText";

interface NotificationRowsProps {
  items: InboxItemResponse[];
  onSelectItem: (item: InboxItemResponse) => void;
  compact?: boolean;
  expanded?: boolean;
}

const NotificationRow = ({
  item,
  onSelectItem,
}: {
  item: InboxItemResponse;
  onSelectItem: (item: InboxItemResponse) => void;
}): ReactElement => {
  const { t } = useLocale();
  const text = useInboxItemText(item);
  const unread = item.readAt === null;

  return (
    <button
      type="button"
      onClick={() => onSelectItem(item)}
      className={cn(
        "block w-full px-4 py-3 text-left transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]",
        unread && "bg-[var(--brand-tint)]/50",
      )}
      aria-label={`${unread ? `${t("common.unread", "Unread")}: ` : ""}${text.title}`}
    >
      <div className="flex items-center justify-between gap-3">
        <Badge variant={inboxBadgeVariant(item)}>{text.categoryLabel}</Badge>
        <span className="flex shrink-0 items-center gap-2 text-xs text-[var(--ink-muted)]">
          <time dateTime={item.deliveredAt}>{text.time}</time>
          {unread && <span className="h-2 w-2 rounded-full bg-action" />}
        </span>
      </div>
      <p className={cn("mt-2 text-sm text-[var(--ink-primary)]", unread ? "font-semibold" : "font-medium")}>
        {text.title}
      </p>
      <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-secondary)]">{text.body}</p>
    </button>
  );
};

export const NotificationRows = ({
  items,
  onSelectItem,
  compact = false,
  expanded = false,
}: NotificationRowsProps): ReactElement => (
  <div
    className={cn(
      "divide-y divide-[var(--shell-border)]",
      compact && "max-h-80 overflow-y-auto",
      expanded && "max-h-[min(36rem,calc(100vh-8rem))] overflow-y-auto",
    )}
  >
    {items.map((item) => (
      <NotificationRow key={item.publicId} item={item} onSelectItem={onSelectItem} />
    ))}
  </div>
);
