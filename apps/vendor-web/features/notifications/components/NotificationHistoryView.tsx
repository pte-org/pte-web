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
  PageHeader,
  PaginationControls,
  Select,
  useToast,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationCenter,
  useNotificationHistory,
} from "../api";

function targetHref(item: InboxItemResponse): string {
  if (item.targetType === "APPLICATION") return `/admin/applications/${item.targetPublicId}`;
  if (item.targetType === "SUPPORT_TICKET") {
    return `/admin/support-tickets/${item.targetPublicId}`;
  }
  return `/admin/notifications/${item.publicId}`;
}

function NotificationHistoryContent(): ReactElement {
  const T = useAdminCopy({
    TITLE: "Notifications",
    FILTER_ARIA: "Notification filter",
    CATEGORY_ARIA: "Notification category",
    ALL_NOTIFICATIONS: "All notifications",
    UNREAD_ONLY: "Unread only",
    MARK_ALL_READ: "Mark all read",
  });
  const categoryOptions = useAdminCopy([
    { label: "All categories", value: "" },
    { label: "System notice", value: "SYSTEM_NOTICE" },
    { label: "Maintenance", value: "MAINTENANCE" },
    { label: "Session", value: "SESSION" },
    { label: "Application", value: "APPLICATION" },
    { label: "Billing", value: "BILLING" },
    { label: "Support", value: "SUPPORT" },
  ]);
  const router = useRouter();
  const { showToast } = useToast();
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
      <PageHeader
        title={T.TITLE}
        actions={
          <>
            <Select
              id="notification-filter"
              aria-label={T.FILTER_ARIA}
              options={[
                { label: T.ALL_NOTIFICATIONS, value: "ALL" },
                { label: T.UNREAD_ONLY, value: "UNREAD" },
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
              aria-label={T.CATEGORY_ARIA}
              options={categoryOptions}
              value={category ?? ""}
              onChange={(event) => {
                setCategory((event.target.value || undefined) as InboxCategory | undefined);
                setPage(0);
                setSnapshot(null);
              }}
            />
            <Button variant="secondary" onClick={markAll} isLoading={markAllRead.isPending}>
              {T.MARK_ALL_READ}
            </Button>
          </>
        }
      />
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
