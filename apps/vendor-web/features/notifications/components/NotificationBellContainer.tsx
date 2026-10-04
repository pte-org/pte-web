"use client";

import { useRouter } from "next/navigation";
import { getUserFacingApiErrorMessage, type InboxItemResponse } from "@pte/api-client";
import { NotificationBell, useToast } from "@pte/ui";
import { useNotificationCenter } from "../api";

function targetHref(item: InboxItemResponse): string {
  switch (item.targetType) {
    case "APPLICATION":
      return `/admin/applications/${item.targetPublicId}`;
    case "ANNOUNCEMENT":
      return `/admin/notifications/${item.publicId}`;
    default:
      return `/admin/notifications/${item.publicId}`;
  }
}

export function NotificationBellContainer() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isOpen, setIsOpen, unread, recent, markRead, markAllRead } = useNotificationCenter();
  const unreadCount = unread.data?.unreadCount ?? 0;

  const selectItem = async (item: InboxItemResponse): Promise<void> => {
    try {
      if (item.readAt === null) await markRead.mutateAsync(item.publicId);
      setIsOpen(false);
      router.push(targetHref(item));
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
      onViewAll={() => {
        setIsOpen(false);
        router.push("/admin/notifications");
      }}
    />
  );
}
