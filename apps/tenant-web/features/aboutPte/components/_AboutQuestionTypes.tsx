"use client";

import { useState, type ReactElement } from "react";
import { Badge, BookOpenIcon, Button, ChevronDownIcon, HeadphoneIcon, MicIcon, useLocale } from "@pte/ui";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { PART_ACCENT } from "../constants/partTones";
import { TASK_NAMES } from "../constants/miniExam";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SectionKey } from "../constants/scoringWeights";
import { TASK_GUIDE } from "../constants/taskGuide";
import { useAboutPteCopy, useAboutPteExtras, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";
import { TaskGuide } from "./_TaskGuide";

const SCORE_GUIDE_SOURCE = [14] as const;

const PARTS: readonly { key: SectionKey; Icon: typeof MicIcon; tone: string }[] = [
  { key: "speakingWriting", Icon: MicIcon, tone: "bg-[var(--sky-tint)] text-[var(--sky-action)]" },
  { key: "reading", Icon: BookOpenIcon, tone: "bg-[var(--brand-tint)] text-[var(--brand-ink)]" },
  { key: "listening", Icon: HeadphoneIcon, tone: "bg-[var(--cream-tint)] text-[var(--cream-action)]" },
];

/** The position of a type within its part, written 01, 02, … */
const rowNumber = (index: number): string => String(index + 1).padStart(2, "0");

/** Three part cards listing their question types, each closed by the length of the part; full descriptions on demand. */
export const AboutQuestionTypes = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { types } = useAboutPteLanding();
  const { parts } = useAboutPteExtras();
  const { locale } = useLocale();
  const lang = locale === "vi" ? "vi" : "en";
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AboutSection id="basics" eyebrow={types.pill} title={types.title} intro={types.intro} tone="tint" centered>
      <ul className="grid gap-4 lg:grid-cols-3">
        {PARTS.map(({ key, Icon, tone }) => {
          const tasks = STANDARD_TASK_WEIGHTS.filter((task) => task.section === key);
          return (
            <li key={key} className={`${THEMED_CARD} flex flex-col overflow-hidden p-5 pb-0 shadow-sm`}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-bold text-[var(--home-navy)]">{copy.sections[key]}</span>
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
                  {copy.basics.typeCount(tasks.length)}
                </span>
              </div>
              <ul className="mt-4 flex-1 divide-y divide-[var(--shell-border)]">
                {tasks.map((task, index) => (
                  <li
                    key={task.key}
                    title={TASK_GUIDE[task.key][lang]}
                    className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-[var(--surface-subtle)]"
                  >
                    <span className={`w-5 shrink-0 pt-0.5 text-xs font-semibold tabular-nums ${PART_ACCENT[key]}`}>{rowNumber(index)}</span>
                    <span className="flex flex-1 items-start justify-between gap-2 text-[var(--ink-primary)]">
                      <span>{TASK_NAMES[task.key]}</span>
                      {contributingSkills(task).length > 1 && (
                        <Badge variant="info" className="shrink-0 px-2 py-0.5 before:hidden">
                          {copy.basics.integrated}
                        </Badge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="-mx-5 mt-4 border-t border-[var(--shell-border)] bg-[var(--surface-subtle)] px-5 py-3 text-xs font-medium text-[var(--ink-secondary)]">
                {parts[key]}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-center text-xs text-[var(--ink-muted)]">
        {parts.note}
        <SourceRefs ids={SCORE_GUIDE_SOURCE} label={copy.sourceLabel} collapsedLabel={parts.sourceLink} />
      </p>
      <div className="mt-6 flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          rightIcon={<ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />}
        >
          {isOpen ? types.hideDetails : types.showDetails}
        </Button>
      </div>
      {isOpen && (
        <div className="mt-6">
          <TaskGuide copy={copy} locale={lang} closeLabel={types.hideDetails} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </AboutSection>
  );
};
