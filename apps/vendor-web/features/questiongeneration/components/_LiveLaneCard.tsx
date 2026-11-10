"use client";

import type { ReactElement, ReactNode } from "react";
import { cn } from "@pte/ui";
import type { LaneStatus, LiveLane } from "../liveConstants";
import { LANE_TONES, STATUS_FRAME } from "../liveTones";

interface LiveLaneCardProps {
  lane: LiveLane;
  label: string;
  status: LaneStatus;
  /** Shown at the right of the header, e.g. the attempt number. */
  aside?: string;
  children: ReactNode;
}

/** The frame of one agent's work on an item, in that agent's colour. */
export const LiveLaneCard = ({ lane, label, status, aside, children }: LiveLaneCardProps): ReactElement => {
  const tone = LANE_TONES[lane];
  return (
    <section className={cn("rounded-xl border p-4 transition-opacity", tone.frame, STATUS_FRAME[status])}>
      <header className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", tone.header)}>
        <span className={cn("h-2.5 w-2.5 rounded-full", tone.dot, status === "active" && "animate-pulse")} />
        <span>{label}</span>
        {aside && <span className="ml-auto text-xs font-normal opacity-80">{aside}</span>}
      </header>
      {children}
    </section>
  );
};

/** A blinking caret after the text an agent is still writing. */
export const WritingCursor = ({ lane }: { lane: LiveLane }): ReactElement => (
  <span className={cn("ml-0.5 inline-block h-4 w-1.5 animate-pulse align-middle", LANE_TONES[lane].cursor)} />
);
