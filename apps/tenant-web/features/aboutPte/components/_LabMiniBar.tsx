import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_TONES } from "../constants/aboutPteLayout";
import { SKILLS } from "../constants/scoringWeights";
import type { ScoreLab } from "../hooks/useScoreLab";

interface LabMiniBarProps {
  lab: ScoreLab;
  copy: AboutPteCopy;
}

/**
 * Overall and the four skill scores in one row, pinned under the section bar on small screens, where the full
 * scoreboard sits below all 22 question types and would be out of sight while an answer is being changed.
 */
export const LabMiniBar = ({ lab, copy }: LabMiniBarProps): ReactElement => (
  <div
    role="status"
    aria-label={copy.skills.overall}
    className="sticky top-13 z-30 grid grid-cols-5 gap-1 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]/95 p-2 shadow-sm backdrop-blur lg:hidden"
  >
    <div className="flex flex-col items-center rounded-lg bg-[var(--action-tint)] py-1">
      <span className="text-lg font-bold leading-6 tabular-nums text-action">{lab.result.overall.score ?? "—"}</span>
      <span className="text-[0.625rem] font-semibold text-action">{copy.skills.overall}</span>
    </div>
    {SKILLS.map((skill) => (
      <div
        key={skill}
        className={`flex flex-col items-center rounded-lg py-1 transition-colors ${
          lab.highlighted.has(skill) ? "bg-action/10 ring-1 ring-action" : ""
        }`}
      >
        <span className="text-lg font-bold leading-6 tabular-nums text-[var(--ink-primary)]">{lab.result.skills[skill].score ?? "—"}</span>
        <span className="flex items-center gap-1 text-[0.625rem] font-medium text-[var(--ink-secondary)]">
          <span className={`h-1.5 w-1.5 rounded-full ${SKILL_TONES[skill].bg}`} aria-hidden="true" />
          {copy.skills[skill]}
        </span>
      </div>
    ))}
  </div>
);
