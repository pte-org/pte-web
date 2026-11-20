"use client";

import type { ReactElement } from "react";
import { Alert, Button, Stepper } from "@pte/ui";
import { ABOUT_PTE_LAYOUT, SKILL_TONES } from "../constants/aboutPteLayout";
import { SKILLS } from "../constants/scoringWeights";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { LAST_STAGE, useScoringSimulation } from "../hooks/useScoringSimulation";
import { AboutSection } from "./_AboutSection";
import { AnswerGrid } from "./_AnswerGrid";
import { AverageTable } from "./_AverageTable";
import { BreakdownCard } from "./_BreakdownCard";
import { ResultSummary } from "./_ResultSummary";

export const ScoringSimulation = (): ReactElement => {
  const copy = useAboutPteCopy();
  const text = copy.simulation;
  const sim = useScoringSimulation();
  const steps = text.stages.map((label, index) => ({ id: String(index), label }));
  const result = sim.results[sim.selected];

  return (
    <AboutSection id="simulation" title={text.title}>
      <p className={ABOUT_PTE_LAYOUT.muted}>{text.intro}</p>
      <p className="mt-2 text-xs text-slate-500">{text.miniNote}</p>
      <div className="mt-6 space-y-6">
        <Stepper steps={steps} currentStep={String(sim.stage)} />
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
        {sim.stage === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">{text.outcomeHint}</p>
            <AnswerGrid answers={sim.answers} onToggle={sim.toggle} copy={copy} />
          </div>
        )}
        {sim.stage === 1 && <AverageTable answers={sim.answers} copy={copy} />}
        {sim.stage >= 2 && (
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
        )}
        {sim.stage === 2 && (
          <>
            <Alert tone="info">{text.integratedNote}</Alert>
            <div className="grid gap-4 md:grid-cols-2">
              {SKILLS.map((skill) => (
                <BreakdownCard
                  key={skill}
                  title={copy.skills[skill]}
                  breakdown={result.skills[skill]}
                  accentClass={SKILL_TONES[skill].text}
                  copy={copy}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">{text.formula}</p>
          </>
        )}
        {sim.stage === 3 && (
          <>
            <Alert tone="info">{text.overallNote}</Alert>
            <div className="grid gap-4 lg:grid-cols-2">
              <BreakdownCard title={text.overallTitle} breakdown={result.overall} accentClass="text-action" copy={copy} />
              <ResultSummary results={sim.results} copy={copy} />
            </div>
          </>
        )}
      </div>
    </AboutSection>
  );
};
