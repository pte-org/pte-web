"use client";

import { useMemo, useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage, type ChatUsageDayResponse } from "@pte/api-client";
import {
  Alert,
  Badge,
  DashboardCard,
  DataTable,
  DateRangePicker,
  PageHeader,
  TrendBarChart,
  useLocale,
  type DataTableColumn,
  type DateRangeValue,
  type TrendChartSeries,
} from "@pte/ui";
import { useChatUsage } from "../api";
import { CHAT_USAGE_COPY } from "../constants";
import { activeDays, chartRows, isSameRange, usagePresets, type UsagePresetKey } from "../utils/presentation";
import { defaultUsageRange, formatUsd, summarizeChatUsage } from "../utils/summarize";
import { ChatUsageSummaryCards } from "./_ChatUsageSummary";

const PRESET_COPY_KEY = {
  last7: "PRESET_LAST7",
  last30: "PRESET_LAST30",
  thisMonth: "PRESET_THIS_MONTH",
} as const satisfies Record<UsagePresetKey, string>;

const chipClass = (selected: boolean): string =>
  `rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
    selected
      ? "border-[var(--action)] bg-[var(--action)] text-white"
      : "border-[var(--shell-border)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]"
  }`;

export const ChatUsageView = (): ReactElement => {
  const { locale, t } = useLocale();
  const T = CHAT_USAGE_COPY[locale];
  const [range, setRange] = useState<DateRangeValue>(() => defaultUsageRange(new Date()));
  const [showAllDays, setShowAllDays] = useState(false);
  const usage = useChatUsage(range.from, range.to);
  const days = useMemo(() => usage.data ?? [], [usage.data]);
  const summary = useMemo(() => summarizeChatUsage(days), [days]);
  const rows = useMemo(() => (showAllDays ? days : activeDays(days)), [days, showAllDays]);
  const bars = useMemo(() => chartRows(days), [days]);
  const presets = useMemo(() => usagePresets(new Date()), []);
  const number = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");

  const series: TrendChartSeries[] = [
    { key: "ok", label: T.ANSWERED, tone: "success" },
    { key: "refused", label: T.REFUSED, tone: "warning" },
    { key: "failed", label: T.FAILED, tone: "danger" },
  ];

  // Refused and failed counts stand out; a zero stays plain so the eye finds the problems.
  const flagged = (count: number, variant: "warning" | "danger"): ReactElement | string =>
    count > 0 ? <Badge variant={variant}>{number.format(count)}</Badge> : number.format(count);

  const columns: DataTableColumn<ChatUsageDayResponse>[] = [
    { key: "date", header: T.DAY, cell: (day) => day.date },
    { key: "messages", header: T.MESSAGES, cell: (day) => number.format(day.messages) },
    { key: "ok", header: T.ANSWERED, cell: (day) => number.format(day.ok) },
    { key: "refused", header: T.REFUSED, cell: (day) => flagged(day.refused, "warning") },
    { key: "failed", header: T.FAILED, cell: (day) => flagged(day.failed, "danger") },
    { key: "cacheHits", header: T.FROM_CACHE, cell: (day) => number.format(day.cacheHits) },
    { key: "tokensIn", header: T.TOKENS_IN, cell: (day) => number.format(day.tokensIn) },
    {
      key: "tokensOut",
      header: T.TOKENS_OUT,
      cell: (day) => number.format(day.tokensOut + day.tokensThinking),
    },
    { key: "cost", header: T.COST, cell: (day) => formatUsd(day.estimatedCostUsd, locale) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={T.TITLE} />
      <p className="text-sm text-[var(--table-muted-text)]">{T.ESTIMATE_NOTE}</p>
      {usage.error && (
        <Alert tone="error">{getUserFacingApiErrorMessage(usage.error, T.LOAD_FAILED)}</Alert>
      )}
      <ChatUsageSummaryCards summary={summary} locale={locale} />
      <DashboardCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-auto sm:min-w-[220px]">
            <DateRangePicker
              id="chat-usage-date-filter"
              ariaLabel={t("common.filterDateRange", T.FILTER_DATE_RANGE)}
              value={range}
              onChange={setRange}
              placeholder={t("common.dateRange", T.DATE_RANGE)}
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label={T.DATE_RANGE}>
            {presets.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className={chipClass(isSameRange(range, preset))}
                aria-pressed={isSameRange(range, preset)}
                onClick={() => setRange({ from: preset.from, to: preset.to })}
              >
                {T[PRESET_COPY_KEY[preset.key]]}
              </button>
            ))}
          </div>
        </div>
      </DashboardCard>
      <DashboardCard>
        <h2 className="mb-3 text-base font-semibold">{T.CHART_TITLE}</h2>
        <TrendBarChart
          data={bars}
          series={series}
          stacked
          ariaLabel={T.CHART_ARIA}
          emptyLabel={T.CHART_EMPTY}
          valueFormatter={(value) => number.format(value)}
        />
      </DashboardCard>
      <div className="flex justify-end">
        <button
          type="button"
          className={chipClass(showAllDays)}
          aria-pressed={showAllDays}
          onClick={() => setShowAllDays((value) => !value)}
        >
          {showAllDays ? T.SHOW_ACTIVE_DAYS : T.SHOW_ALL_DAYS}
        </button>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(day) => day.date}
        isLoading={usage.isLoading}
        emptyTitle={T.EMPTY}
        emptyDescription={T.EMPTY_DESCRIPTION}
        clientSideFiltering={false}
        clientSidePagination={false}
      />
    </div>
  );
};
