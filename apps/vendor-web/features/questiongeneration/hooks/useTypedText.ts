"use client";

import { useEffect, useState } from "react";
import { TYPING_CATCH_UP_FRAMES, TYPING_MIN_CHARS_PER_FRAME } from "../liveConstants";

/**
 * The text as if it were being typed: what has arrived is revealed from left to right, a few characters per frame,
 * faster the further behind it is (so a whole answer that arrives at once still takes about a second, and a long
 * backlog never lags far behind). Text that is replaced by a shorter or different one starts over.
 */
export function useTypedText(target: string): string {
  const [shown, setShown] = useState(0);
  const [previous, setPrevious] = useState(target);

  // A new call starts the text again from empty: show it from the start instead of cutting the old length.
  if (!target.startsWith(previous.slice(0, Math.min(previous.length, shown)))) {
    setShown(0);
  }
  if (previous !== target) setPrevious(target);

  useEffect(() => {
    if (shown >= target.length) return;
    const frame = requestAnimationFrame(() => {
      const backlog = target.length - shown;
      setShown(Math.min(target.length, shown + Math.max(TYPING_MIN_CHARS_PER_FRAME, Math.ceil(backlog / TYPING_CATCH_UP_FRAMES))));
    });
    return () => cancelAnimationFrame(frame);
  }, [shown, target]);

  return target.slice(0, shown);
}
