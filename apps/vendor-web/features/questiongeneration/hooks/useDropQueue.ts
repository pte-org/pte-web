import { useEffect, useState } from "react";
import { PIECE_FLY_MS, PIECE_GAP_MS, PIECE_SETTLE_MS } from "../assemblyConstants";
import type { PieceKey } from "../utils/livePieces";

export interface DropQueue {
  /** Pieces already on the exam screen. */
  placed: ReadonlySet<PieceKey>;
  /** The piece flying from the form to the exam screen now, if any. */
  flying: PieceKey | null;
  /** The piece that has just landed and is still highlighted on the exam screen, if any. */
  settling: PieceKey | null;
  /** Nothing waits, flies or settles: every ready piece is on the screen. */
  idle: boolean;
}

/**
 * Carries ready pieces onto the exam screen one at a time: a pause, a flight, then a moment where the landed piece
 * stays highlighted, so each drop can be followed by eye even when several pieces became ready at once.
 */
export function useDropQueue(ready: readonly PieceKey[], instant = false): DropQueue {
  const [placed, setPlaced] = useState<ReadonlySet<PieceKey>>(new Set());
  const [flying, setFlying] = useState<PieceKey | null>(null);
  const [settling, setSettling] = useState<PieceKey | null>(null);
  const next = ready.find((key) => !placed.has(key)) ?? null;

  useEffect(() => {
    if (instant || flying || settling || !next) return;
    const start = setTimeout(() => setFlying(next), PIECE_GAP_MS);
    return () => clearTimeout(start);
  }, [instant, flying, settling, next]);

  useEffect(() => {
    if (!flying) return;
    const land = setTimeout(() => {
      setPlaced((current) => new Set(current).add(flying));
      setSettling(flying);
      setFlying(null);
    }, PIECE_FLY_MS);
    return () => clearTimeout(land);
  }, [flying]);

  useEffect(() => {
    if (!settling) return;
    const settle = setTimeout(() => setSettling(null), PIECE_SETTLE_MS);
    return () => clearTimeout(settle);
  }, [settling]);

  if (instant) return { placed: new Set(ready), flying: null, settling: null, idle: true };
  return { placed, flying, settling, idle: !next && !flying && !settling };
}
