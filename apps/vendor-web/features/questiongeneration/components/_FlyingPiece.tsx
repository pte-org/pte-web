"use client";

import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, type ReactElement, type RefObject } from "react";
import { PIECE_FLY_MS } from "../assemblyConstants";
import { useIsClient } from "../hooks/useIsClient";
import type { PieceKey } from "../utils/livePieces";

interface FlyingPieceProps {
  rootRef: RefObject<HTMLElement | null>;
  piece: PieceKey | null;
  label: string;
}

/** Where each piece lands on the exam screen; a slot not drawn yet falls back to the screen's card. */
const SLOT_SELECTOR = (piece: PieceKey): string => `[data-exam-slot="${piece}"], [data-exam-card]`;
const FLY_EASING = "cubic-bezier(.5,0,.2,1)";

/** A copy of a finished form field carried across to its place on the exam screen. */
export const FlyingPiece = ({ rootRef, piece, label }: FlyingPieceProps): ReactElement | null => {
  const flyerRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  useLayoutEffect(() => {
    const flyer = flyerRef.current;
    const root = rootRef.current;
    if (!piece || !flyer || !root) return;
    const source = root.querySelector(`[data-piece="${piece}"]`)?.getBoundingClientRect();
    const target = root.querySelector(SLOT_SELECTOR(piece))?.getBoundingClientRect();
    if (!source || !target) return;
    const width = Math.min(source.width, 320);
    const animation = flyer.animate(
      [
        {
          left: `${source.left}px`,
          top: `${source.top}px`,
          width: `${width}px`,
          opacity: 0.4,
          transform: "scale(1)",
        },
        { opacity: 1, transform: "scale(1.04) rotate(-1.5deg)", offset: 0.25 },
        {
          left: `${target.left + 24}px`,
          top: `${target.top + 24}px`,
          width: `${width}px`,
          opacity: 0.9,
          transform: "scale(.92)",
        },
      ],
      { duration: PIECE_FLY_MS, easing: FLY_EASING, fill: "forwards" },
    );
    return () => animation.cancel();
  }, [rootRef, piece, isClient]);

  if (!piece || !isClient) return null;
  // On the body: a transformed ancestor (the full-screen layout) would turn `fixed` into its own frame and shift it.
  return createPortal(
    <div
      ref={flyerRef}
      data-flying
      aria-hidden
      className="pointer-events-none fixed z-40 truncate rounded-lg border border-[var(--action)] bg-[var(--surface-card)] px-3 py-2 text-sm font-medium shadow-xl"
    >
      {label}
    </div>,
    document.body,
  );
};
