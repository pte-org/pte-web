import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { STANDARD_TASK_WEIGHTS, type SectionKey } from "../constants/scoringWeights";
import { ScoringRuleCard } from "./_ScoringRuleCard";

interface ScoringRulesProps {
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

const SECTIONS: readonly SectionKey[] = ["speakingWriting", "reading", "listening"];

/** The official scoring rule of all 22 question types as cards, grouped by exam part. */
export const ScoringRules = ({ copy, locale }: ScoringRulesProps): ReactElement => (
  <div className="space-y-10">
    {SECTIONS.map((section, index) => (
      <div key={section}>
        <div className="mb-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold tabular-nums text-action">{`0${index + 1}`}</span>
          <h4 className="text-lg font-semibold text-[var(--ink-primary)]">{copy.sections[section]}</h4>
        </div>
        <ul className="grid gap-4 lg:grid-cols-2">
          {STANDARD_TASK_WEIGHTS.filter((task) => task.section === section).map((task) => (
            <ScoringRuleCard key={task.key} task={task} copy={copy} locale={locale} />
          ))}
        </ul>
      </div>
    ))}
  </div>
);
