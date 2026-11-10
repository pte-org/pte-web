"use client";

import { useMemo, useState, type ReactElement } from "react";
import {
  DashboardPanel,
  DateRangeFilter,
  EmptyState,
  calendarDate,
  lastDaysRange,
  standardDateRangePresets,
  useLocale,
  type DateRangeValue,
} from "@pte/ui";
import { useGenerationStats, useRecentGenerationJobs } from "../api";
import { AI_ADMIN_COPY, DEFAULT_STATS_WINDOW_DAYS } from "../constants";
import { OutcomeCards } from "./_OutcomeCards";
import { RecentJobs } from "./_RecentJobs";

/** How question generation went in a picked range: totals first, then the range filter, then the jobs. */
export const GenerationStatsView = (): ReactElement => {
  const { locale } = useLocale();
  const copy = AI_ADMIN_COPY[locale];
  const [range, setRange] = useState<DateRangeValue>(() => lastDaysRange(new Date(), DEFAULT_STATS_WINDOW_DAYS));
  const presets = useMemo(
    () =>
      standardDateRangePresets(new Date(), {
        last7: copy.PRESET_LAST7,
        last30: copy.PRESET_LAST30,
        thisMonth: copy.PRESET_THIS_MONTH,
      }),
    [copy],
  );
  const stats = useGenerationStats(range);
  const jobs = useRecentGenerationJobs();
  const hasResults = stats.data !== undefined && stats.data.saved + stats.data.failed > 0;
  const jobsInRange = (jobs.data?.data ?? []).filter((job) => {
    const day = calendarDate(new Date(job.createdAt));
    return day >= range.from && day <= range.to;
  });

  return (
    <div className="space-y-6">
      {stats.isError && (
        <DashboardPanel
          title={copy.GENERATION_TITLE}
          status="error"
          error={{
            title: copy.LOAD_ERROR_TITLE,
            retryLabel: copy.LOAD_ERROR_RETRY,
            onRetry: () => void stats.refetch(),
          }}
        />
      )}
      {stats.isLoading && <DashboardPanel title={copy.GENERATION_TITLE} status="loading" loadingLabel={copy.LOADING} />}
      {stats.data && !hasResults && (
        <EmptyState title={copy.NO_DATA_TITLE} description={copy.NO_DATA_DESCRIPTION} />
      )}
      {stats.data && hasResults && <OutcomeCards stats={stats.data} copy={copy} locale={locale} />}
      <DateRangeFilter
        id="ai-generation-date-filter"
        value={range}
        onChange={setRange}
        presets={presets}
        ariaLabel={copy.FILTER_DATE_RANGE}
        placeholder={copy.DATE_RANGE}
      />
      <RecentJobs
        jobs={jobsInRange}
        taskTypes={stats.data?.byTaskType.map((row) => row.taskType) ?? []}
        failures={stats.data?.failures ?? []}
        copy={copy}
        locale={locale}
      />
    </div>
  );
};
