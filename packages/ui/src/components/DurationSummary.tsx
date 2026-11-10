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
  };
  defaultOpen?: boolean;
}

const minutes = (seconds: number): string => (seconds / 60).toFixed(1);

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
}: DurationSummaryProps): ReactElement | null => {
  if (!parts || parts.length === 0) return null;
  const hasFrame = parts.some((part) => part.fits !== null);
  const footnote =
    hasFrame && ceilingSeconds
      ? `${copy.ceiling} ${minutes(ceilingSeconds)} ${copy.minutesShort}`
      : copy.noFrame;

  return (
    <InfoPanel title={title} defaultOpen={defaultOpen}>
      <ul className="divide-y divide-[var(--shell-border)]">
        {parts.map((part) => (
          <li key={part.id} className="space-y-0.5 py-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-[var(--ink-primary)]">{part.label}</span>
              {part.fits !== null && (
                <Chip tone={part.fits ? "mint" : "blush"} size="sm">
                  {part.fits ? copy.fits : copy.noFit}
                </Chip>
              )}
            </div>
            <p className="text-[var(--ink-secondary)]">
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
      </ul>
      {footnote && <p className="text-xs text-[var(--ink-muted)]">{footnote}</p>}
    </InfoPanel>
  );
};
