"use client";

import { useState, type ReactElement } from "react";
import { Badge, BookOpenIcon, Button, CheckIcon, ChevronDownIcon, HeadphoneIcon, MicIcon, useLocale } from "@pte/ui";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SectionKey } from "../constants/scoringWeights";
import { TASK_GUIDE } from "../constants/taskGuide";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { TaskGuide } from "./_TaskGuide";

const PARTS: readonly { key: SectionKey; Icon: typeof MicIcon; tone: string }[] = [
  { key: "speakingWriting", Icon: MicIcon, tone: "bg-[var(--sky-tint)] text-[var(--sky-action)]" },
  { key: "reading", Icon: BookOpenIcon, tone: "bg-[var(--brand-tint)] text-[var(--brand-ink)]" },
  { key: "listening", Icon: HeadphoneIcon, tone: "bg-[var(--cream-tint)] text-[var(--cream-action)]" },
];

/** Three part cards with a checklist of their question types; full descriptions on demand. */
export const AboutQuestionTypes = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { types } = useAboutPteLanding();
  const { locale } = useLocale();
  const lang = locale === "vi" ? "vi" : "en";
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AboutSection id="basics" eyebrow={types.pill} title={types.title} intro={types.intro} tone="tint" centered>
      <ul className="grid gap-4 lg:grid-cols-3">
        {PARTS.map(({ key, Icon, tone }) => {
          const tasks = STANDARD_TASK_WEIGHTS.filter((task) => task.section === key);
          return (
            <li key={key} className={`${THEMED_CARD} p-5 shadow-sm`}>
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
              <ul className="mt-4 space-y-2">
                {tasks.map((task) => (
                  <li key={task.key} title={TASK_GUIDE[task.key][lang]} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-action" />
                    <span className="flex flex-1 items-start justify-between gap-2 text-[var(--ink-primary)]">
                      <span>{TASK_NAMES[task.key]}</span>
                      {contributingSkills(task).length > 1 && (
                        <Badge variant="info" className="shrink-0 px-2 py-0.5">
                          {copy.basics.integrated}
                        </Badge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <div className="mt-6">
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
          <TaskGuide copy={copy} locale={lang} />
        </div>
      )}
    </AboutSection>
  );
};
