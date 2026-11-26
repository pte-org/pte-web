"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUserFacingApiErrorMessage, type InboxItemResponse } from "@pte/api-client";
import { InboxItemModal, NotificationBell, useToast } from "@pte/ui";
import { useNotificationCenter } from "../api";
import { notificationTargetHref, NOTIFICATIONS_PATH } from "../targetHref";

export function NotificationBellContainer() {
  const router = useRouter();
  const { showToast } = useToast();
  // A message-only notification (a system notice) has no page to go to; it is read in a dialog instead.
  const [reading, setReading] = useState<InboxItemResponse | null>(null);
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
      setIsOpen(false);
      const href = notificationTargetHref(item);
      if (href) router.push(href);
      else setReading(item);
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
    <>
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
        onViewAll={() => {
          setIsOpen(false);
          router.push(NOTIFICATIONS_PATH);
        }}
      />
      <InboxItemModal item={reading} onClose={() => setReading(null)} />
    </>
  );
}
