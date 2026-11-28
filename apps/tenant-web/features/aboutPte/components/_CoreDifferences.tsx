"use client";

import type { ReactElement } from "react";
import { ChartBarIcon, ClockIcon, ShapesIcon, SparklesIcon } from "@pte/ui";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";

const ICONS = [SparklesIcon, ClockIcon, ShapesIcon, ChartBarIcon] as const;

/** The four ideas that set PTE apart, each led by one figure and set against IELTS and TOEFL beneath it. */
export const CoreDifferences = (): ReactElement => {
  const { differences } = useAboutPteExtras();
  return (
    <AboutSection id="difference" eyebrow={differences.pill} title={differences.title} intro={differences.intro} centered>
      <ul className="grid gap-4 md:grid-cols-2">
        {differences.cards.map((card, index) => {
          const Icon = ICONS[index];
          return (
            <li
              key={card.title}
              className={`${THEMED_CARD} flex flex-col gap-3 overflow-hidden p-6 pb-0 shadow-sm transition-transform duration-200 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--action-tint)] text-action">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-bold tracking-tight tabular-nums text-action">{card.metric}</span>
              </div>
              <h3 className="text-base font-bold text-[var(--home-navy)]">{card.title}</h3>
              <p className="flex-1 text-sm leading-6 text-[var(--ink-secondary)]">
                <span className="mr-1.5 text-xs font-bold uppercase tracking-wide text-action">{differences.pteLabel}</span>
                {card.pte}
              </p>
              <p className="-mx-6 mt-1 min-h-14 border-t border-[var(--shell-border)] bg-[var(--surface-subtle)] px-6 py-3 text-xs leading-5 text-[var(--ink-secondary)]">
                {card.other.map((entry, position) => (
                  <span key={entry.test}>
                    {position > 0 && <span className="mx-1.5 text-[var(--ink-muted)]">·</span>}
                    <span className="font-semibold text-[var(--ink-primary)]">{`${entry.test}:`}</span> {entry.text}
                  </span>
                ))}
              </p>
            </li>
          );
        })}
      </ul>
    </AboutSection>
  );
};
