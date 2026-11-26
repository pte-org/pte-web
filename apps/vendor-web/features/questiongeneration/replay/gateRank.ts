import { stageOfStep } from "./chip";
import type { ScriptStep } from "./scriptTypes";

/** The steps the "pause after each step" bar names, in order (the same list the bar was built on). */
const GATE_RANKS: Readonly<Record<string, number>> = {
  GENERATING: 1,
  VALIDATING: 2,
  REVIEWING: 3,
  RENDERING_MEDIA: 4,
};

/** Which named step of the pause bar a step of the script belongs to, or null (the outcome has none). */
export const gateRankOf = (step: ScriptStep | null): number | null =>
  step ? (GATE_RANKS[stageOfStep(step)] ?? null) : null;
