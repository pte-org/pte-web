"use client";

import { useState, type ReactElement } from "react";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import type { CompareView } from "../constants/compareViews";
import { useAboutPteCopy, useAboutPteExtras, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { ComparisonFilter } from "./_ComparisonFilter";
import { ComparisonMatrix } from "./_ComparisonMatrix";
import { ScoreConversion } from "./_ScoreConversion";
import { SourceRefs } from "./_SourceRefs";

export const ComparisonTable = (): ReactElement => {
  const copy = useAboutPteCopy();
  const landing = useAboutPteLanding();
  const extras = useAboutPteExtras();
  const [view, setView] = useState<CompareView>("all");
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
          <SourceRefs ids={src} label={copy.sourceLabel} collapsedLabel={extras.sources.link(src.length)} />
        </>
      }
    >
      <ComparisonFilter value={view} onChange={setView} />
      <ComparisonMatrix copy={copy} landing={landing} view={view} />
      <ScoreConversion />
      <h3 className="mt-10 text-center text-lg font-bold text-[var(--home-navy)]">{guideTitle}</h3>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {guide.map((item) => (
          <li key={item.test} className={`${THEMED_CARD} p-5 shadow-sm`}>
            <p className="font-bold text-[var(--home-navy)]">{item.test}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-secondary)]">{item.when}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-xs text-[var(--ink-muted)]">{guideNote}</p>
    </AboutSection>
  );
};
