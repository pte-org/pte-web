import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SIM_TASKS, TASK_NAMES } from "../constants/miniExam";
import { contributingSkills } from "../constants/scoringWeights";
import { formatNumber, type ScoredResult } from "../utils/scoringEngine";

interface IntegratedExampleProps {
  result: ScoredResult;
  copy: AboutPteCopy;
}

const EXAMPLE_TASK = "WRITE_FROM_DICTATION";

/** One sentence that walks through a single integrated question type for the selected student. */
export const IntegratedExample = ({ result, copy }: IntegratedExampleProps): ReactElement | null => {
  const task = SIM_TASKS.find((candidate) => candidate.key === EXAMPLE_TASK);
  if (!task) return null;
  const text = copy.simulation;
  const average = result.taskAverages[task.key] ?? 0;
  const parts = contributingSkills(task)
    .map(
      (skill) =>
        `${formatNumber((average * task[skill]) / 100)} ${text.to} ${copy.skills[skill]} (${formatNumber(average)} × ${formatNumber(task[skill])} ÷ 100)`,
    )
    .join(text.and);
  return (
    <p className="rounded-lg border border-action/30 bg-action/5 p-3 text-sm text-slate-700">
      <strong className="mr-1">{`${text.example}:`}</strong>
      {text.exampleText(TASK_NAMES[task.key], formatNumber(average), parts)}
    </p>
  );
};
