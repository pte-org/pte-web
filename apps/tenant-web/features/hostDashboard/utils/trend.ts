import type { TrendValue } from "@pte/api-client";
import type { Locale, StatCardDeltaDirection, StatCardDeltaTone } from "@pte/ui";
import type { DeltaViewModel } from "../types";
import { formatSignedPercent } from "./format";

/** Direction follows the sign of the change; a missing change is flat. */
export function deltaDirection(changePct: number | null): StatCardDeltaDirection {
  if (changePct === null || changePct === 0 || Number.isNaN(changePct)) return "flat";
  return changePct > 0 ? "up" : "down";
}

/**
 * Every host trend counts activity, so growth is good news and a drop is only neutral
 * information (fewer attempts is not a fault). No host trend measures failures.
 */
export function deltaTone(direction: StatCardDeltaDirection): StatCardDeltaTone {
  return direction === "up" ? "good" : "neutral";
}

export function buildDelta(trend: TrendValue, locale: Locale): DeltaViewModel {
  if (trend.changePct === null || Number.isNaN(trend.changePct)) {
    return { change: null, direction: "flat", tone: "neutral" };
  }
  const direction = deltaDirection(trend.changePct);
  return {
    change: formatSignedPercent(trend.changePct, locale),
    direction,
    tone: deltaTone(direction),
  };
}
