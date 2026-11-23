"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Badge, Button } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_CHIPS, THEMED_CARD } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { OFFICIAL_RULES, type ScoringKind } from "../constants/officialScoring";
import { contributingSkills, type TaskWeight } from "../constants/scoringWeights";
import { RuleDetail } from "./_RuleDetail";
import { TraitDetails } from "./_TraitDetails";

interface ScoringRuleCardProps {
  task: TaskWeight;
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

const SCORE_GUIDE_SOURCE_ID = 14;
const KIND_VARIANT: Record<ScoringKind, "neutral" | "info" | "warning"> = {
  correct: "neutral",
  partial: "info",
  trait: "warning",
};

/** One question type: header (name, scoring kind, skills, page), the rule, and the level details on demand. */
export const ScoringRuleCard = ({ task, copy, locale }: ScoringRuleCardProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const rule = OFFICIAL_RULES[task.key];
  const { flow } = copy;
  return (
    <li className={`${THEMED_CARD} flex flex-col p-5 ${isOpen ? "lg:col-span-2" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h5 className="text-base font-semibold">{TASK_NAMES[task.key]}</h5>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={KIND_VARIANT[rule.kind]}>{flow.kinds[rule.kind]}</Badge>
            {contributingSkills(task).map((skill) => (
              <span key={skill} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${SKILL_CHIPS[skill]}`}>
                {copy.skills[skill]}
              </span>
            ))}
          </div>
        </div>
        <Link
          href={`#source-${SCORE_GUIDE_SOURCE_ID}`}
          className="shrink-0 text-xs text-[var(--ink-muted)] hover:text-action hover:underline"
        >
          {flow.pageRef(rule.page)}
        </Link>
      </div>
      <div className="mt-4 flex-1 text-sm">
        <RuleDetail taskKey={task.key} copy={copy} locale={locale} />
      </div>
      {rule.traits.length > 0 && (
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
            {isOpen ? flow.hideLevels : flow.showLevels}
          </Button>
        </div>
      )}
      {isOpen && (
        <div className="mt-4 border-t border-[var(--shell-border)] pt-4">
          <TraitDetails taskKey={task.key} copy={copy} locale={locale} />
        </div>
      )}
    </li>
  );
};
