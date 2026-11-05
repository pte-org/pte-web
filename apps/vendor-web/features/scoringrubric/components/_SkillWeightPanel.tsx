"use client";

import type { ReactElement } from "react";
import { DescriptionList, type DescriptionItem } from "@pte/ui";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import type { TemplateSkillWeights } from "../types";
import { RubricSection } from "./_RubricSection";

interface SkillWeightPanelProps {
  /** `undefined`: no template chosen; `null`: the chosen template does not include this task type. */
  weights: TemplateSkillWeights | null | undefined;
}

/** The stored S/W/R/L/Overall weights of this task type in the viewed exam template. */
export const SkillWeightPanel = ({ weights }: SkillWeightPanelProps): ReactElement => {
  const { messages: M } = useScoringRubricText();

  const items: DescriptionItem[] = weights
    ? [
        { label: M.skillSPEAKING, value: weights.speaking },
        { label: M.skillWRITING, value: weights.writing },
        { label: M.skillREADING, value: weights.reading },
        { label: M.skillLISTENING, value: weights.listening },
        { label: M.weightOverall, value: weights.overall, fullWidth: true },
      ]
    : [];

  return (
    <RubricSection title={M.weightsTitle} hint={M.weightsHint}>
      {weights === undefined && (
        <p className="text-sm text-[var(--ink-secondary)]">{M.weightsNoTemplate}</p>
      )}
      {weights === null && (
        <p className="text-sm text-[var(--ink-secondary)]">{M.weightsNotInTemplate}</p>
      )}
      {weights && <DescriptionList items={items} variant="inline" />}
    </RubricSection>
  );
};
