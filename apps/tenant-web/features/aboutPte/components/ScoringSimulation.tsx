"use client";

import type { ReactElement } from "react";
import { Button, EmptyState, StatCard, Stepper } from "@pte/ui";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { LAST_STAGE, useScoringSimulation } from "../hooks/useScoringSimulation";
import { summarize } from "../utils/scoringEngine";
import { AboutSection } from "./_AboutSection";
import { DistributionChart } from "./_DistributionChart";
import { StudentTable } from "./_StudentTable";
import { StudentTrace } from "./_StudentTrace";

export const ScoringSimulation = (): ReactElement => {
  const copy = useAboutPteCopy();
  const text = copy.simulation;
  const simulation = useScoringSimulation();
  const { seed, stage, students } = simulation;
  const selected = students.find((student) => student.id === simulation.selectedId);
  const overall = students.map((student) => student.result.overall);
  const stats = summarize(overall);
  const steps = text.stages.map((label, index) => ({ id: String(index), label }));
  const done = stage >= LAST_STAGE;

  return (
    <AboutSection id="simulation" title={text.title}>
      <p className={ABOUT_PTE_LAYOUT.muted}>{text.intro}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={simulation.generate}>{seed === null ? text.generate : text.regenerate}</Button>
        <Button variant="secondary" onClick={simulation.advance} disabled={seed === null || done}>
          {text.next}
        </Button>
        <Button variant="ghost" onClick={simulation.finish} disabled={seed === null || done}>
          {text.runAll}
        </Button>
        {seed !== null && <span className="text-xs text-slate-500">{`${text.seed}: ${seed}`}</span>}
      </div>
      {seed === null ? (
        <div className="mt-6">
          <EmptyState title={text.empty} />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <Stepper steps={steps} currentStep={String(stage)} />
          {done && (
            <div className="grid gap-3 sm:grid-cols-4">
              <StatCard compact label={text.mean} value={stats.mean.toFixed(1)} />
              <StatCard compact label={text.median} value={String(stats.median)} />
              <StatCard compact label={text.highest} value={String(stats.max)} />
              <StatCard compact label={text.lowest} value={String(stats.min)} />
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              {done && (
                <div className={ABOUT_PTE_LAYOUT.card}>
                  <DistributionChart values={overall} title={text.distribution} hint={text.distributionHint} />
                </div>
              )}
              <StudentTable
                students={students}
                stage={stage}
                selectedId={simulation.selectedId}
                onSelect={simulation.select}
                copy={copy}
              />
            </div>
            {selected ? (
              <StudentTrace student={selected} stage={stage} copy={copy} />
            ) : (
              <p className={ABOUT_PTE_LAYOUT.muted}>{text.selectHint}</p>
            )}
          </div>
        </div>
      )}
    </AboutSection>
  );
};
