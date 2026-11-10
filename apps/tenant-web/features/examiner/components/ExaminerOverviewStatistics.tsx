"use client";

import { useState, type ReactElement } from "react";
import { Button, DateRangePicker, Disclosure, ErrorState, LoadingState, type DateRangeValue } from "@pte/ui";
import { useExaminerReports } from "../api";
import { useExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";
import { ExaminerReportRecentTable } from "./ExaminerReportRecentTable";
import { ExaminerReportBreakdownTable } from "./ExaminerReportBreakdownTable";

function toReportBoundary(value: string, endOfDay: boolean): string | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export const ExaminerOverviewStatistics = (): ReactElement => {
  const text = useExaminerWorkspaceText();
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "", to: "" });
  const reports = useExaminerReports({
    fromDate: toReportBoundary(dateRange.from, false),
    toDate: toReportBoundary(dateRange.to, true),
  });

  return (
    <section className="min-w-0 space-y-4" aria-label={text.reportsTitle}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">{text.reportsTitle}</h2>
        <DateRangePicker
          ariaLabel={text.statisticsDateRange}
          placeholder={text.statisticsDateRange}
          fromLabel={text.filterDateFrom}
          toLabel={text.filterDateTo}
          value={dateRange}
          onChange={setDateRange}
          variant="table"
        />
      </div>
      {reports.isLoading ? (
        <LoadingState variant="table" label={text.loadingReports} />
      ) : reports.isError ? (
        <ErrorState title={text.reportsError} action={
          <Button variant="secondary" size="sm" onClick={() => void reports.refetch()}>{text.retry}</Button>
        } />
      ) : (
        <div className="min-w-0 space-y-6" aria-busy={reports.isFetching}>
          <ExaminerReportRecentTable recentItems={reports.data?.recentFinalizedItems ?? []} />
          <Disclosure title={text.breakdownTitle}>
            <div className="mt-3">
              <ExaminerReportBreakdownTable breakdown={reports.data?.taskTypeBreakdowns ?? []} />
            </div>
          </Disclosure>
        </div>
      )}
    </section>
  );
};
