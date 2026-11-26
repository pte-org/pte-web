import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { isStepComplete } from "./advance";
import { chipOfStep } from "./chip";
import type { Frame, FrameContext, Playhead, ReplaySettings } from "./frameTypes";
import { piecesOf } from "./piecesOf";
import type { ItemScript } from "./scriptTypes";
import { stepsOf } from "./stepsOf";
import { typedChars, viewOf } from "./viewOf";

const EMPTY_VIEW = (index: number): QuestionGenerationLiveItem => ({
  index,
  stage: "QUEUED",
  activeAgent: null,
  generator: null,
  reviewer: null,
  audioRef: null,
  imageRef: null,
  checks: [],
});

/**
 * Everything the screen shows of one question at the moment the playhead is at: one frame, built only from the
 * script and the playhead, so the step bar, the chips, the text and the pieces cannot disagree with each other.
 */
export function frameOf(
  item: ItemScript | undefined,
  playhead: Playhead,
  settings: ReplaySettings,
  context: FrameContext,
): Frame {
  if (!item || item.steps.length === 0) {
    const empty = item ?? { index: 0, steps: [], round: 0, ended: false, pendingOutcome: null };
    return {
      stepIndex: 0,
      step: null,
      steps: stepsOf(empty, playhead, context),
      view: EMPTY_VIEW(empty.index),
      pieces: [],
      placed: new Set(),
      flying: null,
      settling: null,
      chip: chipOfStep(null),
      outcome: null,
      stepComplete: false,
      held: false,
      atLiveEdge: !item?.ended,
      done: false,
      typing: false,
    };
  }
  const step = item.steps[playhead.step] ?? null;
  const view = viewOf(item, playhead, context);
  const pieces = piecesOf(item, playhead, view, context);
  const complete = isStepComplete(item, playhead, settings, context);
  const hasNext = playhead.step + 1 < item.steps.length;
  const text = step && (step.kind === "write" || step.kind === "review") ? step.text : null;
  return {
    stepIndex: playhead.step,
    step,
    steps: stepsOf(item, playhead, context),
    view,
    ...pieces,
    chip: chipOfStep(step),
    outcome: step?.kind === "outcome" ? step.outcome : null,
    stepComplete: complete,
    held: settings.pauseEachStep && complete && hasNext && playhead.released <= playhead.step,
    atLiveEdge: !hasNext && !item.ended,
    done: step?.kind === "outcome",
    typing: text !== null && typedChars(playhead) < text.length,
  };
}
