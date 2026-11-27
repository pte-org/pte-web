"use client";

import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { useScoreLab } from "../hooks/useScoreLab";
import { LabScoreboard } from "./_LabScoreboard";
import { LabTaskList } from "./_LabTaskList";

interface ScoreLabProps {
  copy: AboutPteCopy;
}

/** Interactive lab: change any question type's result and watch the 10–90 scores react instantly. */
export const ScoreLab = ({ copy }: ScoreLabProps): ReactElement => {
  const lab = useScoreLab();
  const text = copy.simulation.lab;
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-slate-600">{text.intro}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => lab.setAll(true)}>
          {text.allBest}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => lab.setAll(false)}>
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
