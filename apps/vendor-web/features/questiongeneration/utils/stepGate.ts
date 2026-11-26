import type { QuestionGenerationItemStage, QuestionGenerationLiveItem } from "@pte/api-client";
import { isReviewCheck } from "../liveCheckCopy";

/** The steps a question goes through on screen, in order; a person may stop the replay after each one. */
export const GATE_STEPS = [
  "QUEUED",
  "GENERATING",
  "VALIDATING",
  "REVIEWING",
  "RENDERING_MEDIA",
] as const;
export type GateStep = (typeof GATE_STEPS)[number];

const RANK_OF: Readonly<Record<string, number>> = Object.fromEntries(
  GATE_STEPS.map((step, rank) => [step, rank]),
);
const GENERATING_RANK = GATE_STEPS.indexOf("GENERATING");
const VALIDATING_RANK = GATE_STEPS.indexOf("VALIDATING");
const REVIEWING_RANK = GATE_STEPS.indexOf("REVIEWING");
const MEDIA_RANK = GATE_STEPS.indexOf("RENDERING_MEDIA");
/** Past every step: the question is ready, saved, failed or cancelled. */
export const FINAL_RANK = GATE_STEPS.length;
export const FIRST_GATE_RANK = GENERATING_RANK;

export const stageRank = (stage: QuestionGenerationItemStage | string | null | undefined): number =>
  RANK_OF[stage ?? "QUEUED"] ?? FINAL_RANK;

/** An item that ended badly is shown as it is: there is nothing left to look over step by step. */
export const endedBadly = (live: QuestionGenerationLiveItem | undefined): boolean =>
  live?.stage === "FAILED" || live?.stage === "CANCELLED";

/**
 * The live item as far as `rank` lets it be seen: the stage is held there and whatever later steps produced (the
 * mapped draft, the checks, the reviewer's text and verdict, the media) stays hidden until the screen reaches them.
 */
export function gateLive(
  live: QuestionGenerationLiveItem,
  rank: number,
): QuestionGenerationLiveItem {
  if (stageRank(live.stage) <= rank) return live;
  const reviewing = rank >= REVIEWING_RANK;
  return {
    ...live,
    stage: GATE_STEPS[Math.max(rank, GENERATING_RANK)],
    activeAgent:
      rank <= GENERATING_RANK
        ? "GENERATOR"
        : rank === REVIEWING_RANK
          ? "REVIEWER"
          : live.activeAgent,
    draft: rank < VALIDATING_RANK ? null : live.draft,
    checks:
      rank < VALIDATING_RANK
        ? []
        : reviewing
          ? live.checks
          : live.checks?.filter((check) => !isReviewCheck(check)),
    reviewer: reviewing ? live.reviewer : null,
    review: reviewing ? live.review : null,
    audioRef: rank < MEDIA_RANK ? null : live.audioRef,
    imageRef: rank < MEDIA_RANK ? null : live.imageRef,
  };
}
