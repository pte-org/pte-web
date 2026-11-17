"use client";

import type { ReactElement, ReactNode } from "react";
import { MotionReveal, cn } from "@pte/ui";
import type { LaneStatus } from "../liveConstants";
import { PlanStatusIcon } from "./_PlanStatusIcon";

interface PlanTaskRowProps {
  label: string;
  status: LaneStatus;
  stageLabel: string;
  /** Badge colours of the stage. */
  stageTone: string;
  expanded: boolean;
  onSelect: () => void;
  /** The steps of the question, shown when it is opened. */
  children: ReactNode;
}

/** One question in the plan: its status, name and stage, opening onto its steps. */
export const PlanTaskRow = ({ label, status, stageLabel, stageTone, expanded, onSelect, children }: PlanTaskRowProps): ReactElement => (
  <li>
    <button type="button" aria-expanded={expanded} onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--surface-subtle)]">
      <PlanStatusIcon status={status} />
      <span className={cn("text-sm", status === "waiting" ? "text-[var(--ink-muted)]" : "font-medium")}>{label}</span>
      <span className={cn("ml-auto rounded-md px-2 py-0.5 text-xs font-medium", stageTone)}>{stageLabel}</span>
    </button>
    {expanded && <MotionReveal className="pb-3 pt-1">{children}</MotionReveal>}
  </li>
);
