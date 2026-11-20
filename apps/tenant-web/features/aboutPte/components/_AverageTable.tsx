import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SIM_TASKS, TASK_NAMES, OUTCOME_SCORE, type StudentAnswers } from "../constants/miniExam";
import { SKILLS } from "../constants/scoringWeights";
import { formatNumber } from "../utils/scoringEngine";

interface AverageTableProps {
  answers: readonly StudentAnswers[];
  copy: AboutPteCopy;
}

/** Stage 2: per question type, "(100 + 50) ÷ 2 = 75" for each student. */
export const AverageTable = ({ answers, copy }: AverageTableProps): ReactElement => {
  const text = copy.simulation;
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">{text.task}</th>
              <th className="px-3 py-2 font-medium">{text.weights}</th>
              {text.students.map((name) => (
                <th key={name} className="px-3 py-2 font-medium">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIM_TASKS.map((task) => (
              <tr key={task.key} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-900">{TASK_NAMES[task.key]}</td>
                <td className="px-3 py-2 tabular-nums text-slate-500">
                  {SKILLS.map((skill) => formatNumber(task[skill])).join(" / ")}
                </td>
                {answers.map((studentAnswers, student) => {
                  const scores = studentAnswers[task.key].map((outcome) => OUTCOME_SCORE[outcome]);
                  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                  return (
                    <td key={text.students[student]} className="px-3 py-2 tabular-nums">
                      <span className="text-slate-500">{`(${scores.join(" + ")}) ÷ ${scores.length} = `}</span>
                      <strong className="text-slate-900">{formatNumber(average)}</strong>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
