import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILL_TONES } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { contributingSkills, STANDARD_TASK_WEIGHTS, type SectionKey } from "../constants/scoringWeights";
import { TASK_GUIDE } from "../constants/taskGuide";

interface TaskGuideProps {
  copy: AboutPteCopy;
  locale: "en" | "vi";
}

const SECTIONS: readonly SectionKey[] = ["speakingWriting", "reading", "listening"];

/** The 22 question types grouped by exam part: what the candidate does and which skills it feeds. */
export const TaskGuide = ({ copy, locale }: TaskGuideProps): ReactElement => (
  <div className="space-y-6">
    {SECTIONS.map((section, index) => (
      <div key={section}>
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {`${index + 1} · ${copy.sections[section]}`}
        </h4>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {STANDARD_TASK_WEIGHTS.filter((task) => task.section === section).map((task) => (
            <li key={task.key} className="grid gap-2 px-4 py-3 sm:grid-cols-[14rem_1fr_auto] sm:items-center">
              <span className="font-semibold text-slate-900">{TASK_NAMES[task.key]}</span>
              <span className="text-sm text-slate-600">{TASK_GUIDE[task.key][locale]}</span>
              <span className="flex flex-wrap gap-1.5">
                <span className="sr-only">{copy.basics.feeds}</span>
                {contributingSkills(task).map((skill) => (
                  <span
                    key={skill}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${SKILL_TONES[skill].bg}`}
                  >
                    {copy.skills[skill]}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
