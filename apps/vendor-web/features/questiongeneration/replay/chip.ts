import type { Frame, FrameChip } from "./frameTypes";
import type { ScriptStep } from "./scriptTypes";

/** The stage a step of the script stands for, the one whose label and colour a chip shows while the step plays. */
export function stageOfStep(step: ScriptStep | null): string {
  if (!step) return "QUEUED";
  switch (step.kind) {
    case "previousRounds":
    case "prompt":
    case "write":
      return "GENERATING";
    case "check":
      return "VALIDATING";
    case "review":
      return "REVIEWING";
    case "media":
    case "assemble":
      return "RENDERING_MEDIA";
    case "outcome":
      return step.outcome;
  }
}

/** How far a step is along the way: queued 0, write 1, validate 2, review 3, media 4, assemble 5, outcome 6. */
export function chipRankOf(step: ScriptStep | null): number {
  if (!step) return 0;
  switch (step.kind) {
    case "previousRounds":
    case "prompt":
    case "write":
      return 1;
    case "check":
      return 2;
    case "review":
      return 3;
    case "media":
      return 4;
    case "assemble":
      return 5;
    case "outcome":
      return 6;
  }
}

export const chipOfStep = (step: ScriptStep | null): FrameChip => ({
  rank: chipRankOf(step),
  stage: stageOfStep(step),
});

/** The chip of a question while it replays: it depends only on the step the playhead is on, never on the server. */
export const chipOf = (frame: Pick<Frame, "step">): FrameChip => chipOfStep(frame.step);
