import { useEffect, useState } from "react";
import { PIECE_FLY_MS, PIECE_GAP_MS } from "../assemblyConstants";
import type { PieceKey } from "../utils/livePieces";

export interface DropQueue {
  /** Pieces already on the exam screen. */
  placed: ReadonlySet<PieceKey>;
  /** The piece flying from the form to the exam screen now, if any. */
  flying: PieceKey | null;
}

/**
 * Carries ready pieces onto the exam screen one at a time, each with a short flight, so the screen is seen being
 * assembled even when several pieces became ready at once (a finished question opened later, for example).
 */
export function useDropQueue(ready: readonly PieceKey[]): DropQueue {
  const [placed, setPlaced] = useState<ReadonlySet<PieceKey>>(new Set());
  const [flying, setFlying] = useState<PieceKey | null>(null);
  const next = ready.find((key) => !placed.has(key)) ?? null;

  useEffect(() => {
    if (flying || !next) return;
    const start = setTimeout(() => setFlying(next), PIECE_GAP_MS);
    return () => clearTimeout(start);
  }, [flying, next]);

  useEffect(() => {
    if (!flying) return;
    const land = setTimeout(() => {
      setPlaced((current) => new Set(current).add(flying));
      setFlying(null);
    }, PIECE_FLY_MS);
    return () => clearTimeout(land);
  }, [flying]);

  return { placed, flying };
}
