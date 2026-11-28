"use client";

import { useState, type ReactElement } from "react";
import { Badge, Button, ChevronDownIcon, Tabs } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_CHIPS, THEMED_CARD } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { PART_ACCENT } from "../constants/partTones";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SectionKey } from "../constants/scoringWeights";
import { TASK_GUIDE } from "../constants/taskGuide";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";

interface TaskGuideProps {
  copy: AboutPteCopy;
  locale: "en" | "vi";
  /** Text of the button that closes the guide, repeated below the last card so nobody scrolls back up to close it. */
  closeLabel: string;
  onClose: () => void;
}

type PartFilter = "all" | SectionKey;

const SECTIONS: readonly SectionKey[] = ["speakingWriting", "reading", "listening"];

/** The 22 question types as cards, grouped by exam part: what the candidate does and which skills it feeds. */
export const TaskGuide = ({ copy, locale, closeLabel, onClose }: TaskGuideProps): ReactElement => {
  const { taskGuide } = useAboutPteExtras();
  const [filter, setFilter] = useState<PartFilter>("all");
  const [integratedOnly, setIntegratedOnly] = useState(false);
  const isShown = (section: SectionKey, skillCount: number): boolean =>
    (filter === "all" || filter === section) && (!integratedOnly || skillCount > 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Tabs
          variant="segmented"
          ariaLabel={taskGuide.filterLabel}
          value={filter}
          onChange={(next) => setFilter(next as PartFilter)}
          items={[
            { id: "all", label: taskGuide.all(STANDARD_TASK_WEIGHTS.length) },
            ...SECTIONS.map((section) => ({ id: section, label: copy.sections[section] })),
          ]}
        />
        <button
          type="button"
          aria-pressed={integratedOnly}
          onClick={() => setIntegratedOnly((current) => !current)}
          className={`min-h-9 rounded-full px-4 text-sm font-medium transition-colors ${
            integratedOnly
              ? "bg-action text-white"
              : "bg-[var(--surface-subtle)] text-[var(--ink-secondary)] hover:bg-[var(--action-tint)] hover:text-action"
          }`}
        >
          {taskGuide.integratedOnly}
        </button>
      </div>
      {SECTIONS.map((section, index) => {
        const tasks = STANDARD_TASK_WEIGHTS.filter((task) => task.section === section);
        const shown = tasks.filter((task) => isShown(section, contributingSkills(task).length));
        if (shown.length === 0) return null;
        return (
          <div key={section}>
            <div className="mb-4 flex items-center gap-3">
              <span className={`text-3xl font-bold tabular-nums ${PART_ACCENT[section]}`}>{`0${index + 1}`}</span>
              <h4 className="text-lg font-semibold text-[var(--ink-primary)]">{copy.sections[section]}</h4>
              <span className="text-sm text-[var(--ink-muted)]">{copy.basics.typeCount(tasks.length)}</span>
              <span className="h-px flex-1 bg-[var(--shell-border)]" aria-hidden="true" />
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((task) => {
                const skills = contributingSkills(task);
                return (
                  <li
                    key={task.key}
                    className={`${THEMED_CARD} flex flex-col p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-semibold leading-snug">{TASK_NAMES[task.key]}</h5>
                      {skills.length > 1 && (
                        <Badge variant="info" className="shrink-0 px-2 py-0.5 before:hidden">
                          {copy.basics.integrated}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-6 text-[var(--ink-secondary)]">{TASK_GUIDE[task.key][locale]}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="sr-only">{copy.basics.feeds}</span>
                      {skills.map((skill) => (
                        <span key={skill} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${SKILL_CHIPS[skill]}`}>
                          {copy.skills[skill]}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          rightIcon={<ChevronDownIcon className="h-4 w-4 rotate-180" />}
        >
          {closeLabel}
        </Button>
      </div>
    </div>
  );
};
