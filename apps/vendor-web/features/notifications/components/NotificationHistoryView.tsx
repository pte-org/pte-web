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
  InboxItemModal,
  NotificationHistory,
  NotificationHistoryToolbar,
  PageHeader,
  PaginationControls,
  useLocale,
  useToast,
} from "@pte/ui";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationCenter,
  useNotificationHistory,
  DEFAULT_HISTORY_PAGE_SIZE,
} from "../api";
import { notificationTargetHref } from "../targetHref";

/** `onRead` lives with the caller: the list remounts when the read count changes, which would drop an open dialog. */
function NotificationHistoryContent({ onRead }: { onRead: (item: InboxItemResponse) => void }): ReactElement {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLocale();
  const [filter, setFilter] = useState<InboxReadFilter>("ALL");
  const [category, setCategory] = useState<InboxCategory | undefined>();
  const [page, setPage] = useState(0);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(DEFAULT_HISTORY_PAGE_SIZE);
  const history = useNotificationHistory(page, filter, category, snapshot, pageSize);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const selectItem = async (item: InboxItemResponse): Promise<void> => {
    try {
      if (item.readAt === null) await markRead.mutateAsync(item.publicId);
      const href = notificationTargetHref(item);
      if (href) router.push(href);
      else onRead(item);
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
        title={t("common.notifications", "Notifications")}
        actions={
          <Button variant="secondary" onClick={markAll} isLoading={markAllRead.isPending}>
            {t("common.markAllReadFull", "Mark all read")}
          </Button>
        }
      />
      {history.error && <Alert tone="error">{getUserFacingApiErrorMessage(history.error)}</Alert>}
      <NotificationHistory
        toolbar={
          <NotificationHistoryToolbar
            filter={filter}
            category={category}
            onFilterChange={(next) => {
              setFilter(next);
              setPage(0);
              setSnapshot(null);
            }}
            onCategoryChange={(next) => {
              setCategory(next);
              setPage(0);
              setSnapshot(null);
            }}
          />
        }
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
          showPageSizeInput
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
            setSnapshot(null);
          }}
        />
      )}
    </div>
  );
}

export function NotificationHistoryView(): ReactElement {
  const { unread } = useNotificationCenter();
  const [reading, setReading] = useState<InboxItemResponse | null>(null);
  return (
    <>
      <NotificationHistoryContent key={unread.data?.readRevision ?? "initial"} onRead={setReading} />
      <InboxItemModal item={reading} onClose={() => setReading(null)} />
    </>
  );
}
