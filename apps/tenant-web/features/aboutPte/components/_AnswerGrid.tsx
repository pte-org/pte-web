import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { MINI_TASKS, type Outcome, type StudentAnswers } from "../constants/miniExam";
import { contributingSkills } from "../constants/scoringWeights";

interface AnswerGridProps {
  answers: readonly StudentAnswers[];
  onToggle: (student: number, taskKey: string, item: number) => void;
  copy: AboutPteCopy;
}

const OUTCOME_CLASS: Record<Outcome, string> = {
  correct: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  partial: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
  wrong: "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100",
};

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
          {MINI_TASKS.flatMap((task) =>
            Array.from({ length: task.items }, (_, item) => (
              <tr key={`${task.key}-${item}`} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  {item === 0 && (
                    <span className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                      {copy.taskNames[task.key]}
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
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${OUTCOME_CLASS[outcome]}`}
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
