import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { OFFICIAL_RULES } from "../constants/officialScoring";
import { traitInfoFor } from "../constants/traitLevels";

interface TraitDetailsProps {
  taskKey: string;
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

/** Every trait of one question type: what it measures, then what each score level means. */
export const TraitDetails = ({ taskKey, copy, locale }: TraitDetailsProps): ReactElement => {
  const rule = OFFICIAL_RULES[taskKey];
  const { flow } = copy;
  if (rule.traits.length === 0) {
    return <p className="text-sm text-slate-600">{`${flow.objectiveLevels} ${rule[locale]}`}</p>;
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {rule.traits.map((trait) => {
        const info = traitInfoFor(taskKey, trait.name);
        if (!info) return null;
        return (
          <section key={trait.name} className="rounded-lg border border-slate-200 bg-white p-3">
            <h4 className="font-semibold text-slate-900">{`${trait.name} (0–${trait.max})`}</h4>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-medium text-slate-800">{`${flow.measures}: `}</span>
              {info.meaning[locale]}
            </p>
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {info.levels.map((lvl) => (
                <li key={lvl.score} className="flex gap-3 py-1.5">
                  <span className="w-14 shrink-0 font-bold tabular-nums text-action">{lvl.score}</span>
                  <span className="text-slate-700">
                    {lvl.label && <span className="mr-1 font-semibold">{`${lvl.label} —`}</span>}
                    {lvl.text[locale]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
