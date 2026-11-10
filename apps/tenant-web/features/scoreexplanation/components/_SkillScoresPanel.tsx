"use client";

import type { ReactElement } from "react";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";
import type { SkillExplanationResponse } from "../types";
import { ExplanationSection } from "./_ExplanationSection";
import { SkillTraceTable } from "./_SkillTraceTable";

interface SkillScoresPanelProps {
  skills: SkillExplanationResponse[];
  /** Null when the exam does not test all four skills. */
  overall: SkillExplanationResponse | null;
}

/** The 10-90 chain for every skill and for Overall, or why Overall does not apply. */
export const SkillScoresPanel = ({ skills, overall }: SkillScoresPanelProps): ReactElement => {
  const { messages: M, codeLabel } = useScoreExplanationText();

  return (
    <ExplanationSection title={M.skillsTitle} hint={M.skillsHint}>
      <div className="grid gap-4 xl:grid-cols-2">
        {skills.map((skill) => (
          <SkillTraceTable key={skill.skill} title={codeLabel("skill", skill.skill)} skill={skill} />
        ))}
      </div>
      {overall ? (
        <SkillTraceTable title={M.overall} skill={overall} />
      ) : (
        <p className="rounded-lg border border-[var(--shell-border)] p-4 text-sm text-[var(--ink-secondary)]">
          <span className="font-semibold text-[var(--ink-primary)]">{M.overall}</span>
          {" · "}
          {M.overallNotApplicable}
        </p>
      )}
    </ExplanationSection>
  );
};
