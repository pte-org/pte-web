import type { ReactElement } from "react";
import { DashboardCard } from "@pte/ui";
import { CHAT_USAGE_COPY } from "../constants";
import type { ChatUsageSummary } from "../utils/summarize";
import { formatUsd } from "../utils/summarize";

interface ChatUsageSummaryProps {
  summary: ChatUsageSummary;
  locale: "en" | "vi";
}

interface Stat {
  label: string;
  value: string;
}

export const ChatUsageSummaryCards = ({ summary, locale }: ChatUsageSummaryProps): ReactElement => {
  const T = CHAT_USAGE_COPY[locale];
  const number = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");
  const percent = (value: number): string => `${number.format(Math.round(value * 10) / 10)}%`;
  const stats: Stat[] = [
    { label: T.MESSAGES, value: number.format(summary.messages) },
    { label: T.ESTIMATED_COST, value: formatUsd(summary.estimatedCostUsd, locale) },
    { label: T.CACHE_HIT_RATE, value: percent(summary.cacheHitRate) },
    { label: T.FAILED_RATE, value: percent(summary.failedRate) },
    {
      label: T.TOKENS,
      value: `${number.format(summary.tokensIn)} / ${number.format(summary.tokensOut + summary.tokensThinking)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <DashboardCard key={stat.label}>
          <p className="text-sm text-[var(--table-muted-text)]">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
        </DashboardCard>
      ))}
    </div>
  );
};
