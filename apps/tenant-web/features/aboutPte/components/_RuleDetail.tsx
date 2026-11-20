import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { OFFICIAL_RULES } from "../constants/officialScoring";
import { traitInfoFor } from "../constants/traitLevels";

interface RuleDetailProps {
  taskKey: string;
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

const GATED_TRAITS = new Set(["Content", "Form"]);
/** Speaking/writing traits with a fixed maximum; Read Aloud's Content max is the passage length N. */
const READ_ALOUD_EXTRA = 10;

const totalMax = (maxima: readonly string[]): string => {
  const fixed = maxima.filter((max) => /^\d+$/.test(max)).reduce((sum, max) => sum + Number(max), 0);
  return maxima.some((max) => !/^\d+$/.test(max)) ? `(N + ${READ_ALOUD_EXTRA})` : String(fixed);
};

/** How one question type is scored: the item formula, the zero gate, and what each trait measures. */
export const RuleDetail = ({ taskKey, copy, locale }: RuleDetailProps): ReactElement => {
  const rule = OFFICIAL_RULES[taskKey];
  const { flow } = copy;
  const gated = rule.traits.filter((trait) => rule.gate && GATED_TRAITS.has(trait.name)).map((trait) => trait.name);
  const isTraitBased = rule.kind === "trait" && rule.traits.length > 1;
  return (
    <div className="space-y-2">
      <p className="text-[var(--ink-primary)]">{rule[locale]}</p>
      {isTraitBased && (
        <p className="rounded-md bg-[var(--surface-subtle)] px-2 py-1 font-mono text-xs text-[var(--ink-primary)]">
          {`${flow.itemFormula} = (${rule.traits.map((trait) => trait.name).join(" + ")}) ÷ ${totalMax(rule.traits.map((trait) => trait.max))} × 100`}
        </p>
      )}
      {gated.length > 0 && <p className="text-xs font-medium text-rose-600">{flow.gateLine(gated.join(flow.or))}</p>}
      {rule.traits.length > 0 && (
        <ul className="space-y-1 text-xs text-[var(--ink-secondary)]">
          {rule.traits.map((trait) => (
            <li key={trait.name}>
              <span className="font-semibold text-[var(--ink-primary)]">{`${trait.name}: `}</span>
              {traitInfoFor(taskKey, trait.name)?.meaning[locale]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
