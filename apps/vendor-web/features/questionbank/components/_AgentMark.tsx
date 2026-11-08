import type { ReactElement, ReactNode } from "react";
import { cn } from "@pte/ui";
import type { LiveLane } from "@/features/questiongeneration/liveConstants";
import { LANE_TONES } from "@/features/questiongeneration/liveTones";

/** A form field an AI agent is working on: tinted in that agent's colour, like text it has selected. */
export const AgentMark = ({ lane, children }: { lane?: LiveLane; children: ReactNode }): ReactElement => (
  <div className={cn("-m-1 p-1", lane && LANE_TONES[lane].mark)} data-agent={lane ?? undefined}>
    {children}
  </div>
);
