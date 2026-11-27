"use client";

import { useState, type ReactElement } from "react";
import { Button } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { StoryVisual } from "./_StoryVisual";

interface ScoringStoryProps {
  copy: AboutPteCopy;
}

/** The four scoring layers as a clickable timeline; the right panel illustrates the selected layer. */
export const ScoringStory = ({ copy }: ScoringStoryProps): ReactElement => {
  const steps = copy.flow.steps;
  const nav = copy.flow.story;
  const [active, setActive] = useState(0);
  const last = steps.length - 1;
  return (
    <div className={`${THEMED_CARD} mt-8 grid overflow-hidden lg:grid-cols-[2fr_3fr]`}>
      <ol className="p-4 sm:p-6">
        {steps.map((step, index) => {
          const isActive = index === active;
          const isDone = index < active;
          return (
            <li key={step.title} className="relative flex gap-4 pb-2 last:pb-0">
              {index < last && (
                <span className={`absolute left-4 top-9 bottom-0 w-0.5 ${isDone ? "bg-action" : "bg-[var(--shell-border)]"}`} />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isActive || isDone ? "bg-action text-white" : "bg-[var(--surface-subtle)] text-[var(--ink-muted)]"
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 pb-4">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-expanded={isActive}
                  className={`text-left font-semibold transition-colors ${isActive ? "text-action" : "text-[var(--ink-primary)] hover:text-action"}`}
                >
                  {step.title}
                </button>
                {isActive && <p className="mt-1 text-sm leading-6 text-[var(--ink-secondary)]">{step.text}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-col justify-between gap-6 border-t border-[var(--shell-border)] bg-[var(--action-tint)] p-6 lg:border-l lg:border-t-0">
        <StoryVisual step={active} copy={copy} />
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={() => setActive(active - 1)} disabled={active === 0}>
            {nav.previous}
          </Button>
          <span className="text-xs font-semibold tabular-nums text-[var(--ink-muted)]">{`${active + 1} / ${steps.length}`}</span>
          <Button size="sm" onClick={() => setActive(active + 1)} disabled={active === last}>
            {nav.next}
          </Button>
        </div>
      </div>
    </div>
  );
};
