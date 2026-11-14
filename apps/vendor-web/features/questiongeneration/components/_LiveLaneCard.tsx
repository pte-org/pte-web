"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { DisclosureChevron, MotionReveal, cn } from "@pte/ui";
import type { LaneStatus, LiveLane } from "../liveConstants";
import { LANE_TONES } from "../liveTones";
import { PlanStatusIcon } from "./_PlanStatusIcon";

interface LiveLaneCardProps {
  lane: LiveLane;
  label: string;
  status: LaneStatus;
  /** Shown at the right of the step, e.g. the attempt number. */
  aside?: string;
  children: ReactNode;
}

/**
 * One step of a question in the plan: its status icon and name, and once it has started, what its agent wrote. The
 * name opens and closes what was written, so a long step can be folded away.
 */
export const LiveLaneCard = ({ lane, label, status, aside, children }: LiveLaneCardProps): ReactElement => {
  const [open, setOpen] = useState(true);
  const started = status !== "waiting";
  return (
    <li className="space-y-2">
      <button type="button" aria-expanded={started ? open : undefined} disabled={!started}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2 rounded-md text-left text-sm enabled:hover:bg-[var(--surface-subtle)]">
        <PlanStatusIcon status={status} size="sm" />
        <span className={cn(
          status === "waiting" && "text-[var(--ink-muted)]",
          status === "active" && cn("font-medium", LANE_TONES[lane].header),
          status === "done" && "text-[var(--ink-muted)] line-through",
          status === "failed" && "text-red-600 dark:text-red-300",
        )}>{label}</span>
        <span className="ml-auto flex items-center gap-1">
          {aside && <span className="text-xs text-[var(--ink-muted)]">{aside}</span>}
          {started && <DisclosureChevron expanded={open} />}
        </span>
      </button>
      {started && open && (
        <MotionReveal className={cn("ml-5 rounded-lg border p-3", LANE_TONES[lane].frame)}>{children}</MotionReveal>
      )}
    </li>
  );
};

/** A blinking caret after the text an agent is still writing. */
export const WritingCursor = ({ lane }: { lane: LiveLane }): ReactElement => (
  <span className={cn("ml-0.5 inline-block h-4 w-1.5 animate-pulse align-middle", LANE_TONES[lane].cursor)} />
);
