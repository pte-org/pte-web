import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { OFFICIAL_RULES } from "../constants/officialScoring";

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
        <ul className="flex flex-wrap gap-1.5">
          {rule.traits.map((trait) => (
            <li
              key={trait.name}
              className="rounded-full border border-[var(--shell-border)] px-2.5 py-0.5 text-xs text-[var(--ink-secondary)]"
            >
              {`${trait.name} 0–${trait.max}`}
              {gated.includes(trait.name) && <span className="ml-1 font-semibold text-rose-600">{`· ${flow.gate}`}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
