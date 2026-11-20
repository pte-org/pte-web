import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { STANDARD_TASK_WEIGHTS } from "../constants/scoringWeights";
import { ScoringRuleRow } from "./_ScoringRuleRow";

interface ScoringRulesProps {
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

/** The official scoring rule of all 22 question types, one row each, expandable to level descriptions. */
export const ScoringRules = ({ copy, locale }: ScoringRulesProps): ReactElement => {
  const columns = copy.flow.rulesColumns;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-xs sm:text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-3 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STANDARD_TASK_WEIGHTS.map((task) => (
            <ScoringRuleRow key={task.key} task={task} copy={copy} locale={locale} columnCount={columns.length} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
