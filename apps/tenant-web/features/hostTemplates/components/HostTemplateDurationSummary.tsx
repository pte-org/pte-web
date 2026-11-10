"use client";

import type { ReactElement } from "react";
import type { PartTimeFeasibilityResponse } from "@pte/api-client";
import { DurationSummary } from "@pte/ui";
import { useEditorText } from "../hooks/useTemplateText";

interface HostTemplateDurationSummaryProps {
  parts: readonly PartTimeFeasibilityResponse[] | undefined;
  totalMaxSeconds: number | null | undefined;
}

/** How long each part of an exam built from the centre's template is planned to take. */
export const HostTemplateDurationSummary = ({
  parts,
  totalMaxSeconds,
}: HostTemplateDurationSummaryProps): ReactElement | null => {
  const text = useEditorText();
  const labels = {
    SPEAKING_WRITING: text.PART_SPEAKING_WRITING,
    READING: text.PART_READING,
    LISTENING: text.PART_LISTENING,
  } as const;

  return (
    <DurationSummary
      title={text.DURATION_TITLE}
      parts={parts?.map((part) => ({
        id: part.part,
        label: labels[part.part],
        minSeconds: part.minSeconds,
        maxSeconds: part.maxSeconds,
        frameMinSeconds: part.frameMinSeconds,
        frameMaxSeconds: part.frameMaxSeconds,
        fits: part.canFitFrame,
      }))}
      ceilingSeconds={totalMaxSeconds}
      copy={{
        minutesShort: text.MINUTES_SHORT,
        window: text.DURATION_WINDOW,
        fits: text.DURATION_FITS,
        noFit: text.DURATION_NO_FIT,
        ceiling: text.DURATION_CEILING,
      }}
    />
  );
};
