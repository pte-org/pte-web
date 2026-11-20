import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_TONES } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SectionKey } from "../constants/scoringWeights";
import type { ScoreLab } from "../hooks/useScoreLab";
import { LabItemEditor } from "./_LabItemEditor";

interface LabTaskListProps {
  lab: ScoreLab;
  copy: AboutPteCopy;
}

const SECTIONS: readonly SectionKey[] = ["speakingWriting", "reading", "listening"];
const HIGH_SCORE = 70;
const LOW_SCORE = 40;

const scoreTone = (score: number): string =>
  score >= HIGH_SCORE
    ? "bg-[var(--mint-tint)] text-[var(--mint-action)]"
    : score >= LOW_SCORE
      ? "bg-[var(--cream-tint)] text-[var(--cream-action)]"
      : "bg-[var(--blush-tint)] text-[var(--blush-action)]";

/** Every question type with its sample-item score; opening a row shows the controls of its real rule. */
export const LabTaskList = ({ lab, copy }: LabTaskListProps): ReactElement => (
  <div className="space-y-5">
    {SECTIONS.map((section) => (
      <div key={section}>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--ink-muted)]">{copy.sections[section]}</h4>
        <ul className="divide-y divide-[var(--shell-border)] overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]">
          {STANDARD_TASK_WEIGHTS.filter((task) => task.section === section).map((task) => {
            const isOpen = lab.open === task.key;
            const score = lab.itemScores[task.key];
            return (
              <li key={task.key} onMouseEnter={() => lab.focus(task.key)} onMouseLeave={() => lab.focus(null)}>
                <button
                  type="button"
                  onClick={() => lab.toggle(task.key)}
                  onFocus={() => lab.focus(task.key)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-subtle)] ${
                    isOpen ? "bg-[var(--surface-subtle)]" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="text-sm font-medium text-[var(--ink-primary)]">{TASK_NAMES[task.key]}</span>
                    <span className="flex gap-1">
                      {contributingSkills(task).map((skill) => (
                        <span key={skill} title={copy.skills[skill]} className={`h-2 w-2 rounded-full ${SKILL_TONES[skill].bg}`} />
                      ))}
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${scoreTone(score)}`}>
                    {score}
                  </span>
                </button>
                {isOpen && (
                  <LabItemEditor
                    taskKey={task.key}
                    values={lab.values[task.key]}
                    onChange={(index, value) => lab.setValue(task.key, index, value)}
                    copy={copy}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </div>
);
