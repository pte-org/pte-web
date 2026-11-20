import type { ReactElement } from "react";
import { ProgressBar } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { ABOUT_PTE_LAYOUT, SKILL_TONES } from "../constants/aboutPteLayout";
import { SKILLS, STANDARD_TASK_WEIGHTS, SCORE_FLOOR, SCORE_SPAN } from "../constants/scoringWeights";
import type { ScoredStudent } from "../hooks/useScoringSimulation";

interface StudentTraceProps {
  student: ScoredStudent;
  stage: number;
  copy: AboutPteCopy;
}

const toPercent = (score: number): number => ((score - SCORE_FLOOR) / SCORE_SPAN) * 100;

export const StudentTrace = ({ student, stage, copy }: StudentTraceProps): ReactElement => (
  <div className={ABOUT_PTE_LAYOUT.card}>
    <h3 className="font-semibold text-slate-900">
      {copy.simulation.selected} · {student.code}
    </h3>
    {stage >= 1 && (
      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="py-1 font-medium">{copy.simulation.taskColumn}</th>
            <th className="py-1 text-right font-medium">{copy.simulation.averageColumn}</th>
          </tr>
        </thead>
        <tbody>
          {STANDARD_TASK_WEIGHTS.map((task) => (
            <tr key={task.key} className="border-t border-slate-100">
              <td className="py-1 text-slate-700">{task.key}</td>
              <td className="py-1 text-right tabular-nums">{student.result.taskAverages[task.key]?.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    {stage >= 2 && (
      <div className="mt-4 space-y-3">
        {SKILLS.map((skill) => (
          <div key={skill}>
            <div className="flex justify-between text-sm">
              <span className={SKILL_TONES[skill].text}>{copy.skills[skill]}</span>
              <span className="font-semibold tabular-nums">{student.result.skills[skill]}</span>
            </div>
            <ProgressBar value={toPercent(student.result.skills[skill])} max={100} label={copy.skills[skill]} />
          </div>
        ))}
      </div>
    )}
    {stage >= 3 && (
      <p className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-3">
        <span className="font-semibold">{copy.skills.overall}</span>
        <span className="text-3xl font-bold text-action tabular-nums">{student.result.overall}</span>
      </p>
    )}
  </div>
);
