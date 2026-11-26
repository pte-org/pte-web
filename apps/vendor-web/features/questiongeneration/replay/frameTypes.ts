import type { QuestionGenerationLiveItem } from "@pte/api-client";
import type { LaneStatus } from "../liveConstants";
import type { LivePiece, PieceKey, PieceNeeds } from "../utils/livePieces";
import type { ItemOutcome, ScriptStep } from "./scriptTypes";

/** The steps of the step bar, left to right. */
export type StepId = "prompt" | "write" | "validate" | "review" | "media" | "assemble" | "save";

export interface StepView {
  id: StepId;
  status: LaneStatus;
  /** The writing round (V1, V2...) for the steps that repeat when a draft is sent back; null for the others. */
  round: number | null;
  /** The reviewer sent a draft back, so the review step carries a flag. */
  flagged: boolean;
}

/** Where a piece is on its way to the exam screen. */
export type PiecePhase = "gap" | "fly" | "settle";

/**
 * Where the replay stands in one question's script. It only moves forward. Characters are counted in thousandths
 * (`charMilli`) so a pace of whole characters a second gives the same count however the time is cut into ticks.
 */
export interface Playhead {
  /** Index of the step being shown. */
  step: number;
  charMilli: number;
  /** How long the step has been shown. */
  stepMs: number;
  /** Pieces on the exam screen (assemble step). */
  placed: number;
  piecePhase: PiecePhase;
  phaseMs: number;
  /** The playhead may leave step `i` when `released > i`; only read while the replay pauses after each step. */
  released: number;
}

export interface ReplaySettings {
  charsPerSecond: number;
  pauseEachStep: boolean;
  /** Show the text of the current step in full at once. It never moves to another step. */
  revealAll: boolean;
}

/** What the engine needs to know about the question's task type. */
export interface FrameContext {
  needs: PieceNeeds;
  /** The task type has audio or an image: the step bar has a media step. */
  needsMedia: boolean;
}

export interface FrameChip {
  /** 0 queued, 1 write, 2 validate, 3 review, 4 media, 5 assemble, 6 outcome. */
  rank: number;
  /** The stage whose label and colour the chip uses. */
  stage: string;
}

/** Which pieces are on the exam screen or on their way there. */
export interface DropState {
  /** Pieces already on the exam screen. */
  placed: ReadonlySet<PieceKey>;
  /** The piece flying from the form to the exam screen now, if any. */
  flying: PieceKey | null;
  /** The piece that has just landed and is still highlighted, if any. */
  settling: PieceKey | null;
  /** Nothing waits, flies or settles. */
  idle: boolean;
}

/** Everything the screen shows of one question at one moment of the replay. */
export interface Frame {
  stepIndex: number;
  step: ScriptStep | null;
  steps: StepView[];
  /** The live item as of the playhead: its stage, text so far, draft, checks, verdicts and media. */
  view: QuestionGenerationLiveItem;
  pieces: LivePiece[];
  placed: ReadonlySet<PieceKey>;
  flying: PieceKey | null;
  settling: PieceKey | null;
  chip: FrameChip;
  /** Set only once the playhead is on the outcome step. */
  outcome: ItemOutcome | null;
  /** The current step is shown in full and the playhead could move on (or has nowhere to go yet). */
  stepComplete: boolean;
  /** Paused after a step: waiting for the person to continue, though the next step exists. */
  held: boolean;
  /** The playhead is at the last step the script has so far and the script is not over: waiting for the stream. */
  atLiveEdge: boolean;
  /** The replay is over: the playhead is on the outcome step. */
  done: boolean;
  /** The step is typing text right now (the writer or the reviewer). */
  typing: boolean;
}
