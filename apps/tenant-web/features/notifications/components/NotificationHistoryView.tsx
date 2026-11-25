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

const CATEGORY_CHOICES: ReadonlyArray<{ value: string; key: string; fallback: string }> = [
  { value: "", key: "categoryAll", fallback: "All categories" },
  { value: "SYSTEM_NOTICE", key: "categorySystemNotice", fallback: "System notice" },
  { value: "MAINTENANCE", key: "categoryMaintenance", fallback: "Maintenance" },
  { value: "SESSION", key: "categorySession", fallback: "Session" },
  { value: "APPLICATION", key: "categoryApplication", fallback: "Application" },
  { value: "BILLING", key: "categoryBilling", fallback: "Billing" },
  { value: "SUPPORT", key: "categorySupport", fallback: "Support" },
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
  const { t } = useLocale();
  const { showToast } = useToast();
  const categoryOptions = CATEGORY_CHOICES.map((choice) => ({
    value: choice.value,
    label: t(`tenant.notifications.${choice.key}`, choice.fallback),
  }));
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
                { label: t("tenant.notifications.filterAll", "All notifications"), value: "ALL" },
                { label: t("tenant.notifications.filterUnread", "Unread only"), value: "UNREAD" },
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
              options={categoryOptions}
              value={category ?? ""}
              onChange={(event) => {
                setCategory((event.target.value || undefined) as InboxCategory | undefined);
                setPage(0);
                setSnapshot(null);
              }}
            />
            <Button variant="secondary" onClick={markAll} isLoading={markAllRead.isPending}>
              {t("tenant.notifications.markAllRead", "Mark all read")}
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
