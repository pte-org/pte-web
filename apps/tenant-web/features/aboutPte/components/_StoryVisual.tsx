import type { ReactElement } from "react";
import { CircularProgressChart, MotionReveal, ProgressBar } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { INITIAL_ANSWERS, SIM_TASKS, toItemScores } from "../constants/miniExam";
import { SCORE_FLOOR, SCORE_SPAN, SKILLS } from "../constants/scoringWeights";
import { scoreAttempt } from "../utils/scoringEngine";

interface StoryVisualProps {
  step: number;
  copy: AboutPteCopy;
}

/** Worked example from the Score Guide: Describe Image with Content 4/6, Pronunciation 3/5, Oral Fluency 2/5. */
const TRAITS = [
  { name: "Content", achieved: 4, max: 6 },
  { name: "Pronunciation", achieved: 3, max: 5 },
  { name: "Oral Fluency", achieved: 2, max: 5 },
] as const;
const ITEM_SCORE = 56;
const SECOND_ITEM = 94;
const AVERAGE = (ITEM_SCORE + SECOND_ITEM) / 2;
const SAMPLE = scoreAttempt(SIM_TASKS, toItemScores(INITIAL_ANSWERS[1]));
const SKILL_TONE = { speaking: "brand", writing: "violet", reading: "success", listening: "warning" } as const;

const TraitBars = (): ReactElement => (
  <ul className="space-y-4">
    {TRAITS.map((trait) => (
      <li key={trait.name}>
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-medium text-[var(--ink-secondary)]">{trait.name}</span>
          <span className="font-bold tabular-nums text-[var(--ink-primary)]">{`${trait.achieved} / ${trait.max}`}</span>
        </div>
        <ProgressBar value={trait.achieved} max={trait.max} label={trait.name} />
      </li>
    ))}
  </ul>
);

const AverageTerm = ({ label, value, highlighted = false }: { label: string; value: number; highlighted?: boolean }): ReactElement => (
  <span className="flex flex-col items-center gap-1">
    <span className={`rounded-lg px-3 py-2 ${highlighted ? "bg-action text-white" : "bg-[var(--surface-card)] shadow-sm"}`}>{value}</span>
    <span className="text-xs font-medium text-[var(--ink-muted)]">{label}</span>
  </span>
);

const Aside = ({ title, text, mono = false }: { title: string; text: string; mono?: boolean }): ReactElement => (
  <div className="rounded-lg bg-[var(--surface-card)] px-3 py-2 shadow-sm">
    <p className="text-xs font-semibold text-[var(--ink-muted)]">{title}</p>
    <p className={`mt-1 text-sm text-[var(--ink-primary)] ${mono ? "font-mono" : ""}`}>{text}</p>
  </div>
);

const scoreRing = (score: number | null): number | null => (score === null ? null : score - SCORE_FLOOR);

export const StoryVisual = ({ step, copy }: StoryVisualProps): ReactElement => {
  const story = copy.flow.story;
  return (
    <MotionReveal key={step}>
      <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-action">{story.captions[step]}</p>
      {step === 0 && <TraitBars />}
      {step === 1 && (
        <div className="flex items-center gap-6">
          <CircularProgressChart value={ITEM_SCORE} max={100} valueLabel={String(ITEM_SCORE)} ariaLabel={story.captions[1]} caption="(4+3+2) ÷ 16" />
          <p className="text-sm text-slate-600">{story.gateNote}</p>
        </div>
      )}
      {step === 1 && (
        <div className="mt-5 space-y-3">
          <p className="rounded-lg bg-[var(--surface-card)] px-3 py-2 font-mono text-sm shadow-sm">{story.itemFormulaLine}</p>
          <Aside title={story.gateExampleTitle} text={story.gateExample} />
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-wrap items-start gap-3 text-lg font-semibold tabular-nums">
          <span className="pt-2 text-2xl text-slate-400" aria-hidden="true">(</span>
          <AverageTerm label={story.itemLabel(1)} value={ITEM_SCORE} />
          <span className="pt-2 text-slate-400">+</span>
          <AverageTerm label={story.itemLabel(2)} value={SECOND_ITEM} />
          <span className="pt-2 text-2xl text-slate-400" aria-hidden="true">)</span>
          <span className="pt-2 text-slate-400">÷ 2 =</span>
          <AverageTerm label={story.average} value={AVERAGE} highlighted />
        </div>
      )}
      {step === 2 && (
        <div className="mt-5">
          <Aside title={story.blankExampleTitle} text={story.blankExample} mono />
        </div>
      )}
      {step === 3 && (
        <div className="grid grid-cols-2 justify-items-center gap-4">
          {SKILLS.map((skill) => (
            <CircularProgressChart
              key={skill}
              className="h-24 w-24"
              value={scoreRing(SAMPLE.skills[skill].score)}
              max={SCORE_SPAN}
              valueLabel={String(SAMPLE.skills[skill].score ?? "—")}
              ariaLabel={copy.skills[skill]}
              caption={copy.skills[skill]}
              tone={SKILL_TONE[skill]}
            />
          ))}
        </div>
      )}
      {step === 3 && (
        <p className="mt-4 text-center text-sm font-medium text-[var(--ink-secondary)]">{`${copy.skills.overall}: ${SAMPLE.overall.score ?? "—"} · ${story.sampleNote}`}</p>
      )}
    </MotionReveal>
  );
};
