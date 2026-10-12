"use client";

import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ExaminerQueueItemResponse, ExaminerQueueStatus } from "@pte/api-client";
import { Badge, Button, PageHeader, Pagination, Select } from "@pte/ui";
import { useExaminerOverview, useExaminerQueue } from "./api";
import { ExaminerPriorityWork } from "./components/ExaminerPriorityWork";
import { ExaminerWorkspaceOverview } from "./components/ExaminerWorkspaceOverview";
import { useExaminerWorkspaceText } from "./hooks/useExaminerWorkspaceText";

const VALID_STATUSES: ExaminerQueueStatus[] = ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"];

function parseStatus(val: string | null): ExaminerQueueStatus {
  if (val && VALID_STATUSES.includes(val as ExaminerQueueStatus)) {
    return val as ExaminerQueueStatus;
  }
  return "ALL";
}

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

  const status = parseStatus(searchParams?.get("status"));
  const rawPage = parseInt(searchParams?.get("page") ?? "0", 10);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;

  const overview = useExaminerOverview();
  const queue = useExaminerQueue(status, page);

  const queuePage = queue.data?.page ?? page;
  const queueTotalItems = queue.data?.totalItems ?? queue.data?.items.length ?? 0;
  const queueTotalPages = Math.max(queue.data?.totalPages ?? 1, 1);

  const updateUrl = useCallback(
    (nextStatus: ExaminerQueueStatus, nextPage: number): void => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (nextStatus === "ALL") {
        params.delete("status");
      } else {
        params.set("status", nextStatus);
      }
      if (nextPage === 0) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
      const qs = params.toString();
      router.replace(qs ? `/examiner/work?${qs}` : "/examiner/work");
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (queue.data && queueTotalItems > 0 && page >= queueTotalPages) {
      updateUrl(status, Math.max(0, queueTotalPages - 1));
    }
  }, [page, queue.data, queueTotalItems, queueTotalPages, status, updateUrl]);

  const chooseStatus = useCallback(
    (next: ExaminerQueueStatus): void => {
      updateUrl(next, 0);
    },
    [updateUrl],
  );

  const choosePage = useCallback(
    (nextPage: number): void => {
      updateUrl(status, nextPage);
    },
    [status, updateUrl],
  );

  const handleOpenAttempt = useCallback(
    (sessionPublicId: string, attemptPublicId: string): void => {
      router.push(
        `/examiner/work/${sessionPublicId}/${attemptPublicId}?fromStatus=${status}&fromPage=${page}`,
      );
    },
    [page, router, status],
  );

  const handleRefresh = useCallback(() => {
    void overview.refetch();
    void queue.refetch();
  }, [overview, queue]);

  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: text.statusAll },
      { value: "PENDING", label: text.statusPending },
      { value: "IN_PROGRESS", label: text.statusInProgress },
      { value: "COMPLETED", label: text.statusCompleted },
    ],
    [text],
  );

  const getBlockingText = (reason: string | null | undefined): string => {
    if (!reason) return "";
    if (reason === "WAITING_FOR_HOST_FREEZE") {
      return text.waitingForHostFreeze;
    }
    return `${text.blockedReasonPrefix}${reason}`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-5 sm:p-8 space-y-6">
      <PageHeader title={text.title} />

      {/* Overview Cards & Progress */}
      <ExaminerWorkspaceOverview
        counts={overview.data?.counts}
        progress={overview.data?.progress}
        asOf={overview.data?.asOf}
        isLoading={overview.isLoading}
        isError={overview.isError}
        error={overview.error}
        onRetry={() => void overview.refetch()}
        selectedStatus={status}
        onSelectStatus={(s) => chooseStatus(s)}
        onRefresh={handleRefresh}
      />

      {/* Priority Work Preview */}
      <ExaminerPriorityWork
        items={overview.data?.priorityItems ?? overview.data?.priorityQueue ?? []}
        isLoading={overview.isLoading}
        onOpenAttempt={handleOpenAttempt}
      />

      {/* Main Queue Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:max-w-xs">
          <label htmlFor="examiner-queue-status" className="text-sm font-medium text-slate-700">
            {text.filterLabel}
          </label>
          <Select
            id="examiner-queue-status"
            value={status}
            onChange={(event) => chooseStatus(event.target.value as ExaminerQueueStatus)}
            options={statusOptions}
          />
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {queue.isLoading ? (
            <p className="p-5 text-sm text-slate-600">{text.loadingQueue}</p>
          ) : queue.isError ? (
            <div className="p-5 text-sm text-red-800" role="alert">
              {text.queueError}{" "}
              <button
                type="button"
                onClick={() => void queue.refetch()}
                className="font-semibold underline"
              >
                {text.retry}
              </button>
            </div>
          ) : queue.data?.items.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">{text.emptyQueue}</p>
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {queue.data?.items.map((item: ExaminerQueueItemResponse) => {
                  const isZeroEligible = item.eligibleAnswerCount === 0;
                  const blockingLabel = getBlockingText(item.blockingReason);

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
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleOpenAttempt(item.sessionPublicId, item.attemptPublicId)
                            }
                          >
                            {text.openAttempt}
                          </Button>
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
    </div>
  );
};
