"use client";

import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ExaminerQueueItemResponse, ExaminerQueueStatus } from "@pte/api-client";
import { Badge, Button, Input, PageHeader, Pagination, Select } from "@pte/ui";
import { useExaminerQueue, useStartExaminerWork } from "./api";
import { EXAMINER_WORK_TEXT as T, parseExaminerQueueStatus } from "./constants";
import { useExaminerWorkspaceText } from "./hooks/useExaminerWorkspaceText";

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function shortId(value: string): string {
  return value.slice(0, 8).toUpperCase();
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

  const [searchInput, setSearchInput] = useState(searchParam);
  const [startingAttemptId, setStartingAttemptId] = useState<string | null>(null);

  const queue = useExaminerQueue({
    status,
    page,
    size: 20,
    search: searchParam || undefined,
    sort: sortParam,
  });

  const queuePage = queue.data?.page ?? page;
  const queueTotalItems = queue.data?.totalItems ?? queue.data?.items?.length ?? 0;
  const queueTotalPages = Math.max(queue.data?.totalPages ?? 1, 1);

  const updateUrl = useCallback(
    (nextStatus: ExaminerQueueStatus, nextPage: number, nextSearch: string, nextSort: string): void => {
      const params = new URLSearchParams();
      if (nextStatus !== "ALL") params.set("status", nextStatus);
      if (nextPage > 0) params.set("page", String(nextPage));
      if (nextSearch.trim()) params.set("search", nextSearch.trim());
      if (nextSort && nextSort !== "ASSIGNED_ASC") params.set("sort", nextSort);
      const qs = params.toString();
      router.replace(qs ? `/examiner/work?${qs}` : "/examiner/work?status=ALL");
    },
    [router],
  );

  useEffect(() => {
    if (queue.data && queueTotalItems > 0 && page >= queueTotalPages) {
      updateUrl(status, Math.max(0, queueTotalPages - 1), searchParam, sortParam);
    }
  }, [page, queue.data, queueTotalItems, queueTotalPages, status, searchParam, sortParam, updateUrl]);

  const chooseStatus = useCallback(
    (next: ExaminerQueueStatus): void => {
      updateUrl(next, 0, searchParam, sortParam);
    },
    [searchParam, sortParam, updateUrl],
  );

  const choosePage = useCallback(
    (nextPage: number): void => {
      updateUrl(status, nextPage, searchParam, sortParam);
    },
    [searchParam, sortParam, status, updateUrl],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(status, 0, searchInput, sortParam);
  };

  const chooseSort = (nextSort: string) => {
    updateUrl(status, 0, searchParam, nextSort);
  };

  const handleOpenAttempt = useCallback(
    (sessionPublicId: string, attemptPublicId: string): void => {
      router.push(
        `/examiner/work/${sessionPublicId}/${attemptPublicId}?fromStatus=${status}&fromPage=${page}`,
      );
    },
    [page, router, status],
  );

  const handleStartAttempt = async (sessionPublicId: string, attemptPublicId: string) => {
    try {
      setStartingAttemptId(attemptPublicId);
      const { startExaminerWork } = await import("@pte/api-client");
      const { apiClient } = await import("@/lib/apiClient");
      await startExaminerWork(apiClient, sessionPublicId, attemptPublicId, {
        requestPublicId: crypto.randomUUID(),
        expectedWorkVersion: 0,
      });
      handleOpenAttempt(sessionPublicId, attemptPublicId);
    } catch {
      handleOpenAttempt(sessionPublicId, attemptPublicId);
    } finally {
      setStartingAttemptId(null);
    }
  };

  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: text.statusAll },
      { value: "PENDING", label: text.statusPending },
      { value: "IN_PROGRESS", label: text.statusInProgress },
      { value: "COMPLETED", label: text.statusCompleted },
    ],
    [text],
  );

  const sortOptions = useMemo(
    () => [
      { value: "ASSIGNED_ASC", label: T.SORT_ASSIGNED_ASC },
      { value: "ASSIGNED_DESC", label: T.SORT_ASSIGNED_DESC },
    ],
    [],
  );

  const getBlockingText = (reason: string | null | undefined): string => {
    if (!reason) return "";
    if (reason === "WAITING_FOR_HOST_FREEZE") return text.waitingForHostFreeze;
    return `${text.blockedReasonPrefix}${reason}`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-5 sm:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader title={text.title} />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push("/examiner/work")}
        >
          {T.BACK_TO_OVERVIEW}
        </Button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-48">
            <label htmlFor="examiner-queue-status" className="block text-xs font-medium text-slate-700 mb-1">
              {text.filterLabel}
            </label>
            <Select
              id="examiner-queue-status"
              value={status}
              onChange={(e) => chooseStatus(e.target.value as ExaminerQueueStatus)}
              options={statusOptions}
            />
          </div>

          <div className="w-48">
            <label htmlFor="examiner-queue-sort" className="block text-xs font-medium text-slate-700 mb-1">
              {T.SORT_LABEL}
            </label>
            <Select
              id="examiner-queue-sort"
              value={sortParam}
              onChange={(e) => chooseSort(e.target.value)}
              options={sortOptions}
            />
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={T.SEARCH_PLACEHOLDER}
            className="w-64"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {queue.isLoading ? (
          <p className="p-5 text-sm text-slate-600">{text.loadingQueue}</p>
        ) : queue.isError ? (
          <div
            className="m-4 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between text-red-800"
            role="alert"
          >
            <div>
              <p className="font-semibold text-sm">{text.queueError}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={queue.isFetching}
              onClick={() => void queue.refetch()}
            >
              {text.retry}
            </Button>
          </div>
        ) : !queue.data || queue.data.items?.length === 0 ? (
          <p className="p-5 text-sm text-slate-600">{text.emptyQueue}</p>
        ) : (
          <>
            <ul className="divide-y divide-slate-100">
              {queue.data?.items?.map((item: ExaminerQueueItemResponse) => {
                const isZeroEligible = item.eligibleAnswerCount === 0;
                const blockingLabel = getBlockingText(item.blockingReason);
                const isStarting = startingAttemptId === item.attemptPublicId;

                return (
                  <li
                    key={`${item.sessionPublicId}:${item.attemptPublicId}`}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {text.attemptLabel} #{shortId(item.attemptPublicId)}
                        </p>
                        {item.status === "PENDING" ? (
                          <Badge variant="neutral">{text.statusPending}</Badge>
                        ) : item.status === "IN_PROGRESS" ? (
                          <Badge variant="warning">{text.statusInProgress}</Badge>
                        ) : (
                          <Badge variant="success">{text.statusCompleted}</Badge>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {text.sessionLabel} #{shortId(item.sessionPublicId)} · {text.progressLabel}:{" "}
                        {item.submittedAnswerCount}/{item.eligibleAnswerCount}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                        <span>
                          {text.assignedAt} {formatDate(item.assignedAt, text.locale)}
                        </span>
                        {isZeroEligible && (
                          <span className="text-slate-400 italic">{text.noEligibleWork}</span>
                        )}
                        {blockingLabel && (
                          <span className="text-amber-700 font-medium">{blockingLabel}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isZeroEligible ? (
                        item.status === "PENDING" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isStarting}
                            onClick={() => handleStartAttempt(item.sessionPublicId, item.attemptPublicId)}
                          >
                            {isStarting ? T.STARTING_WORK : T.START_WORK}
                          </Button>
                        ) : item.status === "IN_PROGRESS" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenAttempt(item.sessionPublicId, item.attemptPublicId)}
                          >
                            {T.RESUME_WORK}
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenAttempt(item.sessionPublicId, item.attemptPublicId)}
                          >
                            {T.VIEW_WORK}
                          </Button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400">{text.noEligibleWork}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span className="tabular-nums">
                {text.format("totalRecords", { total: queueTotalItems })}
              </span>
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
