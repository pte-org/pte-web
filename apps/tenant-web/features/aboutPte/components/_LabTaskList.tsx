import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { OUTCOME_TONES, SKILL_TONES } from "../constants/aboutPteLayout";
import { TASK_NAMES, type Outcome } from "../constants/miniExam";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SectionKey } from "../constants/scoringWeights";
import type { ScoreLab } from "../hooks/useScoreLab";

interface LabTaskListProps {
  lab: ScoreLab;
  copy: AboutPteCopy;
}

const SECTIONS: readonly SectionKey[] = ["speakingWriting", "reading", "listening"];
const OUTCOMES: readonly Outcome[] = ["correct", "partial", "wrong"];
const IDLE_CHIP = "border-slate-200 text-slate-500 hover:border-slate-400";

/** Every question type with a three-way Correct / Half / Wrong switch; hovering a row highlights its skills. */
export const LabTaskList = ({ lab, copy }: LabTaskListProps): ReactElement => (
  <div className="space-y-5">
    {SECTIONS.map((section) => (
      <div key={section}>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">{copy.sections[section]}</h4>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {STANDARD_TASK_WEIGHTS.filter((task) => task.section === section).map((task) => (
            <li
              key={task.key}
              onMouseEnter={() => lab.focus(task.key)}
              onMouseLeave={() => lab.focus(null)}
              onFocus={() => lab.focus(task.key)}
              className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 transition-colors ${
                lab.focused === task.key ? "bg-slate-50" : ""
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{TASK_NAMES[task.key]}</span>
                <span className="flex gap-1">
                  {contributingSkills(task).map((skill) => (
                    <span key={skill} title={copy.skills[skill]} className={`h-2 w-2 rounded-full ${SKILL_TONES[skill].bg}`} />
                  ))}
                </span>
              </span>
              <span role="radiogroup" aria-label={TASK_NAMES[task.key]} className="flex gap-1">
                {OUTCOMES.map((outcome) => (
                  <button
                    key={outcome}
                    type="button"
                    role="radio"
                    aria-checked={lab.outcomes[task.key] === outcome}
                    onClick={() => lab.setOutcome(task.key, outcome)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition ${
                      lab.outcomes[task.key] === outcome ? OUTCOME_TONES[outcome] : IDLE_CHIP
                    }`}
                  >
                    {copy.simulation.lab.short[outcome]}
                  </button>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
