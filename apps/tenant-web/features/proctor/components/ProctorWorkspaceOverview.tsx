"use client";

import type { ReactElement } from "react";
import type { ProctorOverviewCounts, ProctorScope } from "@pte/api-client";
import { Button, DashboardCard, ErrorState, Skeleton } from "@pte/ui";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";

interface ProctorWorkspaceOverviewProps {
  counts?: ProctorOverviewCounts;
  asOf?: string;
  timezone?: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedScope: ProctorScope;
  onSelectScope: (scope: ProctorScope) => void;
}

export const ProctorWorkspaceOverview = ({
  counts,
  asOf,
  timezone,
  isLoading,
  isError,
  onRetry,
  selectedScope,
  onSelectScope,
}: ProctorWorkspaceOverviewProps): ReactElement => {
  const text = useProctorWorkspaceText();
  if (isError)
    return (
      <ErrorState
        title={text.overviewError}
        action={
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {text.retry}
          </Button>
        }
      />
    );

  const summaries: { scope: ProctorScope; title: string; count?: number }[] = [
    {
      scope: "ACCESSIBLE",
      title: text.cardAccessibleTitle,
      count: counts?.accessible ?? counts?.accessibleCount,
    },
    {
      scope: "UPCOMING",
      title: text.cardUpcomingTitle,
      count: counts?.upcoming ?? counts?.upcomingCount,
    },
    { scope: "TODAY", title: text.cardTodayTitle, count: counts?.today ?? counts?.todayCount },
  ];
  const updated = asOf
    ? new Intl.DateTimeFormat(text.locale === "vi" ? "vi-VN" : "en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(asOf))
    : null;

  return (
    <div className="space-y-3">
      <DashboardCard>
        <div className="grid gap-2 sm:grid-cols-3 sm:gap-6">
          {summaries.map((summary) => (
            <button
              key={summary.scope}
              type="button"
              aria-pressed={selectedScope === summary.scope}
              onClick={() => onSelectScope(summary.scope)}
              className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--action)]"
            >
              {isLoading ? (
                <Skeleton className="h-8 w-8" />
              ) : (
                <span className="text-2xl font-semibold tabular-nums text-[var(--ink-primary)]">
                  {summary.count ?? 0}
                </span>
              )}
              <span className="text-sm text-[var(--ink-secondary)]">{summary.title}</span>
            </button>
          ))}
        </div>
      </DashboardCard>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 text-xs text-[var(--ink-muted)]">
        <span>{text.overlapExplanation}</span>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {updated && (
            <span>
              {text.asOfLabel}: {updated}
            </span>
          )}
          {timezone && (
            <span>
              {text.timezoneLabel}: {timezone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
