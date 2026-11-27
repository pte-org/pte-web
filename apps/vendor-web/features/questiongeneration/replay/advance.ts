import { PIECE_FLY_MS, PIECE_GAP_MS, PIECE_SETTLE_MS, STEP_DWELL_MS } from "../assemblyConstants";
import { MS_PER_SECOND } from "../typingConstants";
import type { FrameContext, Playhead, ReplaySettings } from "./frameTypes";
import { readyKeysAtAssemble } from "./piecesOf";
import type { ItemScript, ScriptStep } from "./scriptTypes";
import { mediaDwellMs, typedChars } from "./viewOf";

export const START_PLAYHEAD: Playhead = {
  step: 0,
  charMilli: 0,
  stepMs: 0,
  placed: 0,
  piecePhase: "gap",
  phaseMs: 0,
  released: 0,
};

/** The step's text, for the steps the replay types. */
const textOf = (step: ScriptStep | undefined): string | null =>
  step?.kind === "write" || step?.kind === "review" ? step.text : null;

const toMilli = (chars: number): number => chars * MS_PER_SECOND;

const isCutText = (step: ScriptStep): boolean =>
  (step.kind === "write" || step.kind === "review") && step.superseded;

/** What a step of this kind still needs before the playhead may leave it, in milliseconds of playing. */
function remainingMs(
  step: ScriptStep,
  playhead: Playhead,
  settings: ReplaySettings,
  context: FrameContext,
  pieceCount: number,
): number {
  const text = textOf(step);
  if (text !== null && text.length > 0) {
    const missing = toMilli(text.length) - playhead.charMilli;
    return missing <= 0 ? 0 : Math.ceil((missing * MS_PER_SECOND) / (settings.charsPerSecond * MS_PER_SECOND));
  }
  switch (step.kind) {
    case "media":
      return Math.max(0, mediaDwellMs(step, context) - playhead.stepMs);
    case "assemble":
      return assembleRemainingMs(playhead, pieceCount);
    case "outcome":
      return 0;
    default:
      return Math.max(0, STEP_DWELL_MS - playhead.stepMs);
  }
}

/** Time left in the assemble step: the pieces still to place, each a pause, a flight and a moment standing out. */
function assembleRemainingMs(playhead: Playhead, pieceCount: number): number {
  if (playhead.placed >= pieceCount && playhead.piecePhase !== "settle") return 0;
  const phaseLeft: Record<Playhead["piecePhase"], number> = {
    gap: PIECE_GAP_MS + PIECE_FLY_MS + PIECE_SETTLE_MS,
    fly: PIECE_FLY_MS + PIECE_SETTLE_MS,
    settle: PIECE_SETTLE_MS,
  };
  const own = phaseLeft[playhead.piecePhase] - playhead.phaseMs;
  const placedNow = playhead.piecePhase === "settle" ? playhead.placed : playhead.placed + 1;
  return own + Math.max(0, pieceCount - placedNow) * (PIECE_GAP_MS + PIECE_FLY_MS + PIECE_SETTLE_MS);
}

/** Whether the playhead is allowed to leave the step: not while the replay pauses after each step and it is not released. */
const mayLeave = (playhead: Playhead, settings: ReplaySettings): boolean =>
  !settings.pauseEachStep || playhead.released > playhead.step;

/** The step is shown in full (all its text typed, its time spent, its pieces placed). */
export function isStepComplete(
  item: ItemScript,
  playhead: Playhead,
  settings: ReplaySettings,
  context: FrameContext,
): boolean {
  const step = item.steps[playhead.step];
  if (!step) return false;
  const pieceCount = step.kind === "assemble" ? readyKeysAtAssemble(item, context).length : 0;
  return remainingMs(step, playhead, settings, context, pieceCount) === 0;
}

/** Plays `ms` of time in the step: types its text and counts its time. Never goes past what the step needs. */
function spend(
  playhead: Playhead,
  step: ScriptStep,
  ms: number,
  settings: ReplaySettings,
): Playhead {
  const text = textOf(step);
  const typedMilli =
    text !== null
      ? Math.min(toMilli(text.length), playhead.charMilli + ms * settings.charsPerSecond)
      : playhead.charMilli;
  return { ...playhead, charMilli: typedMilli, stepMs: playhead.stepMs + ms };
}

/** Moves the pieces of the assemble step on by `ms`. */
function spendPieces(playhead: Playhead, ms: number, pieceCount: number): Playhead {
  let { placed, piecePhase, phaseMs } = playhead;
  let left = ms;
  while (left > 0 && !(placed >= pieceCount && piecePhase !== "settle")) {
    const length = piecePhase === "gap" ? PIECE_GAP_MS : piecePhase === "fly" ? PIECE_FLY_MS : PIECE_SETTLE_MS;
    const take = Math.min(left, length - phaseMs);
    phaseMs += take;
    left -= take;
    if (phaseMs < length) break;
    phaseMs = 0;
    if (piecePhase === "gap") piecePhase = "fly";
    else if (piecePhase === "fly") {
      piecePhase = "settle";
      placed += 1;
    } else piecePhase = "gap";
  }
  return { ...playhead, placed, piecePhase, phaseMs, stepMs: playhead.stepMs + (ms - left) };
}

const leave = (playhead: Playhead): Playhead => ({
  ...playhead,
  step: playhead.step + 1,
  charMilli: 0,
  stepMs: 0,
  placed: 0,
  piecePhase: "gap",
  phaseMs: 0,
});

/**
 * The playhead after `elapsedMs` more of playing. A pure step: time comes in only as an argument. It never goes back
 * and never skips a step; it stops at the last step the script has (the live edge) and waits for more.
 */
export function advance(
  playhead: Playhead,
  item: ItemScript,
  elapsedMs: number,
  settings: ReplaySettings,
  context: FrameContext,
): Playhead {
  let current = playhead;
  let budget = Math.max(0, Math.floor(elapsedMs));
  for (let guard = 0; guard < item.steps.length * 4 + 8; guard++) {
    const step = item.steps[current.step];
    if (!step) return current;
    // A step a pause or a cancel cut off: what came is shown whole, nothing more will be typed into it.
    if (settings.revealAll || (item.halted && isCutText(step))) {
      const text = textOf(step);
      if (text !== null) current = { ...current, charMilli: Math.max(current.charMilli, toMilli(text.length)) };
    }
    const pieceCount = step.kind === "assemble" ? readyKeysAtAssemble(item, context).length : 0;
    const need = remainingMs(step, current, settings, context, pieceCount);
    const used = Math.min(budget, need);
    if (used > 0) {
      current = step.kind === "assemble" ? spendPieces(current, used, pieceCount) : spend(current, step, used, settings);
      budget -= used;
    }
    const finished = remainingMs(step, current, settings, context, pieceCount) === 0;
    const hasNext = current.step + 1 < item.steps.length;
    if (!(finished && hasNext && mayLeave(current, settings))) return current;
    current = leave(current);
  }
  return current;
}

/** The playhead at the very end of a question's script, every step shown in full (a question opened as it ended). */
export function endPlayhead(item: ItemScript, context: FrameContext): Playhead {
  const step = item.steps.length - 1;
  const last = item.steps[step];
  const pieceCount = readyKeysAtAssemble(item, context).length;
  return {
    step: Math.max(0, step),
    charMilli: toMilli(textOf(last)?.length ?? 0),
    stepMs: Number.MAX_SAFE_INTEGER,
    placed: last?.kind === "assemble" ? pieceCount : 0,
    piecePhase: "gap",
    phaseMs: 0,
    released: Math.max(0, step + 1),
  };
}

export { typedChars };
