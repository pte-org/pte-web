"use client";

import { useEffect, useRef, type ReactElement, type RefObject } from "react";
import { cn } from "@pte/ui";
import { CURSOR_EASE } from "../assemblyConstants";
import type { LiveLane } from "../liveConstants";
import { LANE_TONES } from "../liveTones";

interface AgentCursorProps {
  rootRef: RefObject<HTMLElement | null>;
  /** CSS selector of the element the agent works on, inside the root; null hides the cursor. */
  target: string | null;
  lane: LiveLane;
  label: string;
}

/**
 * An agent's pointer that glides to whatever it works on, like a collaborator's cursor. Its position changes every
 * frame, so it is moved through the DOM rather than through React state.
 */
export const AgentCursor = ({ rootRef, target, lane, label }: AgentCursorProps): ReactElement => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    let x = Number.NaN;
    let y = Number.NaN;
    const follow = (): void => {
      const cursor = cursorRef.current;
      const element = target ? rootRef.current?.querySelector(target) : null;
      if (cursor) {
        if (element) {
          const caret = element.querySelector("[data-caret]");
          const box = (caret ?? element).getBoundingClientRect();
          const goalX = caret ? box.right : box.left + Math.min(box.width * 0.5, 260);
          const goalY = caret ? box.bottom - 4 : box.top + Math.min(box.height * 0.6, 48);
          x = Number.isNaN(x) ? goalX : x + (goalX - x) * CURSOR_EASE;
          y = Number.isNaN(y) ? goalY : y + (goalY - y) * CURSOR_EASE;
          cursor.style.transform = `translate(${x}px, ${y}px)`;
        }
        cursor.dataset.visible = element ? "true" : "false";
      }
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [rootRef, target]);

  return (
    <div
      ref={cursorRef}
      aria-hidden
      data-visible="false"
      className="pointer-events-none fixed left-0 top-0 z-50 opacity-0 transition-opacity duration-300 data-[visible=true]:opacity-100"
    >
      <svg width="18" height="20" viewBox="0 0 18 20" className="drop-shadow">
        <path
          d="M1 1l15 8-6.5 1.8L6.8 18z"
          className="fill-[var(--ink-primary)] stroke-white"
          strokeWidth="1.4"
        />
      </svg>
      <span
        className={cn(
          "absolute left-4 top-4 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold text-white shadow",
          LANE_TONES[lane].cursor,
        )}
      >
        {label}
      </span>
    </div>
  );
};
