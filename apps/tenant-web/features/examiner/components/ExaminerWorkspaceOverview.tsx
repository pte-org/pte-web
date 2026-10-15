"use client";

import type { ReactElement } from "react";
import type {
  ExaminerOverviewCounts,
  ExaminerOverviewProgress,
  ExaminerQueueStatus,
} from "@pte/api-client";
import { Button, ErrorState, ProgressBar, Skeleton } from "@pte/ui";
import { useExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";

export interface ExaminerWorkspaceOverviewProps {
  counts?: ExaminerOverviewCounts;
  progress?: ExaminerOverviewProgress;
  asOf?: string;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  selectedStatus: ExaminerQueueStatus;
  onSelectStatus: (status: ExaminerQueueStatus) => void;
  onRefresh?: () => void;
}

export function ExaminerWorkspaceOverview({
  counts,
  progress,
  asOf,
  isLoading,
  isError,
  error,
  onRetry,
  selectedStatus,
  onSelectStatus,
  onRefresh,
}: ExaminerWorkspaceOverviewProps): ReactElement {
  const text = useExaminerWorkspaceText();

  const formattedAsOf = asOf
    ? new Intl.DateTimeFormat(text.locale === "vi" ? "vi-VN" : "en-US", {
        timeStyle: "medium",
        dateStyle: "short",
      }).format(new Date(asOf))
    : null;

  if (isError) {
    return (
      <ErrorState
        title={text.overviewError}
        description={error instanceof Error ? error.message : undefined}
        action={
          onRetry ? (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {text.retry}
            </Button>
          ) : undefined
        }
      />
    );
  }

  const cards: Array<{
    status: Exclude<ExaminerQueueStatus, "ALL">;
    title: string;
    count: number | undefined;
    description: string;
    borderActiveClass: string;
    accentClass: string;
  }> = [
    {
      status: "PENDING",
      title: text.cardPendingTitle,
      count: counts?.pending ?? counts?.unstartedCount,
      description: text.cardPendingDescription,
      borderActiveClass: "border-slate-800 bg-slate-50/50 ring-1 ring-slate-800",
      accentClass: "text-slate-800",
    },
    {
      status: "IN_PROGRESS",
      title: text.cardInProgressTitle,
      count: counts?.inProgress ?? counts?.inProgressCount,
      description: text.cardInProgressDescription,
      borderActiveClass: "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500",
      accentClass: "text-amber-700",
    },
    {
      status: "COMPLETED",
      title: text.cardCompletedTitle,
      count: counts?.completed ?? counts?.finalizedCount,
      description: text.cardCompletedDescription,
      borderActiveClass: "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500",
      accentClass: "text-emerald-700",
    },
  ];

  const totalUnits = progress?.eligibleAnswerTotal ?? progress?.totalUnits ?? 0;
  const completedUnits = progress?.finalizedAnswerTotal ?? progress?.completedUnits ?? 0;
  const percentComplete = totalUnits > 0 ? Math.min(100, Math.max(0, (completedUnits / totalUnits) * 100)) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* 3 Progress Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const isSelected = selectedStatus === c.status;
          return (
            <button
              key={c.status}
              type="button"
              onClick={() => onSelectStatus(c.status)}
              className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-all hover:border-slate-400 hover:shadow-sm ${
                isSelected ? c.borderActiveClass : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {c.title}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  {isLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <span className={`text-3xl font-bold tracking-tight ${c.accentClass}`}>
                      {c.count ?? 0}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">{c.description}</p>
            </button>
          );
        })}
      </div>

      {/* Overall Progress Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{text.progressTitle}</h4>
            <p className="text-xs text-slate-500">{text.progressSubtitle}</p>
          </div>
          <div className="text-xs font-medium text-slate-700">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : totalUnits === 0 ? (
              <span>{text.progressNoUnits}</span>
            ) : (
              <span>
                {text.format("progressUnits", {
                  completed: completedUnits,
                  total: totalUnits,
                  percent: Math.round(percentComplete),
                })}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <Skeleton className="h-2 w-full" />
          ) : (
            <ProgressBar
              value={totalUnits > 0 ? completedUnits : 0}
              max={totalUnits > 0 ? totalUnits : 1}
              tone="success"
            />
          )}
        </div>

        <p className="mt-2 text-[11px] text-slate-400">{text.progressNote}</p>
      </div>

      {/* Metadata bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <div>
          {formattedAsOf && (
            <span>
              {text.asOfLabel}: <span className="font-medium text-slate-700">{formattedAsOf}</span>
            </span>
          )}
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="font-medium text-blue-600 underline hover:text-blue-800"
          >
            {text.refresh}
          </button>
        )}
      </div>
    </div>
  );
}
