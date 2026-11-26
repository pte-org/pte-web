"use client";

import { useEffect, useState, type RefObject } from "react";

const GAP_PX = 4;
const VIEWPORT_PADDING_PX = 8;

export interface AnchoredPanelPosition {
  top: number;
  left: number;
}

/**
 * Places a fixed-position panel under (or, when there is no room, above) its anchor and keeps it there on
 * resize and scroll. Escape calls `onEscape`. Returns null until the panel has been measured.
 */
export function useAnchoredPanel(
  isOpen: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  onEscape: () => void,
): AnchoredPanelPosition | null {
  const [position, setPosition] = useState<AnchoredPanelPosition | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    const update = (): void => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const anchorRect = anchor.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const opensAbove =
        anchorRect.bottom + GAP_PX + panelRect.height > window.innerHeight &&
        anchorRect.top - GAP_PX - panelRect.height >= VIEWPORT_PADDING_PX;
      const top = opensAbove ? anchorRect.top - GAP_PX - panelRect.height : anchorRect.bottom + GAP_PX;
      const maxLeft = Math.max(VIEWPORT_PADDING_PX, window.innerWidth - panelRect.width - VIEWPORT_PADDING_PX);
      const next = {
        top: Math.max(VIEWPORT_PADDING_PX, Math.min(top, window.innerHeight - panelRect.height - VIEWPORT_PADDING_PX)),
        left: Math.max(VIEWPORT_PADDING_PX, Math.min(anchorRect.left, maxLeft)),
      };
      // Keep the same object when nothing moved so a re-render never re-triggers this effect.
      setPosition((previous) =>
        previous && previous.top === next.top && previous.left === next.left ? previous : next,
      );
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onEscape();
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, anchorRef, panelRef, onEscape]);

  return position;
}
