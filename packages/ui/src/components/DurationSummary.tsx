"use client";

import type { ReactElement } from "react";
import { Chip } from "./Chip";
import { InfoPanel } from "./InfoPanel";

export interface DurationPart {
  id: string;
  label: string;
  minSeconds: number;
  maxSeconds: number;
  /** The window set for the part; null when the template has none. */
  frameMinSeconds: number | null;
  frameMaxSeconds: number | null;
  /** Whether the planned range can land in the window; null when there is no window. */
  fits: boolean | null;
}

interface DurationSummaryProps {
  title: string;
  parts: readonly DurationPart[] | undefined;
  /** Ceiling of the whole test in seconds; null without a time frame. */
  ceilingSeconds?: number | null;
  /** The words of the card, so each app brings its own language and its own wording. */
  copy: {
    minutesShort: string;
    window: string;
    fits: string;
    noFit: string;
    ceiling: string;
    /** Said under the list when no part has a window; leave out to say nothing. */
    noFrame?: string;
    /** Label of the total column; leave out for no total. */
    total?: string;
  };
  defaultOpen?: boolean;
  /** `row` lays the parts side by side, for a card that spans the page; the default stacks them. */
  layout?: "list" | "row";
  /** Shows whole minutes (`71–81`) instead of one decimal (`71.1–81.3`). */
  roundMinutes?: boolean;
}

const SECONDS_PER_MINUTE = 60;

const minutesOf =
  (round: boolean) =>
  (seconds: number): string =>
    round ? String(Math.round(seconds / SECONDS_PER_MINUTE)) : (seconds / SECONDS_PER_MINUTE).toFixed(1);

/**
 * How long each part of an exam is planned to take with the counts the template allows, against the window
 * the template sets for it. It folds down to its title, like the other panels of a template screen.
 */
export const DurationSummary = ({
  title,
  parts,
  ceilingSeconds,
  copy,
  defaultOpen = true,
  layout = "list",
  roundMinutes = false,
}: DurationSummaryProps): ReactElement | null => {
  if (!parts || parts.length === 0) return null;
  const minutes = minutesOf(roundMinutes);
  const isRow = layout === "row";
  // Side by side, the figures are what the eye should land on, so the part names step back.
  const nameClass = isRow
    ? "text-xs text-[var(--ink-muted)]"
    : "text-sm font-medium text-[var(--ink-primary)]";
  const figureClass = isRow
    ? "text-sm font-semibold text-[var(--ink-primary)]"
    : "text-[var(--ink-secondary)]";
  const total = copy.total
    ? {
        min: parts.reduce((sum, part) => sum + part.minSeconds, 0),
        max: parts.reduce((sum, part) => sum + part.maxSeconds, 0),
      }
    : null;
  const hasFrame = parts.some((part) => part.fits !== null);
  const footnote =
    hasFrame && ceilingSeconds
      ? `${copy.ceiling} ${minutes(ceilingSeconds)} ${copy.minutesShort}`
      : copy.noFrame;

  return (
    <InfoPanel title={title} defaultOpen={defaultOpen}>
      <ul
        className={
          layout === "row"
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            : "divide-y divide-[var(--shell-border)]"
        }
      >
        {parts.map((part) => (
          <li key={part.id} className={layout === "row" ? "space-y-0.5 text-xs" : "space-y-0.5 py-2 text-xs"}>
            <div className="flex items-center justify-between gap-2">
              <span className={nameClass}>{part.label}</span>
              {part.fits !== null && (
                <Chip tone={part.fits ? "mint" : "blush"} size="sm">
                  {part.fits ? copy.fits : copy.noFit}
                </Chip>
              )}
            </div>
            <p className={figureClass}>
              {minutes(part.minSeconds)}–{minutes(part.maxSeconds)} {copy.minutesShort}
            </p>
            {part.frameMinSeconds !== null && part.frameMaxSeconds !== null && (
              <p className="text-[var(--ink-muted)]">
                {copy.window} {minutes(part.frameMinSeconds)}–{minutes(part.frameMaxSeconds)}{" "}
                {copy.minutesShort}
              </p>
            )}
          </li>
        ))}
        {total && (
          <li className={layout === "row" ? "space-y-0.5 text-xs" : "space-y-0.5 py-2 text-xs"}>
            <span className={isRow ? "text-xs text-[var(--ink-muted)]" : "text-sm font-semibold text-[var(--ink-primary)]"}>
              {copy.total}
            </span>
            <p className={isRow ? "text-base font-semibold text-[var(--brand-ink)]" : "font-medium text-[var(--ink-primary)]"}>
              {minutes(total.min)}–{minutes(total.max)} {copy.minutesShort}
            </p>
          </li>
        )}
      </ul>
      {footnote && <p className="text-xs text-[var(--ink-muted)]">{footnote}</p>}
    </InfoPanel>
  );
};
