"use client";

import { useState, type ReactElement } from "react";
import { Button, ChevronDownIcon, Tabs } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { GATE_CHIP_TONE } from "../constants/aboutPteLayout";
import { OFFICIAL_RULES } from "../constants/officialScoring";
import { PART_ACCENT } from "../constants/partTones";
import { STANDARD_TASK_WEIGHTS, type SectionKey } from "../constants/scoringWeights";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";
import { ScoringRuleCard } from "./_ScoringRuleCard";
import { TraitDrawer, type TraitDetailTarget } from "./_TraitDrawer";
import { ShortRulesTable } from "./_ShortRulesTable";

interface ScoringRulesProps {
  copy: AboutPteCopy;
  locale: "en" | "vi";
  /** Closes the accordion, repeated below the last card so nobody scrolls back up to close it. */
  onCollapse: () => void;
}

type PartFilter = "all" | SectionKey;

const SECTIONS: readonly SectionKey[] = ["speakingWriting", "reading", "listening"];

/** The official scoring rule of all 22 question types as cards, grouped by exam part. */
export const ScoringRules = ({ copy, locale, onCollapse }: ScoringRulesProps): ReactElement => {
  const { scoringRules } = useAboutPteExtras();
  const [filter, setFilter] = useState<PartFilter>("all");
  const [detail, setDetail] = useState<TraitDetailTarget | null>(null);
  return (
    <>
      <div className="space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <Tabs
            variant="segmented"
            ariaLabel={scoringRules.filterLabel}
            value={filter}
            onChange={(next) => setFilter(next as PartFilter)}
            items={[
              { id: "all", label: scoringRules.all(STANDARD_TASK_WEIGHTS.length) },
              ...SECTIONS.map((section) => ({
                id: section,
                label: `${copy.sections[section]} (${STANDARD_TASK_WEIGHTS.filter((task) => task.section === section).length})`,
              })),
            ]}
          />
          <p className="flex items-center gap-2 text-xs text-[var(--ink-secondary)]">
            <span className={`rounded-full border px-2.5 py-0.5 ${GATE_CHIP_TONE}`}>{copy.flow.gate}</span>
            {scoringRules.gateMeaning}
          </p>
        </div>
        {SECTIONS.map((section, index) => {
          if (filter !== "all" && filter !== section) return null;
          const tasks = STANDARD_TASK_WEIGHTS.filter((task) => task.section === section);
          // Rules scored by traits need a card with room to expand; the ones scored by counting read better as table rows.
          const detailed = tasks.filter((task) => OFFICIAL_RULES[task.key].kind === "trait");
          const short = tasks.filter((task) => OFFICIAL_RULES[task.key].kind !== "trait");
          return (
            <div key={section} className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl font-bold tabular-nums ${PART_ACCENT[section]}`}>{`0${index + 1}`}</span>
                <h4 className="text-lg font-semibold text-[var(--ink-primary)]">{copy.sections[section]}</h4>
                <span className="h-px flex-1 self-center bg-[var(--shell-border)]" aria-hidden="true" />
              </div>
              {detailed.length > 0 && (
                <ul className="grid gap-4 lg:grid-cols-2">
                  {detailed.map((task, position) => (
                    <ScoringRuleCard
                      key={task.key}
                      task={task}
                      copy={copy}
                      locale={locale}
                      wide={detailed.length % 2 === 1 && position === detailed.length - 1}
                      onOpenDetail={(trait) => setDetail({ taskKey: task.key, trait: trait ?? "" })}
                    />
                  ))}
                </ul>
              )}
              {short.length > 0 && <ShortRulesTable tasks={short} copy={copy} locale={locale} />}
            </div>
          );
        })}
        <div className="flex justify-center border-t border-[var(--shell-border)] pt-8">
          <Button
            variant="secondary"
            appearance="fill"
            size="lg"
            onClick={onCollapse}
            rightIcon={<ChevronDownIcon className="h-5 w-5 rotate-180" />}
          >
            {scoringRules.collapse}
          </Button>
        </div>
      </div>
      <TraitDrawer target={detail} onChange={setDetail} onClose={() => setDetail(null)} copy={copy} locale={locale} />
    </>
  );
};
