import type { ReactElement } from "react";
import type { GenerationStatsResponse, GenerationTokenStats } from "@pte/api-client";
import { DashboardCard } from "@pte/ui";
import { failedTone } from "@/features/chatUsage/utils/presentation";
import { formatUsd } from "@/features/chatUsage/utils/summarize";
import type { AiAdminCopy } from "../constants";
import { fill } from "../utils/presentation";

// An older backend sends no token figures; show zeros rather than breaking the tab.
const NO_TOKENS: GenerationTokenStats = { calls: 0, tokensIn: 0, tokensOut: 0, estimatedCostUsd: 0 };

interface OutcomeCardsProps {
  stats: GenerationStatsResponse;
  copy: AiAdminCopy;
  locale: "en" | "vi";
}

interface Stat {
  label: string;
  value: string;
  detail: string;
  /** Red when the number needs attention. */
  alert?: boolean;
}

/** The same four figures as the chatbot usage tab: volume, estimated cost, failures and tokens. */
export const OutcomeCards = ({ stats, copy, locale }: OutcomeCardsProps): ReactElement => {
  const number = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");
  const tokens = stats.tokens ?? NO_TOKENS;
  const made = stats.saved + stats.failed;
  const failedRate = made === 0 ? 0 : (stats.failed / made) * 100;
  const cards: Stat[] = [
    { label: copy.ITEMS, value: number.format(made), detail: fill(copy.ITEMS_DETAIL, { saved: number.format(stats.saved) }) },
    {
      label: copy.ESTIMATED_COST,
      value: formatUsd(tokens.estimatedCostUsd, locale),
      detail: fill(copy.COST_DETAIL, { calls: number.format(tokens.calls) }),
    },
    {
      label: copy.FAILED_RATE,
      value: `${number.format(Math.round(failedRate * 10) / 10)}%`,
      detail: fill(copy.FAILED_DETAIL, { count: number.format(stats.failed), total: number.format(made) }),
      alert: failedTone(failedRate) === "danger",
    },
    {
      label: copy.TOKENS,
      value: `${number.format(tokens.tokensIn)} / ${number.format(tokens.tokensOut)}`,
      detail: fill(copy.TOKENS_DETAIL, { total: number.format(tokens.tokensIn + tokens.tokensOut) }),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <DashboardCard key={card.label}>
          <p className="text-sm text-[var(--table-muted-text)]">{card.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${card.alert ? "text-[var(--blush-action)]" : ""}`}>
            {card.value}
          </p>
          <p className="mt-1 text-xs text-[var(--table-muted-text)]">{card.detail}</p>
        </DashboardCard>
      ))}
    </div>
  );
};
