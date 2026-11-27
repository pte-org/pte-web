import type { QuestionGenerationLiveItem } from "@pte/api-client";
import { livePieces, type LivePiece, type PieceKey } from "../utils/livePieces";
import type { FrameContext, Playhead } from "./frameTypes";
import { parseDraftText } from "./partialMemo";
import type { ItemScript } from "./scriptTypes";
import { viewOf } from "./viewOf";

export interface PiecesFrame {
  pieces: LivePiece[];
  placed: ReadonlySet<PieceKey>;
  flying: PieceKey | null;
  settling: PieceKey | null;
}

const readyKeys = (pieces: readonly LivePiece[]): PieceKey[] =>
  pieces.filter((piece) => piece.studentFacing && piece.ready).map((piece) => piece.key);

/** The fields as the form shows them now: filled from the draft as it is typed, in the order of the form. */
export function piecesFromView(view: QuestionGenerationLiveItem, context: FrameContext): LivePiece[] {
  const typed = parseDraftText(`item-${view.index}`, view.generator?.text ?? "");
  return livePieces(typed, view, context.needs);
}

/** The student-facing pieces that are carried onto the exam screen, in order, once the question is done. */
export function readyKeysAtAssemble(item: ItemScript, context: FrameContext): PieceKey[] {
  const at = item.steps.findIndex((step) => step.kind === "assemble");
  if (at < 0) return [];
  const end: Playhead = {
    step: at,
    charMilli: Number.MAX_SAFE_INTEGER,
    stepMs: Number.MAX_SAFE_INTEGER,
    placed: 0,
    piecePhase: "gap",
    phaseMs: 0,
    released: Number.MAX_SAFE_INTEGER,
  };
  return readyKeys(piecesFromView(viewOf(item, end, context), context));
}

/**
 * The pieces on the form and on the exam screen. A piece is only placed during the assemble step, one at a time (a
 * pause, a flight, a moment standing out); after it every ready piece is on the screen.
 */
export function piecesOf(
  item: ItemScript,
  playhead: Playhead,
  view: QuestionGenerationLiveItem,
  context: FrameContext,
): PiecesFrame {
  const pieces = piecesFromView(view, context);
  const ready = readyKeys(pieces);
  const step = item.steps[playhead.step];
  if (step?.kind === "assemble") {
    return {
      pieces,
      placed: new Set(ready.slice(0, playhead.placed)),
      flying: playhead.piecePhase === "fly" ? (ready[playhead.placed] ?? null) : null,
      settling: playhead.piecePhase === "settle" ? (ready[playhead.placed - 1] ?? null) : null,
    };
  }
  const assembled = step?.kind === "outcome" && item.steps.some((candidate) => candidate.kind === "assemble");
  return { pieces, placed: new Set(assembled ? ready : []), flying: null, settling: null };
}
