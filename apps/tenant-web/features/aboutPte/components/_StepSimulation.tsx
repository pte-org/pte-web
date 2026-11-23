"use client";

import type { ReactElement } from "react";
import { Button, Stepper } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { LAST_STAGE, useScoringSimulation } from "../hooks/useScoringSimulation";
import { AnswerGrid } from "./_AnswerGrid";
import { AverageTable } from "./_AverageTable";
import { IntegratedExample } from "./_IntegratedExample";
import { ResultSummary } from "./_ResultSummary";
import { SkillMatrix } from "./_SkillMatrix";

interface StepExplainerProps {
  stage: number;
  title: string;
  text: string;
}

const StepExplainer = ({ stage, title, text }: StepExplainerProps): ReactElement => (
  <div className="flex gap-4 rounded-xl border border-action/30 bg-action/5 p-4">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-action text-lg font-bold text-white">
      {stage + 1}
    </span>
    <div>
      <h3 className="font-semibold text-slate-900">{`${title} (${stage + 1}/${LAST_STAGE + 1})`}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  </div>
);

interface StepSimulationProps {
  copy: AboutPteCopy;
}

export const StepSimulation = ({ copy }: StepSimulationProps): ReactElement => {
  const text = copy.simulation;
  const sim = useScoringSimulation();
  const steps = text.stages.map((label, index) => ({ id: String(index), label }));
  const result = sim.results[sim.selected];

  return (
    <div className="space-y-5">
        <Stepper steps={steps} currentStep={String(sim.stage)} />
        <StepExplainer stage={sim.stage} title={text.stages[sim.stage]} text={text.explain[sim.stage]} />
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => sim.setStage(sim.stage - 1)} disabled={sim.stage === 0}>
            {text.previous}
          </Button>
          <Button onClick={() => sim.setStage(sim.stage + 1)} disabled={sim.stage === LAST_STAGE}>
            {text.next}
          </Button>
          <Button variant="ghost" onClick={sim.reset}>
            {text.reset}
          </Button>
        </div>
        {sim.stage === 0 && <AnswerGrid answers={sim.answers} onToggle={sim.toggle} copy={copy} />}
        {sim.stage === 1 && <AverageTable answers={sim.answers} copy={copy} />}
        {sim.stage >= 2 && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">{text.viewing}</span>
              {text.students.map((name, student) => (
                <Button
                  key={name}
                  size="sm"
                  variant={student === sim.selected ? "primary" : "secondary"}
                  onClick={() => sim.select(student)}
                >
                  {name}
                </Button>
              ))}
            </div>
            {sim.stage === 2 && <IntegratedExample result={result} copy={copy} />}
            <SkillMatrix result={result} showOverall={sim.stage === LAST_STAGE} copy={copy} />
          </>
        )}
        {sim.stage === LAST_STAGE && <ResultSummary results={sim.results} copy={copy} />}
    </div>
  );
};
