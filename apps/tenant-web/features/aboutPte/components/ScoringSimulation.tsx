"use client";

import { useState, type ReactElement } from "react";
import { TabPanel, Tabs } from "@pte/ui";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { ScoreLab } from "./_ScoreLab";
import { SimulatorBand } from "./_SimulatorBand";
import { StepSimulation } from "./_StepSimulation";

const MODES = ["lab", "steps"] as const;
type Mode = (typeof MODES)[number];

export const ScoringSimulation = (): ReactElement => {
  const copy = useAboutPteCopy();
  const text = copy.simulation;
  const [mode, setMode] = useState<Mode>("lab");
  const items = MODES.map((id) => ({ id, label: text.modes[id] }));
  return (
    <section id="simulation" aria-labelledby="simulation-title" className="scroll-mt-24">
      <SimulatorBand />
      <div id="simulation-lab" className={`${ABOUT_PTE_LAYOUT.container} scroll-mt-24 py-12`}>
        <p className="mb-6 max-w-3xl text-sm leading-7 text-[var(--ink-secondary)]">{text.intro}</p>
        <Tabs
          items={items}
          value={mode}
          onChange={(value) => setMode(value === "steps" ? "steps" : "lab")}
          ariaLabel={text.title}
          id="simulation-mode"
        />
        <TabPanel id="simulation-lab-panel" active={mode === "lab"} keepMounted className="mt-6">
          <ScoreLab copy={copy} />
        </TabPanel>
        <TabPanel id="simulation-steps" active={mode === "steps"} keepMounted className="mt-6">
          <StepSimulation copy={copy} />
        </TabPanel>
      </div>
    </section>
  );
};
