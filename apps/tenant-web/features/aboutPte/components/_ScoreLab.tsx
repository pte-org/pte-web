"use client";

import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { PTE_SCORE_EXAMPLES } from "../constants/scoreConversion";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";
import { useScoreLab } from "../hooks/useScoreLab";
import { cefrLevelFor } from "../utils/scoreConversion";
import { LabScoreboard } from "./_LabScoreboard";
import { LabTaskList } from "./_LabTaskList";

interface ScoreLabProps {
  copy: AboutPteCopy;
}

/** Interactive lab: change any question type's result and watch the 10–90 scores react instantly. */
export const ScoreLab = ({ copy }: ScoreLabProps): ReactElement => {
  const lab = useScoreLab();
  const text = copy.simulation.lab;
  const { labPresets } = useAboutPteExtras();
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-slate-600">{text.intro}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-[var(--ink-primary)]">{labPresets.label}</span>
        {PTE_SCORE_EXAMPLES.map((score) => (
          <Button
            key={score}
            size="sm"
            variant={lab.activePreset === score ? "primary" : "secondary"}
            aria-pressed={lab.activePreset === score}
            onClick={() => lab.applyPreset(score)}
          >
            {labPresets.target(score, cefrLevelFor(score))}
          </Button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-[var(--shell-border)] sm:block" aria-hidden="true" />
        <Button
          size="sm"
          variant={lab.activeExtreme === "best" ? "primary" : "secondary"}
          aria-pressed={lab.activeExtreme === "best"}
          onClick={() => lab.setAll(true)}
        >
          {text.allBest}
        </Button>
        <Button
          size="sm"
          variant={lab.activeExtreme === "worst" ? "primary" : "secondary"}
          aria-pressed={lab.activeExtreme === "worst"}
          onClick={() => lab.setAll(false)}
        >
          {text.allWorst}
        </Button>
        <Button size="sm" variant="ghost" onClick={lab.reset}>
          {text.reset}
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <LabTaskList lab={lab} copy={copy} />
        <div className="lg:sticky lg:top-28 lg:self-start">
          <LabScoreboard lab={lab} copy={copy} />
        </div>
      </div>
    </div>
  );
};
