import type { Playhead } from "./frameTypes";

/**
 * Where the replay of each question stood when the person left it, so coming back to a question watched half way
 * goes on from there instead of starting over. Kept in memory for the page: it is cleared when another job is opened.
 */
const heads = new Map<string, Playhead>();

export const playheadKey = (jobId: string, index: number): string => `${jobId}:${index}`;

export function savePlayhead(key: string, playhead: Playhead): void {
  heads.set(key, playhead);
}

export const loadPlayhead = (key: string): Playhead | undefined => heads.get(key);

/** Forgets every playhead that does not belong to `jobId` (the page now shows that job). */
export function clearPlayheads(jobId: string | null): void {
  for (const key of [...heads.keys()]) {
    if (jobId === null || !key.startsWith(`${jobId}:`)) heads.delete(key);
  }
}

/** Two playheads that stand in the same place (so a frame in which nothing moved need not render again). */
export const samePlayhead = (left: Playhead, right: Playhead): boolean =>
  left.step === right.step &&
  left.charMilli === right.charMilli &&
  left.stepMs === right.stepMs &&
  left.placed === right.placed &&
  left.piecePhase === right.piecePhase &&
  left.phaseMs === right.phaseMs &&
  left.released === right.released;
