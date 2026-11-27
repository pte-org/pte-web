"use client";

import type { ReactElement } from "react";
import { ChartBarIcon, ClockIcon, GradCapIcon, GridIcon } from "@pte/ui";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

const STAT_ICONS = [GridIcon, ChartBarIcon, ClockIcon, GradCapIcon] as const;
const NUMBER_PREFIX = /^\d+\s*·\s*/;

/** Headline numbers, what PTE is, and the four ideas a newcomer needs. */
export const AboutGlance = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { glance } = useAboutPteLanding();
  return (
    <AboutSection id="overview" eyebrow={glance.pill} title={glance.title} centered>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {glance.stats.map((stat, index) => {
          const Icon = STAT_ICONS[index];
          return (
            <li key={stat.label} className={`${THEMED_CARD} flex items-center gap-4 p-5 shadow-sm`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--action-tint)] text-action">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-2xl font-bold text-[var(--home-navy)]">{stat.value}</span>
                <span className="text-sm text-[var(--ink-secondary)]">{stat.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold text-[var(--home-navy)]">{copy.what.title}</h3>
          {copy.what.body.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm leading-7 text-[var(--ink-secondary)]">
              {paragraph}
            </p>
          ))}
          <SourceRefs ids={copy.what.src} label={copy.sourceLabel} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--home-navy)]">{glance.conceptsTitle}</h3>
          <ol className="mt-4 space-y-4">
            {copy.basics.concepts.map((concept, index) => (
              <li key={concept.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-action text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[var(--ink-primary)]">
                    {concept.title.replace(NUMBER_PREFIX, "")}
                  </span>
                  <span className="mt-0.5 block text-sm leading-6 text-[var(--ink-secondary)]">{concept.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AboutSection>
  );
};
