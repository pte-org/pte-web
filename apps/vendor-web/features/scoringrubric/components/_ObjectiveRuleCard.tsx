"use client";

import type { ReactElement } from "react";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import type { RubricObjectiveRuleResponse } from "../types";
import { RubricSection } from "./_RubricSection";

interface ObjectiveRuleCardProps {
  rule: RubricObjectiveRuleResponse;
}

/** The answer-key formula as the rubric catalog describes it; it is not configurable. */
export const ObjectiveRuleCard = ({ rule }: ObjectiveRuleCardProps): ReactElement => {
  const { messages: M, format } = useScoringRubricText();

  return (
    <RubricSection title={M.objectiveTitle}>
      <p className="text-sm text-[var(--ink-primary)]">{rule.descriptionVi}</p>
      <p className="text-xs text-[var(--ink-secondary)]">
        {M.objectiveCode}: <span className="font-mono">{rule.code}</span> ·{" "}
        {format("objectivePages", { pages: rule.pearsonPages })}
      </p>
    </RubricSection>
  );
};
