"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ChevronRightIcon, ProgressBar } from "@pte/ui";
import { ABOUT_PTE_LAYOUT, SKILL_TONES } from "../constants/aboutPteLayout";
import { TASK_NAMES } from "../constants/miniExam";
import { SCORE_FLOOR, SCORE_SPAN, SKILLS } from "../constants/scoringWeights";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { SAMPLE_RESULT } from "../utils/sampleResult";

const TRAITS = [
  { name: "Content", value: "4 / 6" },
  { name: "Pronunciation", value: "3 / 5" },
  { name: "Oral Fluency", value: "2 / 5" },
] as const;

/** Navy teaser band in front of the interactive lab, showing a real sample result. */
export const SimulatorBand = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { simulator } = useAboutPteLanding();
  return (
    <div className="bg-[var(--home-navy)] text-white">
      <div className={`${ABOUT_PTE_LAYOUT.container} grid items-center gap-8 py-12 lg:grid-cols-[1fr_2fr_1fr]`}>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {simulator.pill}
          </span>
          <h2 id="simulation-title" className="mt-3 text-2xl font-bold sm:text-3xl">
            {simulator.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/80">{simulator.text}</p>
          <Link
            href="#simulation-lab"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[var(--home-navy)] transition hover:bg-white/90"
          >
            {simulator.start}
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="col-span-2 rounded-xl border border-white/20 bg-white/5 p-4 sm:col-span-1">
            <p className="text-xs text-white/70">{copy.skills.overall}</p>
            <p className="mt-1 text-4xl font-bold tabular-nums">{SAMPLE_RESULT.overall.score}</p>
            <p className="mt-1 text-xs text-white/60">{simulator.sample}</p>
          </div>
          {SKILLS.map((skill) => {
            const score = SAMPLE_RESULT.skills[skill].score ?? SCORE_FLOOR;
            return (
              <div key={skill} className="rounded-xl bg-white p-3 text-[var(--home-navy)]">
                <p className={`text-xs font-semibold ${SKILL_TONES[skill].text}`}>{copy.skills[skill]}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{score}</p>
                <ProgressBar value={score - SCORE_FLOOR} max={SCORE_SPAN} label={copy.skills[skill]} />
              </div>
            );
          })}
        </div>
        <div className="rounded-xl bg-white p-4 text-[var(--home-navy)]">
          <p className="text-sm font-bold">{TASK_NAMES.DESCRIBE_IMAGE}</p>
          <dl className="mt-3 divide-y divide-[var(--shell-border)] text-sm">
            {TRAITS.map((trait) => (
              <div key={trait.name} className="flex justify-between py-2">
                <dt className="text-[var(--ink-secondary)]">{trait.name}</dt>
                <dd className="font-bold tabular-nums">{trait.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};
