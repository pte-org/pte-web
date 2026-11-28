"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Badge, Button, ChevronRightIcon } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_CHIPS, THEMED_CARD } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { OFFICIAL_RULES, type ScoringKind } from "../constants/officialScoring";
import { contributingSkills, type TaskWeight } from "../constants/scoringWeights";
import { RuleDetail } from "./_RuleDetail";

interface ScoringRuleCardProps {
  task: TaskWeight;
  copy: AboutPteCopy;
  locale: "en" | "vi";
  /** Span both columns, for the odd card left alone at the end of a row. */
  wide?: boolean;
  /** Opens the score levels, on the given trait's tab when a chip was clicked. */
  onOpenDetail: (trait?: string) => void;
}

const SCORE_GUIDE_SOURCE_ID = 14;
const KIND_VARIANT: Record<ScoringKind, "neutral" | "info" | "warning"> = {
  correct: "neutral",
  partial: "info",
  trait: "warning",
};

/** One question type: header (name, scoring kind, skills, page), the rule, and the level details on demand. */
export const ScoringRuleCard = ({ task, copy, locale, wide = false, onOpenDetail }: ScoringRuleCardProps): ReactElement => {
  const rule = OFFICIAL_RULES[task.key];
  const { flow } = copy;
  return (
    <li className={`${THEMED_CARD} flex flex-col p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
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
        <RuleDetail taskKey={task.key} copy={copy} locale={locale} onSelectTrait={onOpenDetail} />
      </div>
      {rule.traits.length > 0 && (
        <div className="mt-auto pt-4">
          <Button size="sm" variant="secondary" onClick={() => onOpenDetail()} aria-haspopup="dialog" rightIcon={<ChevronRightIcon className="h-4 w-4" />}>
            {flow.showLevels}
          </Button>
        </div>
      )}
    </li>
  );
};
