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
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationCenter,
  useNotificationHistory,
} from "../api";

const CATEGORY_OPTIONS = [
  { label: "All categories", value: "" },
  { label: "System notice", value: "SYSTEM_NOTICE" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Session", value: "SESSION" },
  { label: "Application", value: "APPLICATION" },
  { label: "Billing", value: "BILLING" },
];

function targetHref(item: InboxItemResponse): string {
  if (item.targetType === "APPLICATION") return `/admin/applications/${item.targetPublicId}`;
  return `/admin/notifications/${item.publicId}`;
}

function NotificationHistoryContent(): ReactElement {
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
        title="Notifications"
        subtitle="Platform and account updates for the signed-in administrator."
        actions={
          <>
            <Select
              id="notification-filter"
              aria-label="Notification filter"
              options={[
                { label: "All notifications", value: "ALL" },
                { label: "Unread only", value: "UNREAD" },
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
              aria-label="Notification category"
              options={CATEGORY_OPTIONS}
              value={category ?? ""}
              onChange={(event) => {
                setCategory((event.target.value || undefined) as InboxCategory | undefined);
                setPage(0);
                setSnapshot(null);
              }}
            />
            <Button variant="secondary" onClick={markAll} isLoading={markAllRead.isPending}>
              Mark all read
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
