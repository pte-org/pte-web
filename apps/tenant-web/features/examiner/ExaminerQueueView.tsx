"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ExaminerQueueItemResponse, ExaminerQueueStatus } from "@pte/api-client";
import { Badge, Button, PageHeader, Pagination, Select } from "@pte/ui";
import { EXAMINER_QUEUE_STATUSES, EXAMINER_WORK_TEXT as T } from "./constants";
import { useExaminerQueue } from "./api";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function shortId(value: string): string {
  return value.slice(0, 8).toUpperCase();
}

function statusBadge(status: ExaminerQueueItemResponse["status"]): ReactElement {
  if (status === "PENDING") {
    return <Badge variant="neutral">{T.STATUS_PENDING}</Badge>;
  }
  if (status === "IN_PROGRESS") {
    return <Badge variant="warning">{T.STATUS_IN_PROGRESS}</Badge>;
  }
  return <Badge variant="success">{T.STATUS_COMPLETED}</Badge>;
}

const QueueItemCard = ({
  item,
  onOpen,
}: {
  item: ExaminerQueueItemResponse;
  onOpen: (sessionPublicId: string, attemptPublicId: string) => void;
}): ReactElement => (
  <li className="flex flex-col gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <p className="font-medium text-slate-900">
        {T.ATTEMPT_LABEL} #{shortId(item.attemptPublicId)}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {T.SESSION_LABEL} #{shortId(item.sessionPublicId)} · {T.PROGRESS_LABEL}:{" "}
        {item.submittedAnswerCount}/{item.eligibleAnswerCount}
      </p>
      <p className="mt-1 text-xs text-slate-500">Assigned {formatDate(item.assignedAt)}</p>
    </div>
    <div className="flex items-center gap-3">
      {statusBadge(item.status)}
      <Button
        variant="primary"
        size="sm"
        onClick={() => onOpen(item.sessionPublicId, item.attemptPublicId)}
      >
        {T.OPEN_ATTEMPT}
      </Button>
    </div>
  </li>
);

export const ExaminerQueueView = (): ReactElement => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStatus = (searchParams?.get("status") as ExaminerQueueStatus) || null;
  const urlPage = searchParams?.get("page") ?? null;

  const [status, setStatus] = useState<ExaminerQueueStatus>(urlStatus ?? "PENDING");
  const [page, setPage] = useState<number>(urlPage ? Math.max(0, parseInt(urlPage, 10) || 0) : 0);

  useEffect(() => {
    if (urlStatus && urlStatus !== status) {
      setStatus(urlStatus);
    }
    if (urlPage !== null && urlPage !== undefined) {
      const parsed = Math.max(0, parseInt(urlPage, 10) || 0);
      if (parsed !== page) {
        setPage(parsed);
      }
    }
  }, [urlStatus, urlPage]);

  const queue = useExaminerQueue(status, page);
  const queuePage = queue.data?.page ?? page;
  const queueTotalItems = queue.data?.totalItems ?? queue.data?.items.length ?? 0;
  const queueTotalPages = Math.max(queue.data?.totalPages ?? 1, 1);

  const updateUrl = (nextStatus: ExaminerQueueStatus, nextPage: number): void => {
    const params = new URLSearchParams();
    params.set("status", nextStatus);
    params.set("page", String(nextPage));
    router.replace(`/examiner/work?${params.toString()}`);
  };

  const chooseStatus = (next: ExaminerQueueStatus): void => {
    setStatus(next);
    setPage(0);
    updateUrl(next, 0);
  };

  const choosePage = (nextPage: number): void => {
    setPage(nextPage);
    updateUrl(status, nextPage);
  };

  const handleOpenAttempt = (sessionPublicId: string, attemptPublicId: string): void => {
    router.push(
      `/examiner/work/${sessionPublicId}/${attemptPublicId}?fromStatus=${status}&fromPage=${page}`,
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-5 sm:p-8">
      <PageHeader title={T.TITLE} />
      <div className="mt-6 flex flex-col gap-2 sm:max-w-xs">
        <label htmlFor="examiner-queue-status" className="text-sm font-medium text-slate-700">
          {T.FILTER_LABEL}
        </label>
        <Select
          id="examiner-queue-status"
          value={status}
          onChange={(event) => chooseStatus(event.target.value as ExaminerQueueStatus)}
          options={EXAMINER_QUEUE_STATUSES}
        />
      </div>

      <section className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {queue.isLoading ? (
          <p className="p-5 text-sm text-slate-600">{T.LOADING_QUEUE}</p>
        ) : queue.isError ? (
          <div className="p-5 text-sm text-red-800" role="alert">
            {T.QUEUE_ERROR}{" "}
            <button
              type="button"
              onClick={() => void queue.refetch()}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : queue.data?.items.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">{T.EMPTY_QUEUE}</p>
        ) : (
          <>
            <ul>
              {queue.data?.items.map((item) => (
                <QueueItemCard
                  key={`${item.sessionPublicId}:${item.attemptPublicId}`}
                  item={item}
                  onOpen={handleOpenAttempt}
                />
              ))}
            </ul>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span className="tabular-nums">Total {queueTotalItems} records</span>
              <Pagination
                currentPage={queuePage + 1}
                totalPages={queueTotalPages}
                onPageChange={(nextPage) => choosePage(nextPage - 1)}
                sideLayout="icon"
                grouped
                className="!mx-0 !w-auto !justify-end gap-1"
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
};
