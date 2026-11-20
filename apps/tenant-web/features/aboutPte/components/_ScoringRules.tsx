import type { ReactElement } from "react";
import Link from "next/link";
import { Badge } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_TONES } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { OFFICIAL_RULES, type ScoringKind } from "../constants/officialScoring";
import { contributingSkills, STANDARD_TASK_WEIGHTS } from "../constants/scoringWeights";

interface ScoringRulesProps {
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

const SCORE_GUIDE_SOURCE_ID = 14;
const GATED_TRAITS = new Set(["Content", "Form"]);
const KIND_VARIANT: Record<ScoringKind, "neutral" | "info" | "warning"> = {
  correct: "neutral",
  partial: "info",
  trait: "warning",
};

/** The official scoring rule of all 22 question types, one row each. */
export const ScoringRules = ({ copy, locale }: ScoringRulesProps): ReactElement => {
  const { flow } = copy;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-xs sm:text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            {flow.rulesColumns.map((column) => (
              <th key={column} className="px-3 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STANDARD_TASK_WEIGHTS.map((task) => {
            const rule = OFFICIAL_RULES[task.key];
            return (
              <tr key={task.key} className="border-t border-slate-100 align-top">
                <td className="px-3 py-2 font-semibold text-slate-900">{TASK_NAMES[task.key]}</td>
                <td className="px-3 py-2">
                  <Badge variant={KIND_VARIANT[rule.kind]}>{flow.kinds[rule.kind]}</Badge>
                </td>
                <td className="px-3 py-2 text-slate-700">
                  {rule.traits.map((trait) => (
                    <span key={trait.name} className="mr-2 inline-block whitespace-nowrap">
                      {`${trait.name} ${trait.max}`}
                      {rule.gate && GATED_TRAITS.has(trait.name) && (
                        <span className="ml-1 text-rose-600">{`(${flow.gate})`}</span>
                      )}
                    </span>
                  ))}
                </td>
                <td className="px-3 py-2 text-slate-600">{rule[locale]}</td>
                <td className="px-3 py-2">
                  <span className="flex flex-wrap gap-1">
                    {contributingSkills(task).map((skill) => (
                      <span key={skill} className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${SKILL_TONES[skill].bg}`}>
                        {copy.skills[skill]}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Link href={`#source-${SCORE_GUIDE_SOURCE_ID}`} className="text-action hover:underline">
                    {rule.page}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
