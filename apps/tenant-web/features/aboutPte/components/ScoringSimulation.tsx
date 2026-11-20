"use client";

import { useState, type ReactElement } from "react";
import { TabPanel, Tabs } from "@pte/ui";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { ScoreLab } from "./_ScoreLab";
import { StepSimulation } from "./_StepSimulation";

const MODES = ["lab", "steps"] as const;
type Mode = (typeof MODES)[number];

export const ScoringSimulation = (): ReactElement => {
  const copy = useAboutPteCopy();
  const text = copy.simulation;
  const [mode, setMode] = useState<Mode>("lab");
  const items = MODES.map((id) => ({ id, label: text.modes[id] }));
  return (
    <AboutSection id="simulation" title={text.title}>
      <p className={ABOUT_PTE_LAYOUT.muted}>{text.intro}</p>
      <div className="mt-6">
        <Tabs
          items={items}
          value={mode}
          onChange={(value) => setMode(value === "steps" ? "steps" : "lab")}
          ariaLabel={text.title}
          id="simulation-mode"
        />
      </div>
      <TabPanel id="simulation-lab" active={mode === "lab"} keepMounted className="mt-6">
        <ScoreLab copy={copy} />
      </TabPanel>
      <TabPanel id="simulation-steps" active={mode === "steps"} keepMounted className="mt-6">
        <StepSimulation copy={copy} />
      </TabPanel>
    </AboutSection>
  );
};
