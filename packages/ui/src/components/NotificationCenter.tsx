"use client";

import { useEffect, useRef, type ReactElement } from "react";
import type { InboxItemResponse } from "@pte/api-client";
import { cn } from "../utils/cn";
import { useLocale } from "../i18n";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { BellIcon } from "./icons";
import { LoadingState } from "./LoadingState";

export interface NotificationBellProps {
  items: InboxItemResponse[];
  unreadCount: number;
  isOpen: boolean;
  isLoading?: boolean;
  errorMessage?: string;
  isMarkingAllRead?: boolean;
  onToggle: () => void;
  onClose: () => void;
  onRetry?: () => void;
  onSelectItem: (item: InboxItemResponse) => void;
  onMarkAllRead: () => void;
  onViewAll: () => void;
}

export interface NotificationHistoryProps {
  items: InboxItemResponse[];
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelectItem: (item: InboxItemResponse) => void;
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );

const displayCount = (count: number): string => (count > 99 ? "99+" : String(count));

const importanceVariant = (importance: InboxItemResponse["importance"]): "info" | "warning" =>
  importance === "IMPORTANT" ? "warning" : "info";

const NotificationRows = ({
  items,
  onSelectItem,
  compact = false,
}: {
  items: InboxItemResponse[];
  onSelectItem: (item: InboxItemResponse) => void;
  compact?: boolean;
}): ReactElement => (
  <div className={cn("divide-y divide-slate-100", compact && "max-h-80 overflow-y-auto")}>
    {items.map((item) => (
      <button
        key={item.publicId}
        type="button"
        onClick={() => onSelectItem(item)}
        className={cn(
          "block w-full px-4 py-3 text-left transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action",
          item.readAt === null && "bg-blue-50/50",
        )}
        aria-label={`${item.readAt === null ? "Unread: " : ""}${item.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{item.title}</span>
          {item.readAt === null && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-action" />
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.body}</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-400">
          <Badge variant={importanceVariant(item.importance)}>
            {item.category.replaceAll("_", " ")}
          </Badge>
          <time dateTime={item.deliveredAt}>{formatDate(item.deliveredAt)}</time>
        </div>
      </button>
    ))}
  </div>
);

export const NotificationBell = ({
  items,
  unreadCount,
  isOpen,
  isLoading = false,
  errorMessage,
  isMarkingAllRead = false,
  onToggle,
  onClose,
  onRetry,
  onSelectItem,
  onMarkAllRead,
  onViewAll,
}: NotificationBellProps): ReactElement => {
  const { locale, t } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) triggerRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${t("common.notifications", "Notifications")}${unreadCount > 0 ? `, ${displayCount(unreadCount)} ${locale === "vi" ? "chưa đọc" : "unread"}` : ""}`}
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        onClick={onToggle}
        className="relative grid h-10 w-10 place-items-center rounded-md text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white ring-2 ring-white">
            {displayCount(unreadCount)}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          id="notification-panel"
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label={t("common.notifications", "Notification center")}
          className="absolute right-0 top-12 z-40 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] shadow-xl outline-none"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--shell-border)] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
                {t("common.notifications", "Notifications")}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">
                {locale === "vi" ? "Cập nhật mới cho tài khoản của bạn" : "Recent updates for your account"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={unreadCount === 0 || isMarkingAllRead}
              isLoading={isMarkingAllRead}
              onClick={onMarkAllRead}
            >
              {t("common.markAllRead", "Mark all read")}
            </Button>
          </div>
          {errorMessage ? (
            <div className="p-4">
              <ErrorState
                title={t("common.notificationsUnavailable", "Notifications unavailable")}
                description={errorMessage}
                action={
                  onRetry && (
                    <Button size="sm" variant="secondary" onClick={onRetry}>
                      {t("common.retry", "Retry")}
                    </Button>
                  )
                }
              />
            </div>
          ) : isLoading ? (
            <div className="p-4">
              <LoadingState rows={3} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={t("common.allCaughtUp", "You are all caught up")}
                description={locale === "vi" ? "Cập nhật nền tảng và kỳ thi sẽ hiển thị tại đây." : "New platform and exam updates will appear here."}
              />
            </div>
          ) : (
            <NotificationRows items={items} onSelectItem={onSelectItem} compact />
          )}
          <div className="border-t border-[var(--shell-border)] p-2">
            <Button variant="ghost" size="sm" fullWidth onClick={onViewAll}>
              {t("common.viewAllNotifications", "View all notifications")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const NotificationHistory = ({
  items,
  isLoading = false,
  errorMessage,
  onRetry,
  onSelectItem,
}: NotificationHistoryProps): ReactElement => {
  const { t } = useLocale();
  if (errorMessage) {
    return (
      <ErrorState
        title={t("common.notificationsUnavailable", "Notifications unavailable")}
        description={errorMessage}
        action={
          onRetry && (
            <Button size="sm" variant="secondary" onClick={onRetry}>
              {t("common.retry", "Retry")}
            </Button>
          )
        }
      />
    );
  }
  if (isLoading) return <LoadingState rows={5} />;
  if (items.length === 0) {
    return <EmptyState title={t("common.noNotifications", "No notifications")} description={t("common.noNotifications", "There are no notifications in this view.")} />;
  }
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-card">
      <NotificationRows items={items} onSelectItem={onSelectItem} />
    </div>
  );
};
