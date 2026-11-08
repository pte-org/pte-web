"use client";

import type { ReactElement, ReactNode } from "react";
import { Tabs, type TabItem } from "@pte/ui";

export const SIMULATOR_TABS_ID = "scoring-simulator-skill-tabs";

interface SimulatorFrameProps {
  tabs: readonly TabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** The calculated result, shown under the skill tabs. */
  result: ReactNode;
  children: ReactNode;
}

/** The simulator layout: skill tabs on the left with the result under them, the inputs on the right. */
export const SimulatorFrame = ({ tabs, activeTab, onTabChange, result, children }: SimulatorFrameProps): ReactElement => (
  <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
    <div className="space-y-4">
      <Tabs id={SIMULATOR_TABS_ID} orientation="vertical" items={tabs} value={activeTab} onChange={onTabChange} />
      {result}
    </div>
    <div className="min-w-0">{children}</div>
  </div>
);
