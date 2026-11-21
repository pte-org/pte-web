"use client";

import type { ReactElement } from "react";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

/** History timeline next to the recognition list, in one compact band. */
export const AboutBackground = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { background } = useAboutPteLanding();
  return (
    <AboutSection id="history" eyebrow={background.pill} title={background.title}>
      <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
        <div>
          <h3 className="text-lg font-bold text-[var(--home-navy)]">{copy.history.title}</h3>
          <ol className="relative mt-5 space-y-5 border-l-2 border-[var(--action-tint)] pl-6">
            {copy.history.items.map((item) => (
              <li key={item.year} className="relative">
                <span className="absolute -left-8 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-action shadow" />
                <p className="text-sm font-bold text-action">{item.year}</p>
                <p className="text-sm leading-6 text-[var(--ink-secondary)]">
                  {item.text}
                  <SourceRefs ids={item.src} label={copy.sourceLabel} />
                </p>
              </li>
            ))}
          </ol>
        </div>
        <div id="recognition" className="scroll-mt-24">
          <h3 className="text-lg font-bold text-[var(--home-navy)]">{copy.recognition.title}</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {copy.recognition.rows.map((row) => (
              <li key={row.region} className={`${THEMED_CARD} p-4 shadow-sm`}>
                <p className="font-semibold text-[var(--home-navy)]">{row.region}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--ink-secondary)]">
                  {row.text}
                  <SourceRefs ids={row.src} label={copy.sourceLabel} />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AboutSection>
  );
};
