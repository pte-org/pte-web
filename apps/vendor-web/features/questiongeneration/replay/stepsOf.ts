import type { LaneStatus } from "../liveConstants";
import type { FrameContext, Playhead, StepId, StepView } from "./frameTypes";
import type { ItemScript, ScriptStep } from "./scriptTypes";

const WITH_ROUND: readonly StepId[] = ["write", "validate", "review"];

const idOfStep = (step: ScriptStep): StepId => {
  switch (step.kind) {
    case "previousRounds":
    case "prompt":
      return "prompt";
    case "write":
      return "write";
    case "check":
      return "validate";
    case "review":
      return "review";
    case "media":
      return "media";
    case "assemble":
      return "assemble";
    case "outcome":
      return "save";
  }
};

/** The steps of the step bar for this moment of the replay, derived only from the step the playhead is on. */
export function stepsOf(item: ItemScript, playhead: Playhead, context: FrameContext): StepView[] {
  const ids: StepId[] = [
    "prompt",
    "write",
    "validate",
    "review",
    ...(context.needsMedia ? (["media"] as const) : []),
    "assemble",
    "save",
  ];
  const current = item.steps[playhead.step];
  const outcome = current?.kind === "outcome" ? current.outcome : null;
  // A question that stopped marks the step it stopped at, not the save step.
  const stopped = outcome === "FAILED" || outcome === "CANCELLED";
  const previous = stopped ? item.steps[playhead.step - 1] : undefined;
  const at = current === undefined ? -1 : ids.indexOf(stopped && previous ? idOfStep(previous) : idOfStep(current));
  const round = current && current.kind !== "assemble" && current.kind !== "outcome" ? current.round : item.round;
  return ids.map((id, position): StepView => {
    let status: LaneStatus = "waiting";
    if (at >= 0 && position < at) status = "done";
    else if (position === at) status = stopped ? (outcome === "FAILED" ? "failed" : "waiting") : "active";
    if (id === "save" && (outcome === "SAVED" || outcome === "READY")) status = "done";
    if (id === "assemble" && !stopped && outcome !== null) status = "done";
    return {
      id,
      status,
      round: WITH_ROUND.includes(id) && round > 0 ? round : null,
      flagged: id === "review" && round > 1,
    };
  });
}
