import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_TONES } from "../constants/aboutPteLayout";
import { SIM_TASKS, TASK_NAMES } from "../constants/miniExam";
import { contributingSkills, SCORE_FLOOR, SCORE_SPAN, SKILLS, type SkillKey, type TaskWeight } from "../constants/scoringWeights";
import { formatNumber, type Breakdown, type ScoredResult } from "../utils/scoringEngine";

type ColumnKey = SkillKey | "overall";

interface SkillMatrixProps {
  result: ScoredResult;
  showOverall: boolean;
  copy: AboutPteCopy;
}

const OVERALL_TONE = "text-action";
const toneOf = (column: ColumnKey): string => (column === "overall" ? OVERALL_TONE : SKILL_TONES[column].text);
const weightOf = (task: TaskWeight, column: ColumnKey): number => task[column];
const breakdownOf = (result: ScoredResult, column: ColumnKey): Breakdown =>
  column === "overall" ? result.overall : result.skills[column];
const percent = (breakdown: Breakdown): string =>
  breakdown.totalWeight > 0 ? `${formatNumber((breakdown.weightedSum / breakdown.totalWeight) * 100)}%` : "—";
const rawScore = (breakdown: Breakdown): string =>
  breakdown.totalWeight > 0
    ? formatNumber(SCORE_FLOOR + (SCORE_SPAN * breakdown.weightedSum) / breakdown.totalWeight)
    : "—";

const CELL = "px-2 py-1.5 text-right tabular-nums";

/** Question type × skill: each cell is average × weight ÷ 100; columns are summed and scaled to 10–90. */
export const SkillMatrix = ({ result, showOverall, copy }: SkillMatrixProps): ReactElement => {
  const text = copy.simulation;
  const columns: ColumnKey[] = showOverall ? [...SKILLS, "overall"] : [...SKILLS];
  const footer = [
    { label: text.totalWeight, value: (b: Breakdown) => formatNumber(b.totalWeight) },
    { label: text.totalPoints, value: (b: Breakdown) => formatNumber(b.weightedSum) },
    { label: text.ratio, value: percent },
    { label: text.score, value: (b: Breakdown) => `${rawScore(b)} → ${b.score ?? "—"}` },
  ];
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-xs sm:text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-2 py-2 text-left font-medium">{text.task}</th>
            <th className={`${CELL} font-medium`}>{text.average}</th>
            {columns.map((column) => (
              <th key={column} className={`${CELL} font-semibold ${toneOf(column)}`}>
                {copy.skills[column]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SIM_TASKS.map((task) => (
            <tr key={task.key} className="border-t border-slate-100">
              <td className="px-2 py-1.5 text-slate-800">
                {TASK_NAMES[task.key]}
                {contributingSkills(task).length > 1 && (
                  <span className="ml-1 inline-block align-middle">
                    <Badge variant="info">{text.integrated}</Badge>
                  </span>
                )}
              </td>
              <td className={`${CELL} font-semibold`}>{formatNumber(result.taskAverages[task.key] ?? 0)}</td>
              {columns.map((column) => {
                const weight = weightOf(task, column);
                const contribution = ((result.taskAverages[task.key] ?? 0) * weight) / 100;
                return (
                  <td key={column} className={CELL}>
                    {weight > 0 && (
                      <>
                        <span className={`font-semibold ${toneOf(column)}`}>{`+${formatNumber(contribution)}`}</span>
                        <span className="ml-1 text-slate-400">{`(${text.weight} ${formatNumber(weight)})`}</span>
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-slate-300 bg-slate-50">
          {footer.map((row, index) => (
            <tr key={row.label} className={index === footer.length - 1 ? "text-base font-bold" : "font-medium"}>
              <td colSpan={2} className="px-2 py-1.5 text-slate-700">
                {row.label}
              </td>
              {columns.map((column) => (
                <td key={column} className={`${CELL} ${toneOf(column)}`}>
                  {row.value(breakdownOf(result, column))}
                </td>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
};
