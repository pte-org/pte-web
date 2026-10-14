import type { TrendValue } from "@pte/api-client";
import type { Locale } from "@pte/ui";
import type { DeltaViewModel } from "../types";
import { formatPercent } from "./format";

/**
 * Builds delta information for StatCard.
 * Notice: A decrease is considered neutral (never bad/danger) per project guidelines.
 */
export function buildDelta(trend: TrendValue, locale: Locale): DeltaViewModel | null {
  if (trend.changePct === null) {
    return null;
  }

  const sign = trend.changePct > 0 ? "+" : "";
  const formattedPct = `${sign}${formatPercent(trend.changePct, locale)}`;

  if (trend.changePct > 0) {
    return {
      change: formattedPct,
      direction: "up",
      tone: "good",
    };
  }

  if (trend.changePct < 0) {
    return {
      change: formattedPct,
      direction: "down",
      tone: "neutral",
    };
  }

  return {
    change: formatPercent(0, locale),
    direction: "flat",
    tone: "neutral",
  };
}
