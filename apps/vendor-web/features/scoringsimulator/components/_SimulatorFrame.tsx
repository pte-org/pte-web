"use client";

import type { ReactElement, ReactNode } from "react";

export const SIMULATOR_TABS_ID = "scoring-simulator-skill-tabs";

interface SimulatorFrameProps {
  /** The top toolbar controls (Task Type, Version, and Quick Actions) */
  controls?: ReactNode;
  /** The calculated result panel, shown in the right column (~40%) */
  result: ReactNode;
  /** The input form, shown in the left column (~60%) */
  children: ReactNode;
}

/** The simulator layout: Left column inputs (~60%), right column sticky live results (~40%). */
export const SimulatorFrame = ({ controls, result, children }: SimulatorFrameProps): ReactElement => (
  <div className="flex flex-col gap-5">
    {controls && (
      <div className="sticky -top-4 z-10 -mx-5 -mt-4 border-b border-[var(--shell-border)] bg-[var(--surface-card)] px-5 py-3 shadow-2xs">
        {controls}
      </div>
    )}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start">
      <div className="min-w-0 space-y-5">{children}</div>
      <div className="lg:sticky lg:top-24 space-y-4">{result}</div>
    </div>
  </div>
);
