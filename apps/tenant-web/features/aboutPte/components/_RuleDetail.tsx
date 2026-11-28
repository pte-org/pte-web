import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { GATE_CHIP_TONE } from "../constants/aboutPteLayout";
import { OFFICIAL_RULES } from "../constants/officialScoring";

interface RuleDetailProps {
  taskKey: string;
  copy: AboutPteCopy;
  locale: "en" | "vi";
  /** Makes each trait chip a shortcut to that trait's score levels. */
  onSelectTrait?: (trait: string) => void;
}

export const GATED_TRAITS = new Set(["Content", "Form"]);
/** "(6 + 5 + 5 = 16)", or "(N + 5 + 5)" when a maximum depends on the item (Read Aloud's passage length N). */
const maxBreakdown = (maxima: readonly string[]): string => {
  const sum = maxima.join(" + ");
  return maxima.every((max) => /^\d+$/.test(max))
    ? `(${sum} = ${maxima.reduce((total, max) => total + Number(max), 0)})`
    : `(${sum})`;
};

/** "Item score = (Content + …) ÷ (6 + 5 + 5 = 16) × 100" for a question type scored by several traits, else null. */
export const ruleFormula = (taskKey: string, itemFormula: string): string | null => {
  const rule = OFFICIAL_RULES[taskKey];
  if (rule.kind !== "trait" || rule.traits.length < 2) return null;
  return `${itemFormula} = (${rule.traits.map((trait) => trait.name).join(" + ")}) ÷ ${maxBreakdown(rule.traits.map((trait) => trait.max))} × 100`;
};

/** How one question type is scored: the item formula, the zero gate, and what each trait measures. */
export const RuleDetail = ({ taskKey, copy, locale, onSelectTrait }: RuleDetailProps): ReactElement => {
  const rule = OFFICIAL_RULES[taskKey];
  const { flow } = copy;
  const gated = rule.traits.filter((trait) => rule.gate && GATED_TRAITS.has(trait.name)).map((trait) => trait.name);
  const formula = ruleFormula(taskKey, flow.itemFormula);
  return (
    <div className="space-y-2">
      <p className="text-[var(--ink-primary)]">{rule[locale]}</p>
      {formula && (
        <p className="rounded-md bg-[var(--surface-subtle)] px-2 py-1 font-mono text-xs text-[var(--ink-primary)]">{formula}</p>
      )}
      {rule.traits.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {rule.traits.map((trait) => {
            const chipClass = `rounded-full border px-2.5 py-0.5 text-xs ${
              gated.includes(trait.name)
                ? GATE_CHIP_TONE
                : "border-[var(--shell-border)] text-[var(--ink-secondary)]"
            }`;
            const label = (
              <>
                {`${trait.name} 0–${trait.max}`}
                {gated.includes(trait.name) && <span className="ml-1 font-semibold">{`· ${flow.gate}`}</span>}
              </>
            );
            return (
              <li key={trait.name}>
                {onSelectTrait ? (
                  <button
                    type="button"
                    onClick={() => onSelectTrait(trait.name)}
                    className={`${chipClass} cursor-pointer transition-colors hover:border-action hover:text-action`}
                  >
                    {label}
                  </button>
                ) : (
                  <span className={chipClass}>{label}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
