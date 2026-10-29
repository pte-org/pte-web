"use client";

import { useMemo, useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage, type ChatUsageDayResponse } from "@pte/api-client";
import {
  Alert,
  DashboardCard,
  DataTable,
  DateRangePicker,
  PageHeader,
  useLocale,
  type DataTableColumn,
  type DateRangeValue,
} from "@pte/ui";
import { useChatUsage } from "../api";
import { CHAT_USAGE_COPY } from "../constants";
import { defaultUsageRange, formatUsd, summarizeChatUsage } from "../utils/summarize";
import { ChatUsageSummaryCards } from "./_ChatUsageSummary";

export const ChatUsageView = (): ReactElement => {
  const { locale, t } = useLocale();
  const T = CHAT_USAGE_COPY[locale];
  const [range, setRange] = useState<DateRangeValue>(() => defaultUsageRange(new Date()));
  const usage = useChatUsage(range.from, range.to);
  const days = useMemo(() => usage.data ?? [], [usage.data]);
  const summary = useMemo(() => summarizeChatUsage(days), [days]);
  const number = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");

  const columns: DataTableColumn<ChatUsageDayResponse>[] = [
    { key: "date", header: T.DAY, cell: (day) => day.date },
    { key: "messages", header: T.MESSAGES, cell: (day) => number.format(day.messages) },
    { key: "ok", header: T.ANSWERED, cell: (day) => number.format(day.ok) },
    { key: "refused", header: T.REFUSED, cell: (day) => number.format(day.refused) },
    { key: "failed", header: T.FAILED, cell: (day) => number.format(day.failed) },
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
        <div className="w-full sm:w-auto sm:min-w-[220px]">
          <DateRangePicker
            id="chat-usage-date-filter"
            ariaLabel={t("common.filterDateRange", T.FILTER_DATE_RANGE)}
            value={range}
            onChange={setRange}
            placeholder={t("common.dateRange", T.DATE_RANGE)}
          />
        </div>
      </DashboardCard>
      <DataTable
        columns={columns}
        rows={days}
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
