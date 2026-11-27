import {
  chipRankOf,
  type Frame,
  type ItemScript,
  type StepId,
} from "../../../../../features/questiongeneration/replay";

/** How far along a stage name is: the same scale as the chip rank. */
const STAGE_RANK: Readonly<Record<string, number>> = {
  QUEUED: 0,
  GENERATING: 1,
  VALIDATING: 2,
  REVIEWING: 3,
  RENDERING_MEDIA: 4,
  READY: 6,
  SAVED: 6,
  FAILED: 6,
  CANCELLED: 6,
};

const STEP_ID_RANK: Readonly<Record<StepId, number>> = {
  prompt: 1,
  write: 1,
  validate: 2,
  review: 3,
  media: 4,
  assemble: 5,
  save: 6,
};

export interface FrameFacts {
  frame: Frame;
  item: ItemScript | undefined;
  /** The step index of the frame before this one (null on the first). */
  previousStep: number | null;
}

/** Checks one frame against the invariants of the replay (I1 to I5 and I7). Returns what is wrong, if anything. */
export function frameViolations({ frame, item, previousStep }: FrameFacts): string[] {
  const problems: string[] = [];
  const steps = item?.steps ?? [];
  // I1: the playhead never goes back.
  if (previousStep !== null && frame.stepIndex < previousStep) {
    problems.push(`I1 step went back from ${previousStep} to ${frame.stepIndex}`);
  }
  // I7: the playhead is never past the last step the script has.
  if (steps.length > 0 && frame.stepIndex > steps.length - 1) {
    problems.push(`I7 playhead ${frame.stepIndex} is past the last step ${steps.length - 1}`);
  }
  if (!frame.step) return problems;
  const rank = chipRankOf(frame.step);
  // I2: the chip, the stage of the view and the running step of the step bar all stand at the playhead's step and
  // none is ahead of it.
  if (frame.chip.rank !== rank) problems.push(`I2 chip rank ${frame.chip.rank} is not the step's ${rank}`);
  const stageRank = STAGE_RANK[frame.view.stage ?? "QUEUED"] ?? 0;
  if (stageRank > rank) problems.push(`I2 view stage ${frame.view.stage} is ahead of the step (rank ${rank})`);
  if (stageRank < rank - 1) problems.push(`I2 view stage ${frame.view.stage} is behind the step (rank ${rank})`);
  const running = frame.steps.find((entry) => entry.status === "active");
  if (running && STEP_ID_RANK[running.id] !== rank) {
    problems.push(`I2 the step bar runs ${running.id} but the playhead is on rank ${rank}`);
  }
  const furthest = frame.steps.filter((entry) => entry.status === "done" || entry.status === "active");
  if (furthest.some((entry) => STEP_ID_RANK[entry.id] > rank && !(frame.outcome && entry.id === "assemble"))) {
    problems.push(`I2 the step bar shows a step ahead of rank ${rank}`);
  }
  // I3: the outcome is only shown on the outcome step.
  if ((frame.outcome !== null) !== (frame.step.kind === "outcome")) {
    problems.push(`I3 outcome ${String(frame.outcome)} on a ${frame.step.kind} step`);
  }
  // I4: the text shown is the start of the text of that step.
  if (frame.step.kind === "write") {
    const shown = frame.view.generator?.text ?? "";
    if (!frame.step.text.startsWith(shown)) problems.push("I4 the written text is not the start of the step's text");
  }
  if (frame.step.kind === "review") {
    const shown = frame.view.reviewer?.text ?? "";
    if (!frame.step.text.startsWith(shown)) problems.push("I4 the review text is not the start of the step's text");
  }
  // I5: no piece is placed or flying before the question is being assembled.
  const assembling = frame.step.kind === "assemble" || frame.step.kind === "outcome";
  if (!assembling && (frame.placed.size > 0 || frame.flying !== null || frame.settling !== null)) {
    problems.push(`I5 a piece is on the exam screen during a ${frame.step.kind} step`);
  }
  return problems;
}

/** I6: when the whole fixture has been played and the time budget is over, the replay is done. */
export const doneViolation = (frame: Frame | undefined, expectDone: boolean): string[] =>
  expectDone && !frame?.done ? ["I6 the replay is not done when the budget ran out"] : [];
