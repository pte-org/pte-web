"use client";

import { useId, useState, type ReactElement } from "react";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import {
  PTE_SCORE_DEFAULT,
  PTE_SCORE_EXAMPLES,
  PTE_SCORE_MAX,
  PTE_SCORE_MIN,
} from "../constants/scoreConversion";
import { useAboutPteCopy, useAboutPteExtras } from "../hooks/useAboutPteCopy";
import { cefrLevelFor, clampPteScore, formatIeltsBand, ieltsBandFor } from "../utils/scoreConversion";
import { SourceRefs } from "./_SourceRefs";

const CONVERSION_SOURCES = [15, 16] as const;

const Result = ({ label, value }: { label: string; value: string }): ReactElement => (
  <div className="rounded-xl bg-[var(--surface-subtle)] px-4 py-3 text-center">
    <dt className="text-xs text-[var(--ink-muted)]">{label}</dt>
    <dd className="mt-1 text-2xl font-bold tabular-nums text-[var(--home-navy)]">{value}</dd>
  </div>
);

/** A PTE score slider that shows the matching IELTS band and CEFR level, using Pearson's published tables. */
export const ScoreConversion = (): ReactElement => {
  const { conversion } = useAboutPteExtras();
  const { sourceLabel } = useAboutPteCopy();
  const sliderId = useId();
  const [score, setScore] = useState(PTE_SCORE_DEFAULT);
  const band = ieltsBandFor(score);
  return (
    <div className={`${THEMED_CARD} mt-8 p-6 shadow-sm`}>
      <h3 className="text-lg font-bold text-[var(--home-navy)]">{conversion.title}</h3>
      <p className="mt-1 text-sm leading-6 text-[var(--ink-secondary)]">
        {conversion.intro}
        <SourceRefs ids={CONVERSION_SOURCES} label={sourceLabel} />
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <label htmlFor={sliderId} className="text-sm font-semibold text-[var(--ink-primary)]">
          {conversion.sliderLabel}
        </label>
        {PTE_SCORE_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setScore(example)}
            aria-pressed={score === example}
            className={`min-h-8 rounded-full px-3 text-xs font-semibold transition-colors ${
              score === example
                ? "bg-action text-white"
                : "bg-[var(--action-tint)] text-action hover:bg-[var(--action-tint-hover)]"
            }`}
          >
            {example}
          </button>
        ))}
      </div>
      <input
        id={sliderId}
        type="range"
        min={PTE_SCORE_MIN}
        max={PTE_SCORE_MAX}
        step={1}
        value={score}
        onChange={(event) => setScore(clampPteScore(Number(event.target.value)))}
        className="mt-4 w-full accent-[var(--action)]"
      />
      <dl className="mt-4 grid grid-cols-3 gap-3" aria-live="polite">
        <Result label={conversion.pte} value={String(score)} />
        <Result label={conversion.ielts} value={band === null ? conversion.belowIelts : formatIeltsBand(band)} />
        <Result label={conversion.cefr} value={cefrLevelFor(score)} />
      </dl>
      <p className="mt-4 text-xs leading-5 text-[var(--ink-muted)]">{conversion.note}</p>
    </div>
  );
};
