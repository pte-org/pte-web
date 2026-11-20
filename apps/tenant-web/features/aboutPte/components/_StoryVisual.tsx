import type { ReactElement } from "react";
import { CircularProgressChart, MotionReveal } from "@pte/ui";
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
const BAR_WIDTH = 220;
const SAMPLE = scoreAttempt(SIM_TASKS, toItemScores(INITIAL_ANSWERS[1]));
const SKILL_TONE = { speaking: "brand", writing: "brand", reading: "success", listening: "warning" } as const;

const TraitBars = (): ReactElement => (
  <svg viewBox={`0 0 ${BAR_WIDTH + 120} 120`} className="w-full" aria-hidden="true">
    {TRAITS.map((trait, index) => (
      <g key={trait.name} transform={`translate(0 ${index * 40})`}>
        <text x="0" y="14" className="fill-slate-600 text-xs">{trait.name}</text>
        <rect x="0" y="20" width={BAR_WIDTH} height="10" rx="5" className="fill-slate-200" />
        <rect x="0" y="20" width={(BAR_WIDTH * trait.achieved) / trait.max} height="10" rx="5" className="fill-action transition-all duration-700" />
        <text x={BAR_WIDTH + 12} y="30" className="fill-slate-900 text-sm font-semibold">{`${trait.achieved}/${trait.max}`}</text>
      </g>
    ))}
  </svg>
);

const scoreRing = (score: number | null): number | null => (score === null ? null : score - SCORE_FLOOR);

export const StoryVisual = ({ step, copy }: StoryVisualProps): ReactElement => {
  const story = copy.flow.story;
  return (
    <MotionReveal key={step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-action">{story.captions[step]}</p>
      {step === 0 && <TraitBars />}
      {step === 1 && (
        <div className="flex items-center gap-6">
          <CircularProgressChart value={ITEM_SCORE} max={100} valueLabel={String(ITEM_SCORE)} ariaLabel={story.captions[1]} caption="(4+3+2) ÷ 16" />
          <p className="text-sm text-slate-600">{story.gateNote}</p>
        </div>
      )}
      {step === 2 && (
        <div className="flex flex-wrap items-center gap-3 text-lg font-semibold tabular-nums">
          <span className="rounded-lg bg-slate-100 px-3 py-2">{ITEM_SCORE}</span>
          <span className="text-slate-400">+</span>
          <span className="rounded-lg bg-slate-100 px-3 py-2">{SECOND_ITEM}</span>
          <span className="text-slate-400">÷ 2 =</span>
          <span className="rounded-lg bg-action px-3 py-2 text-white">{AVERAGE}</span>
        </div>
      )}
      {step === 3 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
        <p className="mt-4 text-sm text-slate-600">{`${copy.skills.overall}: ${SAMPLE.overall.score ?? "—"} · ${story.sampleNote}`}</p>
      )}
    </MotionReveal>
  );
};
