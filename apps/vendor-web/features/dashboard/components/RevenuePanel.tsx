"use client";

import type { ReactElement } from "react";
import type { AdminDashboardResponse } from "@pte/api-client";
import { TrendBarChart, type TrendChartSeries } from "@pte/ui";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { buildRevenueSeries, REVENUE_SERIES_KEY } from "../utils/charts";
import { formatCurrency, formatNumber, formatPercent } from "../utils/format";
import { SectionPanel } from "./SectionPanel";

export interface RevenuePanelProps {
  section: AdminDashboardResponse["revenue"];
  onRetry: () => void;
  className?: string;
}

export const RevenuePanel = ({
  section,
  onRetry,
  className,
}: RevenuePanelProps): ReactElement | null => {
  const { locale, messages, format } = useAdminDashboardText();

  const series: TrendChartSeries[] = [
    { key: REVENUE_SERIES_KEY, label: messages.revenueSeries, tone: "success" },
  ];

  return (
    <SectionPanel
      title={messages.revenueTitle}
      subtitle={messages.revenueSubtitle}
      section={section}
      onRetry={onRetry}
      className={className}
      emptyWhen={(data) =>
        data.currencies.length === 0 ? { title: messages.revenueEmpty } : null
      }
    >
      {(data) => (
        <div className="flex flex-col gap-6">
          <p className="text-xs text-[var(--ink-muted)]">{messages.revenueSourceNote}</p>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {data.currencies.map((curr) => {
              const chartData = buildRevenueSeries(curr.monthly, locale);
              const changeText =
                curr.changePct !== null
                  ? `${curr.changePct > 0 ? "+" : ""}${formatPercent(curr.changePct, locale)}`
                  : null;

              return (
                <div
                  key={curr.currency}
                  className="flex flex-col gap-3 rounded-lg border border-[var(--shell-border)] p-4"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                        {curr.currency}
                      </span>
                      <p className="text-xl font-bold tabular-nums text-[var(--ink-primary)]">
                        {formatCurrency(curr.current, curr.currency, locale)}
                      </p>
                    </div>
                    {changeText && (
                      <span className="text-xs font-semibold tabular-nums text-[var(--ink-secondary)]">
                        {changeText}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--ink-secondary)]">
                    {format("revenuePaidOrders", {
                      count: formatNumber(curr.paidOrders.current, locale),
                    })}
                  </p>

                  <div className="mt-2 h-44">
                    <TrendBarChart
                      data={chartData}
                      series={series}
                      ariaLabel={`${curr.currency} ${messages.revenueTitle}`}
                      emptyLabel={messages.revenueEmpty}
                      partialLabel={messages.growthPartial}
                      valueFormatter={(val) => formatCurrency(val, curr.currency, locale)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionPanel>
  );
};
