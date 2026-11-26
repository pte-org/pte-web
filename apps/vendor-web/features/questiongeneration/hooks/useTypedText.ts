"use client";

import { useEffect, useState } from "react";
import { MS_PER_SECOND } from "../typingConstants";
import { revealedChars } from "../utils/typingStep";

/**
 * The text as if it were being typed: what has arrived is revealed from left to right at `charsPerSecond`, measured
 * in time rather than frames so every screen types at the same pace, and an answer the provider sends all at once is
 * still written out field by field. Text replaced by a different one starts over. While `revealAll` is set, whatever
 * has arrived is shown at once; text arriving after it is cleared is typed again.
 */
export function useTypedText(target: string, charsPerSecond: number, revealAll = false): string {
  const [shown, setShown] = useState(0);
  const [previous, setPrevious] = useState(target);

  // A new call starts the text again from empty: show it from the start instead of cutting the old length.
  if (!target.startsWith(previous.slice(0, Math.min(previous.length, shown)))) {
    setShown(0);
  } else if (revealAll && shown < target.length) {
    setShown(target.length);
  }
  if (previous !== target) setPrevious(target);

  useEffect(() => {
    if (shown >= target.length) return;
    // Counted from the characters already shown, so a change of speed carries on from where the text is.
    const from = performance.now() - (shown * MS_PER_SECOND) / charsPerSecond;
    let frame = requestAnimationFrame(function step(now) {
      const next = revealedChars(now - from, charsPerSecond, target.length);
      if (next > shown) {
        setShown(next);
        return;
      }
      frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [shown, target, charsPerSecond]);

  return target.slice(0, shown);
}
