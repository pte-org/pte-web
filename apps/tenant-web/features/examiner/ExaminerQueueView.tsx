"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ExaminerQueueItemResponse, ExaminerQueueStatus } from "@pte/api-client";
import { Button, ErrorState, type DateRangeValue } from "@pte/ui";
import { useExaminerQueue } from "./api";
import { buildExaminerQueueHref, parseExaminerQueueStatus } from "./constants";
import { useExaminerWorkspaceText, type ExaminerWorkspaceText } from "./hooks/useExaminerWorkspaceText";
import { useDebouncedSearch } from "../search/useDebouncedSearch";
import { ExaminerQueueFilters } from "./components/ExaminerQueueFilters";
import { ExaminerQueueTable } from "./components/ExaminerQueueTable";

function parseDateQuery(value: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? value
    : "";
}

function toQueueBoundary(value: string, endExclusive: boolean): string | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined;
  }
  if (endExclusive) date.setDate(date.getDate() + 1);
  return date.toISOString();
}

function getStatusOptions(text: ExaminerWorkspaceText): Array<{ value: ExaminerQueueStatus; label: string }> {
  return [
    { value: "ALL", label: text.statusAll },
    { value: "PENDING", label: text.statusPending },
    { value: "IN_PROGRESS", label: text.statusInProgress },
    { value: "COMPLETED", label: text.statusCompleted },
  ];
}

function getSortOptions(text: ExaminerWorkspaceText): Array<{ value: string; label: string }> {
  return [
    { value: "ASSIGNED_ASC", label: text.sortAssignedAsc },
    { value: "ASSIGNED_DESC", label: text.sortAssignedDesc },
  ];
}

export const ExaminerQueueView = (): ReactElement => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const text = useExaminerWorkspaceText();
  const status = parseExaminerQueueStatus(searchParams?.get("status"));
  const rawPage = parseInt(searchParams?.get("page") ?? "0", 10);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const searchParam = searchParams?.get("search") ?? "";
  const sortParam = searchParams?.get("sort") ?? "ASSIGNED_ASC";
  const fromDate = parseDateQuery(searchParams?.get("fromDate") ?? null);
  const toDate = parseDateQuery(searchParams?.get("toDate") ?? null);
  const [startingAttemptId, setStartingAttemptId] = useState<string | null>(null);
  const search = searchParam;
  const debouncedSearch = useDebouncedSearch(search);
  const queueFromDate = toQueueBoundary(fromDate, false);
  const queueToDate = toQueueBoundary(toDate, true);

  const updateUrl = useCallback(
    (
      nextStatus: ExaminerQueueStatus,
      nextPage: number,
      nextSearch: string,
      nextSort: string,
      nextFromDate = fromDate,
      nextToDate = toDate,
    ): void => {
      router.replace(
        buildExaminerQueueHref(
          nextStatus,
          nextPage,
          nextSearch,
          nextSort,
          nextFromDate,
          nextToDate,
        ),
      );
    },
    [fromDate, router, toDate],
  );

  const queue = useExaminerQueue({
    status,
    page,
    size: 20,
    search: debouncedSearch || undefined,
    sort: sortParam,
    fromDate: queueFromDate,
    toDate: queueToDate,
  });
  const totalItems = queue.data?.totalItems ?? queue.data?.items?.length ?? 0;
  const totalPages = Math.max(queue.data?.totalPages ?? 1, 1);
  const currentPage = queue.data?.page ?? page;

  useEffect(() => {
    if (queue.data && totalItems > 0 && page >= totalPages) {
      updateUrl(status, Math.max(0, totalPages - 1), search, sortParam, fromDate, toDate);
    }
  }, [fromDate, page, queue.data, search, sortParam, status, toDate, totalItems, totalPages, updateUrl]);

  const filters = (
    <ExaminerQueueFilters
      status={status}
      sort={sortParam}
      dateRange={{ from: fromDate, to: toDate }}
      statusOptions={getStatusOptions(text)}
      sortOptions={getSortOptions(text)}
      text={text}
      onStatusChange={(nextStatus) => updateUrl(nextStatus, 0, search, sortParam)}
      onSortChange={(nextSort) => updateUrl(status, 0, search, nextSort)}
      onDateRangeChange={(range: DateRangeValue) =>
        updateUrl(status, 0, search, sortParam, range.from, range.to)
      }
    />
  );

  const openAttempt = useCallback(
    (item: ExaminerQueueItemResponse): void => {
      router.push(
        `/examiner/work/${item.sessionPublicId}/${item.attemptPublicId}?fromStatus=${status}&fromPage=${page}`,
      );
    },
    [page, router, status],
  );

  const startAttempt = useCallback(
    async (item: ExaminerQueueItemResponse): Promise<void> => {
      try {
        setStartingAttemptId(item.attemptPublicId);
        const { startExaminerWork } = await import("@pte/api-client");
        const { apiClient } = await import("@/lib/apiClient");
        await startExaminerWork(apiClient, item.sessionPublicId, item.attemptPublicId, {
          requestPublicId: crypto.randomUUID(),
          expectedWorkVersion: 0,
        });
      } catch {
        // Opening the work item still lets the Examiner retry or reconcile the start command.
      } finally {
        setStartingAttemptId(null);
        openAttempt(item);
      }
    },
    [openAttempt],
  );

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      {queue.isError ? (
        <ErrorState
          title={text.queueError}
          action={
            <Button type="button" variant="secondary" size="sm" onClick={() => void queue.refetch()}>
              {text.retry}
            </Button>
          }
        />
      ) : (
        <ExaminerQueueTable
          items={queue.data?.items ?? []}
          text={text}
          isLoading={queue.isLoading}
          isFetching={queue.isFetching}
          emptyTitle={text.emptyQueue}
          search={search}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          startingAttemptId={startingAttemptId}
          filters={filters}
          onSearchChange={(value) => {
            updateUrl(status, 0, value, sortParam);
          }}
          onStart={(item) => void startAttempt(item)}
          onOpen={openAttempt}
          onPageChange={(nextPage) => updateUrl(status, nextPage, search, sortParam)}
        />
      )}
    </div>
  );
};
