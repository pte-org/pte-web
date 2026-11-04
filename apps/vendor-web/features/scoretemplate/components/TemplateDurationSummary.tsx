"use client";

import type { ReactElement } from "react";
import type { PartTimeFeasibilityResponse } from "@pte/api-client";
import { DurationSummary } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT } from "../constants";

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

  return (
    <DurationSummary
      title={T.DURATION_TITLE}
      parts={parts?.map((part) => ({
        id: part.part,
        label: T[PART_LABELS[part.part]],
        minSeconds: part.minSeconds,
        maxSeconds: part.maxSeconds,
        frameMinSeconds: part.frameMinSeconds,
        frameMaxSeconds: part.frameMaxSeconds,
        fits: part.canFitFrame,
      }))}
      ceilingSeconds={totalMaxSeconds}
      copy={{
        minutesShort: T.MINUTES_SHORT,
        window: T.DURATION_WINDOW,
        fits: T.DURATION_FITS,
        noFit: T.DURATION_NO_FIT,
        ceiling: T.DURATION_CEILING,
        noFrame: T.DURATION_NO_FRAME,
      }}
    />
  );
};
