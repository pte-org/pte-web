import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SIM_TASKS, TASK_NAMES, type StudentAnswers } from "../constants/miniExam";
import { contributingSkills } from "../constants/scoringWeights";
import { OUTCOME_TONES } from "../constants/aboutPteLayout";

interface AnswerGridProps {
  answers: readonly StudentAnswers[];
  onToggle: (student: number, taskKey: string, item: number) => void;
  copy: AboutPteCopy;
}


/** Stage 1: every item, side by side for the three students; each answer is clickable. */
export const AnswerGrid = ({ answers, onToggle, copy }: AnswerGridProps): ReactElement => {
  const text = copy.simulation;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-3 py-2 font-medium">{text.task}</th>
            <th className="px-3 py-2 font-medium">{text.item}</th>
            {text.students.map((name) => (
              <th key={name} className="px-3 py-2 text-center font-medium">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SIM_TASKS.flatMap((task) =>
            Array.from({ length: task.items }, (_, item) => (
              <tr key={`${task.key}-${item}`} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  {item === 0 && (
                    <span className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                      {TASK_NAMES[task.key]}
                      {contributingSkills(task).length > 1 && <Badge variant="info">{text.integrated}</Badge>}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-500">{`${text.item} ${item + 1}`}</td>
                {answers.map((studentAnswers, student) => {
                  const outcome = studentAnswers[task.key][item];
                  return (
                    <td key={text.students[student]} className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => onToggle(student, task.key, item)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-80 ${OUTCOME_TONES[outcome]}`}
                      >
                        {text.outcomes[outcome]}
                      </button>
                    </td>
                  );
                })}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
};
