"use client";

import type { InboxItemResponse } from "@pte/api-client";
import type { ReactElement } from "react";
import { useLocale } from "../i18n";
import { cn } from "../utils/cn";
import { Badge } from "./Badge";
import { useInboxItemText } from "./useInboxItemText";

const importanceVariant = (importance: InboxItemResponse["importance"]): "info" | "warning" =>
  importance === "IMPORTANT" ? "warning" : "info";

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

  return (
    <button
      type="button"
      onClick={() => onSelectItem(item)}
      className={cn(
        "block w-full px-4 py-3 text-left transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)]",
        item.readAt === null && "bg-[var(--brand-tint)]/50",
      )}
      aria-label={`${item.readAt === null ? `${t("common.unread", "Unread")}: ` : ""}${text.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--ink-primary)]">{text.title}</span>
        {item.readAt === null && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-action" />}
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-secondary)]">{text.body}</p>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
        <Badge variant={importanceVariant(item.importance)}>{text.categoryLabel}</Badge>
        <time dateTime={item.deliveredAt}>{text.time}</time>
      </div>
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
