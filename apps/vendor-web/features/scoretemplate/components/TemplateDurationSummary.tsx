"use client";

import type { ReactElement } from "react";
import type { PartTimeFeasibilityResponse } from "@pte/api-client";
import { Chip, DashboardCard } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";
import { formatMinutes } from "../timeFrame";

interface TemplateDurationSummaryProps {
  parts: readonly PartTimeFeasibilityResponse[] | undefined;
  /** Ceiling of the whole test in seconds; null without a time frame. */
  totalMaxSeconds: number | null | undefined;
}

const PART_LABELS = {
  SPEAKING_WRITING: "PART_SPEAKING_WRITING",
  READING: "PART_READING",
  LISTENING: "PART_LISTENING",
} as const;

/** How long each Pearson part is planned to take with the counts the template allows, against its window. */
export const TemplateDurationSummary = ({
  parts,
  totalMaxSeconds,
}: TemplateDurationSummaryProps): ReactElement | null => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  if (!parts || parts.length === 0) return null;
  const hasFrame = parts.some((part) => part.canFitFrame !== null);

  return (
    <DashboardCard>
      <section aria-label={T.DURATION_TITLE} className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--ink-primary)]">{T.DURATION_TITLE}</h2>
        <ul className="divide-y divide-[var(--shell-border)]">
          {parts.map((part) => (
            <li
              key={part.part}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm"
            >
              <span className="w-44 font-medium text-[var(--ink-primary)]">
                {T[PART_LABELS[part.part]]}
              </span>
              <span className="text-[var(--ink-secondary)]">
                {formatMinutes(part.minSeconds)}–{formatMinutes(part.maxSeconds)} {T.MINUTES_SHORT}
              </span>
              {part.frameMinSeconds !== null && part.frameMaxSeconds !== null && (
                <span className="text-[var(--ink-muted)]">
                  {T.DURATION_WINDOW} {formatMinutes(part.frameMinSeconds)}–
                  {formatMinutes(part.frameMaxSeconds)} {T.MINUTES_SHORT}
                </span>
              )}
              {part.canFitFrame !== null && (
                <Chip tone={part.canFitFrame ? "mint" : "blush"} size="sm">
                  {part.canFitFrame ? T.DURATION_FITS : T.DURATION_NO_FIT}
                </Chip>
              )}
            </li>
          ))}
        </ul>
        <p className="text-xs text-[var(--ink-muted)]">
          {hasFrame && totalMaxSeconds
            ? `${T.DURATION_CEILING} ${formatMinutes(totalMaxSeconds)} ${T.MINUTES_SHORT}`
            : T.DURATION_NO_FRAME}
        </p>
      </section>
    </DashboardCard>
  );
};
