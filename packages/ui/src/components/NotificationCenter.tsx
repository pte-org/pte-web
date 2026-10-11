"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import type { InboxItemResponse } from "@pte/api-client";
import { useLocale } from "../i18n";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { BellIcon } from "./icons";
import { LoadingState } from "./LoadingState";
import { NotificationFooter } from "./NotificationFooter";
import { NotificationRows } from "./NotificationRows";

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
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onCollapse?: () => void;
}

export interface NotificationHistoryProps {
  items: InboxItemResponse[];
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSelectItem: (item: InboxItemResponse) => void;
}

const displayCount = (count: number): string => (count > 99 ? "99+" : String(count));

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
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onCollapse,
}: NotificationBellProps): ReactElement => {
  const { t } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) setIsExpanded(false);
  }, [isOpen]);

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
        aria-label={`${t("common.notifications", "Notifications")}${unreadCount > 0 ? `, ${displayCount(unreadCount)} ${t("common.unread", "unread")}` : ""}`}
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        onClick={onToggle}
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-[var(--shell-border)] bg-[var(--shell-frame)] text-[var(--ink-primary)] shadow-xs transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 focus-visible:ring-offset-1"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[var(--blush-action)] px-1 text-[10px] font-semibold leading-4 text-white ring-2 ring-[var(--surface-card)]">
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
                {t("common.recentUpdates", "Recent updates for your account")}
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
                description={t(
                  "common.platformExamUpdates",
                  "New platform and exam updates will appear here.",
                )}
              />
            </div>
          ) : (
            <NotificationRows
              items={items}
              onSelectItem={onSelectItem}
              compact={!isExpanded}
              expanded={isExpanded}
            />
          )}
          <NotificationFooter
            isExpanded={isExpanded}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={
              onLoadMore
                ? () => {
                    setIsExpanded(true);
                    onLoadMore();
                  }
                : undefined
            }
            onCollapse={
              onCollapse
                ? () => {
                    setIsExpanded(false);
                    onCollapse();
                  }
                : undefined
            }
          />
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
    return (
      <EmptyState
        title={t("common.noNotifications", "No notifications")}
        description={t(
          "common.noNotificationsDescription",
          "There are no notifications in this view.",
        )}
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-lg bg-[var(--surface-card)] shadow-card">
      <NotificationRows items={items} onSelectItem={onSelectItem} />
    </div>
  );
};
