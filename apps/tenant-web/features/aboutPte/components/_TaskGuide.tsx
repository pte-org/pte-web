import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_CHIPS, THEMED_CARD } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SectionKey } from "../constants/scoringWeights";
import { TASK_GUIDE } from "../constants/taskGuide";

interface TaskGuideProps {
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

const SECTIONS: readonly SectionKey[] = ["speakingWriting", "reading", "listening"];

/** The 22 question types as cards, grouped by exam part: what the candidate does and which skills it feeds. */
export const TaskGuide = ({ copy, locale }: TaskGuideProps): ReactElement => (
  <div className="space-y-10">
    {SECTIONS.map((section, index) => {
      const tasks = STANDARD_TASK_WEIGHTS.filter((task) => task.section === section);
      return (
        <div key={section}>
          <div className="mb-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold tabular-nums text-action">{`0${index + 1}`}</span>
            <h4 className="text-lg font-semibold text-[var(--ink-primary)]">{copy.sections[section]}</h4>
            <span className="text-sm text-[var(--ink-muted)]">{copy.basics.typeCount(tasks.length)}</span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => {
              const skills = contributingSkills(task);
              return (
                <li
                  key={task.key}
                  className={`${THEMED_CARD} flex flex-col p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold leading-snug">{TASK_NAMES[task.key]}</h5>
                    {skills.length > 1 && (
                      <span className="shrink-0 rounded-full border border-action px-2 py-0.5 text-xs font-semibold text-action">
                        {copy.basics.integrated}
                      </span>
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
  </div>
);
