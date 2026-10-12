"use client";

import type { ReactElement } from "react";
import type { ProctorOverviewCounts, ProctorScope } from "@pte/api-client";
import { Button, Skeleton } from "@pte/ui";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";

export interface ProctorWorkspaceOverviewProps {
  counts?: ProctorOverviewCounts;
  asOf?: string;
  timezone?: string;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  selectedScope: ProctorScope;
  onSelectScope: (scope: ProctorScope) => void;
  onRefresh?: () => void;
}

export function ProctorWorkspaceOverview({
  counts,
  asOf,
  timezone,
  isLoading,
  isError,
  error,
  onRetry,
  selectedScope,
  onSelectScope,
  onRefresh,
}: ProctorWorkspaceOverviewProps): ReactElement {
  const text = useProctorWorkspaceText();

  const formattedAsOf = asOf
    ? new Intl.DateTimeFormat(text.locale === "vi" ? "vi-VN" : "en-US", {
        timeStyle: "medium",
        dateStyle: "short",
      }).format(new Date(asOf))
    : null;

  if (isError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-amber-900">{text.overviewError}</h4>
            <p className="text-xs text-amber-700">
              {error instanceof Error ? error.message : text.overviewError}
            </p>
          </div>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {text.retry}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const cards: Array<{
    scope: ProctorScope;
    title: string;
    count: number | undefined;
    description: string;
    borderActiveClass: string;
    accentClass: string;
  }> = [
    {
      scope: "ACCESSIBLE",
      title: text.cardAccessibleTitle,
      count: counts?.accessible ?? counts?.accessibleCount,
      description: text.cardAccessibleDescription,
      borderActiveClass: "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500",
      accentClass: "text-emerald-700",
    },
    {
      scope: "UPCOMING",
      title: text.cardUpcomingTitle,
      count: counts?.upcoming ?? counts?.upcomingCount,
      description: text.cardUpcomingDescription,
      borderActiveClass: "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500",
      accentClass: "text-blue-700",
    },
    {
      scope: "TODAY",
      title: text.cardTodayTitle,
      count: counts?.today ?? counts?.todayCount,
      description: text.cardTodayDescription,
      borderActiveClass: "border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500",
      accentClass: "text-indigo-700",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Cards Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const isSelected = selectedScope === c.scope;
          return (
            <button
              key={c.scope}
              type="button"
              onClick={() => onSelectScope(c.scope)}
              className={`flex flex-col justify-between rounded-xl border p-5 text-left transition-all hover:border-slate-400 hover:shadow-sm ${
                isSelected ? c.borderActiveClass : "border-slate-200 bg-white"
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

      {/* Meta context and overlap explanation */}
      <div className="flex flex-col justify-between gap-2 px-1 text-xs text-slate-500 sm:flex-row sm:items-center">
        <span>{text.overlapExplanation}</span>
        <div className="flex flex-wrap items-center gap-3">
          {timezone && (
            <span>
              {text.timezoneLabel}: <span className="font-mono text-slate-700">{timezone}</span>
            </span>
          )}
          {formattedAsOf && (
            <span>
              {text.asOfLabel}: <span className="font-medium text-slate-700">{formattedAsOf}</span>
            </span>
          )}
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
    </div>
  );
}
