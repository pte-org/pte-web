"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Badge, Button } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_TONES } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { OFFICIAL_RULES, type ScoringKind } from "../constants/officialScoring";
import { contributingSkills, type TaskWeight } from "../constants/scoringWeights";
import { TraitDetails } from "./_TraitDetails";

interface ScoringRuleRowProps {
  task: TaskWeight;
  copy: AboutPteCopy;
  locale: "en" | "vi";
  columnCount: number;
}

const SCORE_GUIDE_SOURCE_ID = 14;
const GATED_TRAITS = new Set(["Content", "Form"]);
const KIND_VARIANT: Record<ScoringKind, "neutral" | "info" | "warning"> = {
  correct: "neutral",
  partial: "info",
  trait: "warning",
};

/** One question type; the second row opens the per-trait level descriptions. */
export const ScoringRuleRow = ({ task, copy, locale, columnCount }: ScoringRuleRowProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const rule = OFFICIAL_RULES[task.key];
  const { flow } = copy;
  return (
    <>
      <tr className="border-t border-slate-100 align-top">
        <td className="px-3 py-2">
          <p className="font-semibold text-slate-900">{TASK_NAMES[task.key]}</p>
          <Button size="sm" variant="ghost" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
            {isOpen ? flow.hideLevels : flow.showLevels}
          </Button>
        </td>
        <td className="px-3 py-2">
          <Badge variant={KIND_VARIANT[rule.kind]}>{flow.kinds[rule.kind]}</Badge>
        </td>
        <td className="px-3 py-2 text-slate-700">
          {rule.traits.map((trait) => (
            <span key={trait.name} className="mr-2 inline-block whitespace-nowrap">
              {`${trait.name} ${trait.max}`}
              {rule.gate && GATED_TRAITS.has(trait.name) && <span className="ml-1 text-rose-600">{`(${flow.gate})`}</span>}
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
      {isOpen && (
        <tr className="bg-slate-50">
          <td colSpan={columnCount} className="px-3 py-3">
            <TraitDetails taskKey={task.key} copy={copy} locale={locale} />
          </td>
        </tr>
      )}
    </>
  );
};
