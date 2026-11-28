"use client";

import type { ReactElement, ReactNode } from "react";
import { Badge, HeadphoneIcon, MicIcon, useLocale } from "@pte/ui";
import { SKILL_CHIPS, THEMED_CARD } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { OFFICIAL_RULES } from "../constants/officialScoring";
import { contributingSkills, STANDARD_TASK_WEIGHTS } from "../constants/scoringWeights";
import { TASK_GUIDE } from "../constants/taskGuide";
import { useAboutPteCopy, useAboutPteExtras, useAboutPteGuide } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

/** Pearson test-format pages the on-screen details and timings come from (Speaking & Writing, Listening). */
const SAMPLE_SOURCES = [17, 18] as const;

/** Bar heights of the sample chart, as Tailwind classes so no inline style is needed. */
const BAR_HEIGHTS = ["h-10", "h-16", "h-12", "h-20"] as const;

/** The status box Pearson shows while speaking: a label and a bar that fills as the time runs out. */
const RecordingBar = ({ label }: { label: string }): ReactElement => (
  <div className="mt-3 rounded-lg bg-[var(--blush-tint)] px-3 py-2 text-xs font-semibold text-[var(--blush-action)]">
    <span className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      <MicIcon className="h-4 w-4" />
      {label}
    </span>
    <span className="mt-2 block h-1.5 rounded-full bg-white/70">
      <span className="block h-full w-2/5 rounded-full bg-current" />
    </span>
  </div>
);

interface SampleCardProps {
  taskKey: string;
  mock: ReactNode;
  timing: string;
}

/** One question type: a drawn-up screen, what the candidate does, and the traits it is scored on. */
const SampleCard = ({ taskKey, mock, timing }: SampleCardProps): ReactElement => {
  const copy = useAboutPteCopy();
  const guide = useAboutPteGuide();
  const { locale } = useLocale();
  const task = STANDARD_TASK_WEIGHTS.find((entry) => entry.key === taskKey);
  const skills = task ? contributingSkills(task) : [];
  const traits = OFFICIAL_RULES[taskKey].traits.map((trait) => trait.name);
  return (
    <li className={`${THEMED_CARD} flex flex-col p-5 shadow-sm`}>
      <div className="flex min-h-7 items-center justify-between gap-2">
        <h3 className="font-bold text-[var(--home-navy)]">{TASK_NAMES[taskKey]}</h3>
        {skills.length > 1 && (
          <Badge variant="info" className="px-2 py-0.5 before:hidden">
            {copy.basics.integrated}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm leading-6 text-[var(--ink-secondary)]">{TASK_GUIDE[taskKey][locale === "vi" ? "vi" : "en"]}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">{guide.samples.onScreen}</p>
      <div className="mt-2 flex-1 rounded-xl border border-dashed border-[var(--control-border)] bg-[var(--surface-subtle)] p-4">{mock}</div>
      <p className="mt-3 text-xs leading-5 text-[var(--ink-secondary)]">
        <span className="font-semibold text-[var(--ink-primary)]">{`${guide.samples.timingLabel}: `}</span>
        {timing}
      </p>
      <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-[var(--ink-secondary)]">
        <span className="font-semibold text-[var(--ink-primary)]">{`${guide.samples.scoredOn}:`}</span>
        {traits.join(" · ")}
      </p>
      <p className="mt-2 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span key={skill} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${SKILL_CHIPS[skill]}`}>
            {copy.skills[skill]}
          </span>
        ))}
      </p>
    </li>
  );
};

/** Three drawn-up questions so a newcomer can picture the screen: speaking, speaking about a picture, listening-and-typing. */
export const SampleQuestions = (): ReactElement => {
  const { samples } = useAboutPteGuide();
  const copy = useAboutPteCopy();
  const extras = useAboutPteExtras();
  return (
    <AboutSection
      id="samples"
      eyebrow={samples.pill}
      title={samples.title}
      intro={
        <>
          {samples.intro}
          <SourceRefs ids={SAMPLE_SOURCES} label={copy.sourceLabel} collapsedLabel={extras.sources.link(SAMPLE_SOURCES.length)} />
        </>
      }
      centered
    >
      <ul className="grid gap-4 lg:grid-cols-3">
        <SampleCard
          taskKey="READ_ALOUD"
          timing={samples.readAloud.timing}
          mock={
            <>
              <p className="text-sm leading-6 text-[var(--ink-primary)]">{samples.readAloud.passage}</p>
              <RecordingBar label={samples.readAloud.recording} />
            </>
          }
        />
        <SampleCard
          taskKey="DESCRIBE_IMAGE"
          timing={samples.describeImage.timing}
          mock={
            <>
              <p className="text-xs font-semibold text-[var(--ink-primary)]">{samples.describeImage.chartTitle}</p>
              <div className="mt-2 flex h-24 items-end gap-3 border-b border-l border-[var(--control-border)] px-3">
                {samples.describeImage.months.map((month, index) => (
                  <span key={month} className="flex flex-1 flex-col items-center gap-1">
                    <span className={`w-full rounded-t bg-action ${BAR_HEIGHTS[index]}`} />
                  </span>
                ))}
              </div>
              <div className="flex gap-3 px-3 pt-1 text-center text-xs text-[var(--ink-muted)]">
                {samples.describeImage.months.map((month) => (
                  <span key={month} className="flex-1">
                    {month}
                  </span>
                ))}
              </div>
              <RecordingBar label={samples.describeImage.recording} />
            </>
          }
        />
        <SampleCard
          taskKey="WRITE_FROM_DICTATION"
          timing={samples.dictation.timing}
          mock={
            <>
              {/* The audio starts by itself and cannot be replayed, so it is a status bar, not a play button. */}
              <div className="rounded-lg bg-[var(--surface-card)] px-3 py-2 text-xs font-semibold text-action shadow-sm">
                <span className="flex items-center gap-2">
                  <HeadphoneIcon className="h-4 w-4" />
                  {samples.dictation.playing}
                </span>
                <span className="mt-2 block h-1.5 rounded-full bg-[var(--action-tint)]">
                  <span className="block h-full w-3/5 rounded-full bg-action" />
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold text-[var(--ink-muted)]">{samples.dictation.answerBox}</p>
              <p className="mt-1 rounded-lg border border-[var(--control-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)]">
                {samples.dictation.typed}
                <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-[var(--ink-primary)]" aria-hidden="true" />
              </p>
            </>
          }
        />
      </ul>
    </AboutSection>
  );
};
