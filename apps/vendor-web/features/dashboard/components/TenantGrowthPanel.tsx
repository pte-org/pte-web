"use client";

import type { ReactElement } from "react";
import type { AdminDashboardResponse } from "@pte/api-client";
import { TrendBarChart, type TrendChartSeries } from "@pte/ui";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { buildGrowthSeries, TENANT_GROWTH_SERIES_KEY } from "../utils/charts";
import { formatNumber } from "../utils/format";
import { SectionPanel } from "./SectionPanel";

export interface TenantGrowthPanelProps {
  section: AdminDashboardResponse["tenants"];
  onRetry: () => void;
  className?: string;
}

export const TenantGrowthPanel = ({
  section,
  onRetry,
  className,
}: TenantGrowthPanelProps): ReactElement | null => {
  const { locale, messages } = useAdminDashboardText();
  const series: TrendChartSeries[] = [
    { key: TENANT_GROWTH_SERIES_KEY, label: messages.growthSeries, tone: "brand" },
  ];

  return (
    <SectionPanel
      title={messages.growthTitle}
      subtitle={messages.growthSubtitle}
      section={section}
      onRetry={onRetry}
      className={className}
    >
      {(data) => {
        const chartData = buildGrowthSeries(data.monthlyCreated, locale);
        return (
          <TrendBarChart
            data={chartData}
            series={series}
            ariaLabel={messages.growthAria}
            emptyLabel={messages.growthEmpty}
            partialLabel={messages.growthPartial}
            valueFormatter={(value) => formatNumber(value, locale)}
          />
        );
      }}
    </SectionPanel>
  );
};
