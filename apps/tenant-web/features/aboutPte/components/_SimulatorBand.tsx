"use client";

import type { ReactElement } from "react";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteLanding } from "../hooks/useAboutPteCopy";

/** Heading of the score lab. The lab starts right below it, so there is no teaser or button in between. */
export const SimulatorBand = (): ReactElement => {
  const { simulator } = useAboutPteLanding();
  return (
    <div className={`${ABOUT_PTE_LAYOUT.container} pt-14 text-center lg:pt-20`}>
      <header className="mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--action-tint)] px-3 py-1 text-xs font-semibold text-action">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {simulator.pill}
        </span>
        <h2 id="simulation-title" className="mt-3 text-2xl font-bold tracking-tight text-[var(--home-navy)] sm:text-3xl">
          {simulator.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-secondary)]">{simulator.text}</p>
      </header>
    </div>
  );
};
