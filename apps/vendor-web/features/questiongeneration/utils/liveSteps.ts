import type { QuestionGenerationCheckStep, QuestionGenerationLiveItem } from "@pte/api-client";
import type { LaneStatus } from "../liveConstants";

/** The steps of one question, left to right on the step bar. */
export type StepId = "prompt" | "write" | "validate" | "review" | "media" | "assemble" | "save";

export interface LiveStep {
  id: StepId;
  status: LaneStatus;
  /** The writing round (V1, V2…) for the steps that repeat when a draft is sent back; null for the others. */
  round: number | null;
  /** The reviewer sent a draft back, so the review step carries a flag. */
  flagged: boolean;
}

export interface StepInput {
  live: QuestionGenerationLiveItem | undefined;
  /** The item's final stage from the job (SAVED, READY, FAILED, CANCELLED), or null while it runs. */
  outcome: string | null;
  needsMedia: boolean;
  /** Student-facing pieces of the question and how many already sit on the exam screen. */
  studentPieces: number;
  placedPieces: number;
  flying: boolean;
}

const VALIDATE_STEPS: readonly QuestionGenerationCheckStep[] = ["JSON", "RULES", "DUPLICATE"];
const AFTER_REVIEW: readonly string[] = ["RENDERING_MEDIA", "READY", "SAVED"];
/** The steps the server always runs in this order, one after the other. */
const WRITING_STEPS: readonly StepId[] = ["prompt", "write", "validate", "review"];

function latest(live: QuestionGenerationLiveItem | undefined, step: QuestionGenerationCheckStep) {
  return [...(live?.checks ?? [])].reverse().find((check) => check.step === step);
}

/** Where each step of a question stands, read from the live feed and the job's outcome. */
export function liveSteps(input: StepInput): LiveStep[] {
  const { live, outcome, needsMedia, studentPieces, placedPieces, flying } = input;
  const stage = live?.stage ?? null;
  const rewriting = live?.activeAgent === "GENERATOR" && stage === "REVIEWING";
  const writeRound = live?.generator?.attempt ?? null;
  const reviewRound = live?.reviewer?.attempt ?? null;

  const prompt = latest(live, "PROMPT");
  const write = latest(live, "WRITE");
  const validating = VALIDATE_STEPS.map((step) => latest(live, step));
  const verdict = latest(live, "REVIEW_VERDICT");
  const reviewDone = verdict?.status === "PASSED" || AFTER_REVIEW.includes(stage ?? "");
  const mediaDone = Boolean(live?.audioRef || live?.imageRef);

  const raw: Record<StepId, LaneStatus> = {
    prompt:
      prompt?.status === "PASSED"
        ? "done"
        : prompt || stage === "GENERATING"
          ? "active"
          : "waiting",
    write: write?.status === "PASSED" ? "done" : write || rewriting ? "active" : "waiting",
    validate: validating.every((check) => check?.status === "PASSED")
      ? "done"
      : validating.some(Boolean) || stage === "VALIDATING"
        ? "active"
        : "waiting",
    review: reviewDone ? "done" : stage === "REVIEWING" && !rewriting ? "active" : "waiting",
    media: mediaDone ? "done" : stage === "RENDERING_MEDIA" ? "active" : "waiting",
    assemble:
      studentPieces > 0 && placedPieces >= studentPieces
        ? "done"
        : placedPieces > 0 || flying
          ? "active"
          : "waiting",
    save:
      outcome === "SAVED" || outcome === "READY"
        ? "done"
        : outcome === "FAILED"
          ? "failed"
          : "waiting",
  };
  const order: StepId[] = [
    "prompt",
    "write",
    "validate",
    "review",
    ...(needsMedia ? ["media" as const] : []),
    "assemble",
    "save",
  ];
  // A later writing step running means the earlier ones are behind it, even if their own event was missed. Media and
  // assembly stand on their own: a chart is drawn before its review, so they must not mark the review done.
  // A stopped item marks the step it stopped at (failed, or left waiting when cancelled) and leaves the rest waiting.
  const stopped = outcome === "FAILED" || outcome === "CANCELLED";
  const furthestOf = (ids: readonly StepId[]): number =>
    order.reduce(
      (last, id, index) =>
        ids.includes(id) && raw[id] !== "waiting" && !(stopped && id === "save") ? index : last,
      -1,
    );
  const furthestWriting = furthestOf(WRITING_STEPS);
  const furthest = furthestOf(order);
  return order.map((id, index) => {
    let status = raw[id];
    // A saved question may still be flying onto the exam screen, so that one step keeps following the pieces.
    if ((outcome === "SAVED" || outcome === "READY") && id !== "assemble") status = "done";
    else if (WRITING_STEPS.includes(id) && index < furthestWriting) status = "done";
    else if (stopped && index === furthest) status = outcome === "FAILED" ? "failed" : "waiting";
    const round =
      id === "review" ? reviewRound : id === "write" || id === "validate" ? writeRound : null;
    return { id, status, round, flagged: id === "review" && (writeRound ?? 1) > 1 };
  });
}
