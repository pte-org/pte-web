"use client";

import type { ReactElement } from "react";
import { Drawer } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { OUTCOME_TONES } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { OFFICIAL_RULES } from "../constants/officialScoring";
import { traitInfoFor, type TraitLevel } from "../constants/traitLevels";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";
import { GATED_TRAITS, ruleFormula } from "./_RuleDetail";

export interface TraitDetailTarget {
  taskKey: string;
  trait: string;
}

interface TraitDrawerProps {
  target: TraitDetailTarget | null;
  onChange: (target: TraitDetailTarget) => void;
  onClose: () => void;
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

const NEUTRAL_TONE = "border-[var(--shell-border)] bg-[var(--surface-subtle)] text-[var(--ink-secondary)]";

/** Best levels green, middle ones amber, the lowest grey, or rose when scoring it zeroes the whole item. */
const levelTone = (index: number, count: number, isGateZero: boolean): string => {
  if (isGateZero) return OUTCOME_TONES.wrong;
  if (index === count - 1 && count > 1) return NEUTRAL_TONE;
  return index / Math.max(count - 1, 1) <= 0.34 ? OUTCOME_TONES.correct : OUTCOME_TONES.partial;
};

/** Side panel with the score levels of one question type, one tab per trait so a single scale is read at a time. */
export const TraitDrawer = ({ target, onChange, onClose, copy, locale }: TraitDrawerProps): ReactElement => {
  const { scoringRules } = useAboutPteExtras();
  const { flow } = copy;
  const rule = target ? OFFICIAL_RULES[target.taskKey] : null;
  const traits = rule ? rule.traits.filter((trait) => traitInfoFor(target!.taskKey, trait.name)) : [];
  const selected = traits.find((trait) => trait.name === target?.trait) ?? traits[0];
  const info = target && selected ? traitInfoFor(target.taskKey, selected.name) : null;
  const formula = target ? ruleFormula(target.taskKey, flow.itemFormula) : null;
  return (
    <Drawer
      open={target !== null}
      onClose={onClose}
      title={target ? TASK_NAMES[target.taskKey] : ""}
      description={rule ? flow.pageRef(rule.page) : undefined}
    >
      {target && rule && selected && info && (
        <div className="space-y-5">
          <p className="text-sm text-[var(--ink-primary)]">{rule[locale]}</p>
          {formula && (
            <p className="rounded-md bg-[var(--surface-subtle)] px-2 py-1 font-mono text-xs text-[var(--ink-primary)]">{formula}</p>
          )}
          {/* Wrapping pills rather than Tabs: Write Essay has 7 traits, and a scrolling row would hide the selected one. */}
          <div role="tablist" aria-label={scoringRules.traitTabs} className="flex flex-wrap gap-2">
            {traits.map((trait) => (
              <button
                key={trait.name}
                type="button"
                role="tab"
                aria-selected={trait.name === selected.name}
                onClick={() => onChange({ taskKey: target.taskKey, trait: trait.name })}
                className={`min-h-9 rounded-full px-3 text-sm font-medium transition-colors ${
                  trait.name === selected.name
                    ? "bg-action text-white"
                    : "bg-[var(--surface-subtle)] text-[var(--ink-secondary)] hover:bg-[var(--action-tint)] hover:text-action"
                }`}
              >
                {rule.gate && GATED_TRAITS.has(trait.name) && (
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-rose-500 align-middle" aria-hidden="true" />
                )}
                {`${trait.name} (0–${trait.max})`}
                {rule.gate && GATED_TRAITS.has(trait.name) && <span className="sr-only">{`, ${flow.gate}`}</span>}
              </button>
            ))}
          </div>
          <p className="text-sm text-[var(--ink-secondary)]">
            <span className="font-medium text-[var(--ink-primary)]">{`${flow.measures}: `}</span>
            {info.meaning[locale]}
          </p>
          <ul className="divide-y divide-[var(--shell-border)] text-sm">
            {info.levels.map((level: TraitLevel, index: number) => {
              const isGateZero = rule.gate && GATED_TRAITS.has(selected.name) && level.score === "0";
              return (
                <li key={level.score} className="flex items-start gap-3 py-2.5">
                  <span
                    className={`w-14 shrink-0 rounded-md border px-2 py-0.5 text-center font-bold tabular-nums ${levelTone(index, info.levels.length, isGateZero)}`}
                  >
                    {level.score}
                  </span>
                  <span className="min-w-0 text-[var(--ink-primary)]">
                    {level.label && <span className="mr-1 font-semibold">{`${level.label} —`}</span>}
                    {level.text[locale]}
                    {isGateZero && <span className="mt-1 block text-xs font-semibold text-[var(--blush-action)]">{scoringRules.wholeItemZero}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Drawer>
  );
};
