"use client";

import type { ReactElement } from "react";
import { ChartBarIcon, ClockIcon, GradCapIcon, GridIcon } from "@pte/ui";
import Link from "next/link";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteExtras, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

const STAT_ICONS = [GridIcon, ChartBarIcon, ClockIcon, GradCapIcon] as const;
/** Where each headline number leads: question types and exam length live in the types section, the scale in scoring. */
const STAT_TARGETS = ["basics", "scoring", "basics", "scoring"] as const;
const NUMBER_PREFIX = /^\d+\s*·\s*/;

/** Headline numbers, what PTE is, and the four ideas a newcomer needs. */
export const AboutGlance = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { glance } = useAboutPteLanding();
  const extras = useAboutPteExtras();
  return (
    <AboutSection id="overview" eyebrow={glance.pill} title={glance.title} intro={glance.intro} tone="tint" centered>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {glance.stats.map((stat, index) => {
          const Icon = STAT_ICONS[index];
          return (
            <li key={stat.label}>
              <Link
                href={`#${STAT_TARGETS[index]}`}
                className={`${THEMED_CARD} flex h-full items-center gap-3 p-4 shadow-sm transition hover:-translate-y-0.5 sm:gap-4 sm:p-5 hover:border-action hover:shadow-md`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--action-tint)] text-action">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block whitespace-nowrap text-xl font-bold text-[var(--home-navy)] sm:text-2xl">{stat.value}</span>
                  <span className="text-sm text-[var(--ink-secondary)]">{stat.label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className={`${THEMED_CARD} flex flex-col p-6 shadow-sm`}>
          <h3 className="text-lg font-bold text-[var(--home-navy)]">{copy.what.title}</h3>
          {copy.what.body.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-pretty text-sm leading-7 text-[var(--ink-secondary)]">
              {paragraph}
            </p>
          ))}
          <div className="mt-auto pt-4 text-sm">
            <SourceRefs ids={copy.what.src} label={copy.sourceLabel} collapsedLabel={extras.sources.link(copy.what.src.length)} standalone />
          </div>
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
