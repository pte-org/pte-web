"use client";

import type { ReactElement } from "react";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteExtras, useAboutPteGuide } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

/** Source 1: Pearson's official PTE Academic page, which all four steps come from. */
const TEST_DAY_SOURCE = [1] as const;

/** The four steps from booking day to sent scores, each stated only as far as Pearson's own page says it. */
export const AboutTestDay = (): ReactElement => {
  const { testDay } = useAboutPteGuide();
  const copy = useAboutPteCopy();
  const extras = useAboutPteExtras();
  return (
    <AboutSection
      id="test-day"
      eyebrow={testDay.pill}
      title={testDay.title}
      intro={
        <>
          {testDay.intro}
          <SourceRefs ids={TEST_DAY_SOURCE} label={copy.sourceLabel} collapsedLabel={extras.sources.link(TEST_DAY_SOURCE.length)} />
        </>
      }
      tone="tint"
      centered
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {testDay.steps.map((step, index) => (
          <li key={step.title} className={`${THEMED_CARD} p-5 shadow-sm`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-action text-sm font-bold text-white">{index + 1}</span>
            <h3 className="mt-3 font-bold text-[var(--home-navy)]">{step.title}</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-secondary)]">{step.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-center text-xs text-[var(--ink-muted)]">{testDay.note}</p>
    </AboutSection>
  );
};
