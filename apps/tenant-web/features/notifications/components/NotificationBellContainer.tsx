"use client";

import { useRouter } from "next/navigation";
import { getUserFacingApiErrorMessage, type InboxItemResponse } from "@pte/api-client";
import { NotificationBell, useToast } from "@pte/ui";
import { useNotificationCenter } from "../api";
import { notificationTargetHref } from "../utils/notificationTarget";

export function NotificationBellContainer() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    isOpen,
    setIsOpen,
    unread,
    recent,
    markRead,
    markAllRead,
    hasMoreRecent,
    isLoadingMore,
    loadMoreRecent,
    collapseRecent,
  } = useNotificationCenter();
  const unreadCount = unread.data?.unreadCount ?? 0;

  const selectItem = async (item: InboxItemResponse): Promise<void> => {
    try {
      if (item.readAt === null) await markRead.mutateAsync(item.publicId);
      const href = notificationTargetHref(item);
      if (href === null) return;
      setIsOpen(false);
      router.push(href);
    } catch (error) {
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    }
  };

  const markAll = (): void => {
    void markAllRead.mutateAsync(recent.data?.snapshot.token).catch((error: unknown) => {
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    });
  };

  return (
    <NotificationBell
      items={recent.data?.page.data ?? []}
      unreadCount={unreadCount}
      isOpen={isOpen}
      isLoading={recent.isLoading}
      errorMessage={recent.error ? getUserFacingApiErrorMessage(recent.error) : undefined}
      isMarkingAllRead={markAllRead.isPending}
      onToggle={() => setIsOpen((current) => !current)}
      onClose={() => setIsOpen(false)}
      onRetry={() => void recent.refetch()}
      onSelectItem={(item) => void selectItem(item)}
      onMarkAllRead={markAll}
      hasMore={hasMoreRecent}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMoreRecent}
      onCollapse={collapseRecent}
    />
  );
}
