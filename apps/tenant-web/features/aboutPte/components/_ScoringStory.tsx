"use client";

import type { ReactElement } from "react";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { useActiveStep } from "../hooks/useActiveStep";
import { StoryVisual } from "./_StoryVisual";

interface ScoringStoryProps {
  copy: AboutPteCopy;
}

/** Scrollytelling: the four scoring layers on the left, one sticky visual on the right that follows the reader. */
export const ScoringStory = ({ copy }: ScoringStoryProps): ReactElement => {
  const steps = copy.flow.steps;
  const { active, register } = useActiveStep(steps.length);
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <ol className="space-y-6 lg:space-y-0">
        {steps.map((step, index) => (
          <li
            key={step.title}
            ref={register(index)}
            className={`rounded-2xl border-l-4 p-5 transition-colors duration-300 lg:flex lg:min-h-[60vh] lg:flex-col lg:justify-center ${
              index === active ? "border-l-action" : "border-l-slate-200 lg:opacity-50"
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-action">
              {`${index + 1} / ${steps.length}`}
            </span>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{step.title}</h3>
            <p className="mt-3 text-base leading-7 text-slate-600">{step.text}</p>
            <div className="mt-5 lg:hidden">
              <StoryVisual step={index} copy={copy} />
            </div>
          </li>
        ))}
      </ol>
      <div className="hidden lg:block">
        <div className="sticky top-32">
          <StoryVisual step={active} copy={copy} />
        </div>
      </div>
    </div>
  );
};
