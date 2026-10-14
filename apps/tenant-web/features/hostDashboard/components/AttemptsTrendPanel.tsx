"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { TrendBarChart, type TrendChartSeries } from "@pte/ui";
import { ATTEMPTS_SERIES_KEY } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { buildAttemptsChartData } from "../utils/charts";
import { formatNumber } from "../utils/format";
import { SectionPanel } from "./SectionPanel";

interface AttemptsTrendPanelProps {
  section: HostDashboardResponse["attempts"];
  onRetry: () => void;
  className?: string;
}

/** 12 calendar months of submitted attempts; the month in progress is drawn lighter and labelled. */
export const AttemptsTrendPanel = ({ section, onRetry, className }: AttemptsTrendPanelProps): ReactElement | null => {
  const { locale, messages } = useHostDashboardText();
  const series: TrendChartSeries[] = [{ key: ATTEMPTS_SERIES_KEY, label: messages.trendSeries, tone: "brand" }];

  return (
    <SectionPanel
      title={messages.trendTitle}
      subtitle={messages.trendSubtitle}
      section={section}
      onRetry={onRetry}
      className={className}
    >
      {(data) => (
        <TrendBarChart
          data={buildAttemptsChartData(data.monthlySubmitted, locale)}
          series={series}
          ariaLabel={messages.trendAria}
          emptyLabel={messages.trendEmpty}
          partialLabel={messages.trendPartial}
          valueFormatter={(value) => formatNumber(value, locale)}
        />
      )}
    </SectionPanel>
  );
};
