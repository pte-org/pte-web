"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ChevronRightIcon, CircularProgressChart, ProgressBar } from "@pte/ui";
import { ABOUT_PTE_LAYOUT, SKILL_TONES, THEMED_CARD } from "../constants/aboutPteLayout";
import { HOME_LAYOUT } from "@/features/public/homeConstants";
import { SCORE_FLOOR, SCORE_SPAN, SKILLS } from "../constants/scoringWeights";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { SAMPLE_RESULT } from "../utils/sampleResult";

const toRing = (score: number | null): number => (score ?? SCORE_FLOOR) - SCORE_FLOOR;

const SampleReport = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { hero } = useAboutPteLanding();
  const overall = SAMPLE_RESULT.overall.score;
  return (
    <div className={`${THEMED_CARD} p-6 shadow-xl lg:rotate-1`}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">{hero.resultTitle}</h2>
        <span className="text-xs text-[var(--ink-muted)]">{hero.resultNote}</span>
      </div>
      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        <CircularProgressChart
          value={toRing(overall)}
          max={SCORE_SPAN}
          valueLabel={String(overall ?? "—")}
          ariaLabel={copy.skills.overall}
          caption={copy.skills.overall}
        />
        <ul className="w-full flex-1 space-y-3">
          {SKILLS.map((skill) => {
            const score = SAMPLE_RESULT.skills[skill].score;
            return (
              <li key={skill} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="flex items-center gap-2 text-[var(--ink-secondary)]">
                  <span className={`h-2 w-2 rounded-full ${SKILL_TONES[skill].bg}`} />
                  {copy.skills[skill]}
                </span>
                <ProgressBar value={toRing(score)} max={SCORE_SPAN} label={copy.skills[skill]} />
                <span className="text-right font-bold tabular-nums">{score ?? "—"}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export const AboutHero = (): ReactElement => {
  const { hero } = useAboutPteLanding();
  return (
    <section className="overflow-hidden bg-gradient-to-br from-[var(--action-tint)] via-white to-white">
      <div className={`${ABOUT_PTE_LAYOUT.container} grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20`}>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--action-tint)] px-3 py-1 text-xs font-semibold text-action">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {hero.pill}
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-[var(--home-navy)] sm:text-5xl">
            {hero.title}
            <span className="block text-action">{hero.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--ink-secondary)]">{hero.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#overview" className={HOME_LAYOUT.primaryLink}>
              {hero.explore}
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="#simulation"
              className="inline-flex min-h-11 items-center rounded-lg border border-[var(--shell-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--home-navy)] shadow-sm transition hover:border-action hover:text-action"
            >
              {hero.tryLab}
            </Link>
          </div>
          <dl className="mt-8 flex flex-wrap gap-3">
            {hero.stats.map((stat) => (
              <div key={stat.label} className={`${THEMED_CARD} px-5 py-3 shadow-sm`}>
                <dt className="text-xs text-[var(--ink-muted)]">{stat.label}</dt>
                <dd className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[var(--home-navy)]">{stat.value}</span>
                  <span className="text-xs text-action">{stat.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <SampleReport />
      </div>
    </section>
  );
};
