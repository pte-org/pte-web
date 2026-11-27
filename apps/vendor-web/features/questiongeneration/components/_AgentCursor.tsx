"use client";

import { useEffect, useRef, type ReactElement, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@pte/ui";
import {
  CLICK_RIPPLE_MS,
  CURSOR_EASE,
  EDGE,
  EDGE_PX,
  READ_SPEED,
  SWEEP_SPEED,
} from "../assemblyConstants";
import { useIsClient } from "../hooks/useIsClient";
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
 * An agent's pointer that glides to whatever it works on, like a collaborator's cursor; while an agent reads or makes
 * media it keeps moving over the field instead of standing still. Its position changes every
 * frame, so it is moved through the DOM rather than through React state.
 */
export const AgentCursor = ({ rootRef, target, lane, label }: AgentCursorProps): ReactElement | null => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const isClient = useIsClient();
  useEffect(() => {
    let frame = 0;
    let x = Number.NaN;
    let y = Number.NaN;
    let aimed: string | null = null;
    const follow = (): void => {
      const cursor = cursorRef.current;
      // The flying piece is rendered on the body, outside the root.
      const element = target ? (rootRef.current?.querySelector(target) ?? document.querySelector(target)) : null;
      if (cursor) {
        // A check being ticked or the edge of media being drawn: the cursor goes there and clicks when it moves on.
        const aim = element?.querySelector<HTMLElement>("[data-cursor-target]") ?? null;
        const aimKey = aim?.dataset.cursorTarget ?? null;
        if (aimKey !== aimed) {
          if (aimed !== null)
            ringRef.current?.animate(
              [
                { transform: "scale(.3)", opacity: 0.9 },
                { transform: "scale(2.2)", opacity: 0 },
              ],
              { duration: CLICK_RIPPLE_MS, easing: "ease-out" },
            );
          aimed = aimKey;
        }
        if (aim) {
          const box = aim.getBoundingClientRect();
          const goalX = box.left + Math.min(box.width, 24) * 0.6;
          const goalY = box.top + box.height * 0.55;
          x = Number.isNaN(x) ? goalX : x + (goalX - x) * CURSOR_EASE;
          y = Number.isNaN(y) ? goalY : y + (goalY - y) * CURSOR_EASE;
          cursor.style.transform = `translate(${x}px, ${y}px)`;
        } else if (element) {
          const caret = element.querySelector("[data-caret]");
          const box = (caret ?? element).getBoundingClientRect();
          // Without a caret the agent reads: it sweeps across the field and works its way down.
          const seconds = performance.now() / 1000;
          const across = 0.5 + 0.5 * Math.sin(seconds * SWEEP_SPEED);
          const down = (seconds * READ_SPEED) % 1;
          const goalX = caret ? box.right : box.left + box.width * (EDGE + (1 - 2 * EDGE) * across);
          const goalY = caret
            ? box.bottom - 4
            : box.top + EDGE_PX + Math.max(0, box.height - 2 * EDGE_PX) * down;
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
  }, [rootRef, target, isClient]);

  if (!isClient) return null;
  // On the body: a transformed ancestor (the full-screen layout) would turn `fixed` into its own frame and shift it.
  return createPortal(
    <div
      ref={cursorRef}
      aria-hidden
      data-visible="false"
      className="pointer-events-none fixed left-0 top-0 z-50 opacity-0 transition-opacity duration-300 data-[visible=true]:opacity-100"
    >
      <span
        ref={ringRef}
        className={cn(
          "absolute -left-2.5 -top-2.5 h-6 w-6 rounded-full border-2 opacity-0",
          LANE_TONES[lane].ring,
        )}
      />
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
    </div>,
    document.body,
  );
};
