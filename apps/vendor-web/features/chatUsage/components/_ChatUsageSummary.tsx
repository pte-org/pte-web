import type { ReactElement } from "react";
import { DashboardCard } from "@pte/ui";
import { CHAT_USAGE_COPY } from "../constants";
import { failedTone } from "../utils/presentation";
import type { ChatUsageSummary } from "../utils/summarize";
import { formatUsd } from "../utils/summarize";

interface ChatUsageSummaryProps {
  summary: ChatUsageSummary;
  locale: "en" | "vi";
}

interface Stat {
  label: string;
  value: string;
  detail: string;
  /** Red when the number needs attention. */
  alert?: boolean;
}

const fill = (template: string, values: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

export const ChatUsageSummaryCards = ({ summary, locale }: ChatUsageSummaryProps): ReactElement => {
  const T = CHAT_USAGE_COPY[locale];
  const number = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");
  const percent = (value: number): string => `${number.format(Math.round(value * 10) / 10)}%`;
  const total = number.format(summary.messages);
  const tokensOut = summary.tokensOut + summary.tokensThinking;
  const stats: Stat[] = [
    { label: T.MESSAGES, value: total, detail: `${number.format(summary.ok)} ${T.ANSWERED.toLowerCase()}` },
    {
      label: T.ESTIMATED_COST,
      value: formatUsd(summary.estimatedCostUsd, locale),
      detail: fill(T.COST_DETAIL, { total }),
    },
    {
      label: T.CACHE_HIT_RATE,
      value: percent(summary.cacheHitRate),
      detail: fill(T.CACHE_DETAIL, { count: number.format(summary.cacheHits), total }),
    },
    {
      label: T.FAILED_RATE,
      value: percent(summary.failedRate),
      detail: fill(T.FAILED_DETAIL, { count: number.format(summary.failed), total }),
      alert: failedTone(summary.failedRate) === "danger",
    },
    {
      label: T.TOKENS,
      value: `${number.format(summary.tokensIn)} / ${number.format(tokensOut)}`,
      detail: fill(T.TOKENS_DETAIL, { total: number.format(summary.tokensIn + tokensOut) }),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <DashboardCard key={stat.label}>
          <p className="text-sm text-[var(--table-muted-text)]">{stat.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${stat.alert ? "text-[var(--blush-action)]" : ""}`}>
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-[var(--table-muted-text)]">{stat.detail}</p>
        </DashboardCard>
      ))}
    </div>
  );
};
