import type { ReactElement } from "react";
import { cn } from "../utils/cn";
import { TrendDownIcon, TrendFlatIcon, TrendUpIcon } from "./dashboardIcons";

export type StatCardDeltaDirection = "up" | "down" | "flat";
export type StatCardDeltaTone = "good" | "bad" | "neutral";

export interface StatCardDeltaProps {
  /** Already formatted change, e.g. "+12.5%". `null` means there is no comparable period and renders a dash. */
  change?: string | null;
  direction?: StatCardDeltaDirection;
  /**
   * Up can be bad (failures) and down can be good, so meaning is separate from direction.
   * Tone is colour only: also state the evaluative meaning in text (`directionLabel`, for
   * example "Increase, worse") so it is not lost for assistive technology.
   */
  tone?: StatCardDeltaTone;
  /** Comparison period caption, e.g. "vs previous 30 days". */
  periodLabel?: string;
  /** Screen-reader word for the direction, e.g. "Increase". The arrow itself is decorative. */
  directionLabel?: string;
  /** Screen-reader text for the dash shown when `change` is null, e.g. "No previous data". */
  emptyLabel?: string;
}

const EMPTY_CHANGE_GLYPH = "–";

const TONE_CLASSES: Record<StatCardDeltaTone, string> = {
  good: "text-[var(--mint-action)]",
  bad: "text-[var(--blush-action)]",
  neutral: "text-[var(--ink-muted)]",
};

const DIRECTION_ICONS: Record<StatCardDeltaDirection, typeof TrendUpIcon> = {
  up: TrendUpIcon,
  down: TrendDownIcon,
  flat: TrendFlatIcon,
};

/** True when the caller supplied any delta prop; existing StatCard usages supply none. */
export const hasStatCardDelta = ({
  change,
  direction,
  tone,
  periodLabel,
}: StatCardDeltaProps): boolean =>
  change !== undefined || direction !== undefined || tone !== undefined || periodLabel !== undefined;

/**
 * Period-over-period change line. Meaning never relies on color alone: it carries an
 * arrow icon, the signed text supplied by the caller and optional screen-reader wording.
 */
export const StatCardDelta = ({
  change,
  direction = "flat",
  tone = "neutral",
  periodLabel,
  directionLabel,
  emptyLabel,
}: StatCardDeltaProps): ReactElement => {
  const DirectionIcon = DIRECTION_ICONS[direction];
  const hasChange = change !== undefined && change !== null;

  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs">
      {hasChange ? (
        <span className={cn("inline-flex items-center gap-1 font-medium", TONE_CLASSES[tone])}>
          <DirectionIcon className="h-3.5 w-3.5 shrink-0" />
          {directionLabel && <span className="sr-only">{directionLabel}</span>}
          <span className="tabular-nums">{change}</span>
        </span>
      ) : (
        <span className="inline-flex items-center text-[var(--ink-muted)]">
          <span aria-hidden="true">{EMPTY_CHANGE_GLYPH}</span>
          {emptyLabel && <span className="sr-only">{emptyLabel}</span>}
        </span>
      )}
      {periodLabel && <span className="text-[var(--ink-muted)]">{periodLabel}</span>}
    </p>
  );
};
