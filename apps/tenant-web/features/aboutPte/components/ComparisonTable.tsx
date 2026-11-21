"use client";

import type { ReactElement } from "react";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { ComparisonMatrix } from "./_ComparisonMatrix";
import { SourceRefs } from "./_SourceRefs";

/** Accent per guide card, matching the test monograms in the matrix header. */
const GUIDE_TONES = [
  "border-t-action",
  "border-t-[var(--blush-action)]",
  "border-t-[var(--mint-action)]",
  "border-t-[var(--cream-action)]",
];

export const ComparisonTable = (): ReactElement => {
  const copy = useAboutPteCopy();
  const landing = useAboutPteLanding();
  const { caption, src, guideTitle, guide, guideNote } = copy.comparison;
  return (
    <AboutSection
      id="comparison"
      eyebrow={landing.compare.pill}
      title={landing.compare.title}
      tone="tint"
      centered
      intro={
        <>
          {`${landing.compare.intro} ${caption}`}
          <SourceRefs ids={src} label={copy.sourceLabel} />
        </>
      }
    >
      <ComparisonMatrix copy={copy} landing={landing} />
      <h3 className="mt-10 text-center text-lg font-bold text-[var(--home-navy)]">{guideTitle}</h3>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {guide.map((item, index) => (
          <li key={item.test} className={`${THEMED_CARD} border-t-4 p-5 shadow-sm ${GUIDE_TONES[index]}`}>
            <p className="font-bold text-[var(--home-navy)]">{item.test}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-secondary)]">{item.when}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-xs text-[var(--ink-muted)]">{guideNote}</p>
    </AboutSection>
  );
};
