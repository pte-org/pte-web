"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  getUserFacingApiErrorMessage,
  type InboxCategory,
  type InboxItemResponse,
  type InboxReadFilter,
} from "@pte/api-client";
import {
  Alert,
  Button,
  NotificationHistory,
  PaginationControls,
  Select,
  useLocale,
  useToast,
} from "@pte/ui";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationCenter,
  useNotificationHistory,
} from "../api";

/** The category filter's values with the shared category wording (the same words the notification rows use). */
const CATEGORY_KEYS: readonly { value: InboxCategory; key: string; fallback: string }[] = [
  { value: "SYSTEM_NOTICE", key: "common.notificationCategorySystem", fallback: "System notice" },
  { value: "MAINTENANCE", key: "common.notificationCategoryMaintenance", fallback: "Maintenance" },
  { value: "SESSION", key: "common.notificationCategorySession", fallback: "Session" },
  { value: "APPLICATION", key: "common.notificationCategoryApplication", fallback: "Application" },
  { value: "BILLING", key: "common.notificationCategoryBilling", fallback: "Billing" },
  { value: "SUPPORT", key: "common.notificationCategorySupport", fallback: "Support" },
];

function targetHref(item: InboxItemResponse): string {
  switch (item.targetType) {
    case "SESSION":
      return `/host/exams/${item.targetPublicId}`;
    case "ORDER":
      return `/host/orders?publicId=${encodeURIComponent(item.targetPublicId)}`;
    case "SUBSCRIPTION":
      return "/host/billing";
    case "QUOTA":
      return "/host/quota";
    case "SUPPORT_TICKET":
      return `/host/support-tickets/${item.targetPublicId}`;
    default:
      return `/host/notifications/${item.publicId}`;
  }
}

function NotificationHistoryContent(): ReactElement {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLocale();
  const [filter, setFilter] = useState<InboxReadFilter>("ALL");
  const [category, setCategory] = useState<InboxCategory | undefined>();
  const [page, setPage] = useState(0);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const history = useNotificationHistory(page, filter, category, snapshot);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const selectItem = async (item: InboxItemResponse): Promise<void> => {
    try {
      if (item.readAt === null) await markRead.mutateAsync(item.publicId);
      router.push(targetHref(item));
    } catch (error) {
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    }
  };
  const markAll = (): void => {
    void markAllRead.mutateAsync(snapshot).catch((error: unknown) => {
      showToast(getUserFacingApiErrorMessage(error), { tone: "error" });
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--surface-card)] p-3 shadow-card">
            <Select
              id="notification-filter"
              aria-label={t("tenant.notifications.filterLabel", "Notification filter")}
              options={[
                { label: t("tenant.notifications.all", "All notifications"), value: "ALL" },
                { label: t("tenant.notifications.unreadOnly", "Unread only"), value: "UNREAD" },
              ]}
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value as InboxReadFilter);
                setPage(0);
                setSnapshot(null);
              }}
            />
            <Select
              id="notification-category"
              aria-label={t("tenant.notifications.categoryLabel", "Notification category")}
              options={[
                { label: t("tenant.notifications.allCategories", "All categories"), value: "" },
                ...CATEGORY_KEYS.map((entry) => ({ label: t(entry.key, entry.fallback), value: entry.value })),
              ]}
              value={category ?? ""}
              onChange={(event) => {
                setCategory((event.target.value || undefined) as InboxCategory | undefined);
                setPage(0);
                setSnapshot(null);
              }}
            />
            <Button variant="secondary" onClick={markAll} isLoading={markAllRead.isPending}>
              {t("tenant.notifications.markAll", "Mark all read")}
            </Button>
      </div>
      {history.error && <Alert tone="error">{getUserFacingApiErrorMessage(history.error)}</Alert>}
      <NotificationHistory
        items={history.data?.page.data ?? []}
        isLoading={history.isLoading}
        errorMessage={history.error ? getUserFacingApiErrorMessage(history.error) : undefined}
        onRetry={() => void history.refetch()}
        onSelectItem={(item) => void selectItem(item)}
      />
      {history.data && (
        <PaginationControls
          meta={history.data.page.meta}
          onPageChange={(nextPage) => {
            setSnapshot(history.data?.snapshot.token ?? null);
            setPage(nextPage);
          }}
          disabled={history.isFetching}
        />
      )}
    </div>
  );
}

export function NotificationHistoryView(): ReactElement {
  const { unread } = useNotificationCenter();
  return <NotificationHistoryContent key={unread.data?.readRevision ?? "initial"} />;
}
