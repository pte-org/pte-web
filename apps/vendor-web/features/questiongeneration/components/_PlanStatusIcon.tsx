import type { ReactElement } from "react";
import { cn } from "@pte/ui";
import type { LaneStatus } from "../liveConstants";

interface PlanStatusIconProps {
  status: LaneStatus;
  /** A question row uses the large icon, a step inside it the small one. */
  size?: "lg" | "sm";
}

const SIZE = { lg: "h-5 w-5", sm: "h-3.5 w-3.5" } as const;

/** Waiting: an empty ring. Running: a dashed ring with a pulsing dot. Done: a tick. Failed: a cross. */
export const PlanStatusIcon = ({ status, size = "lg" }: PlanStatusIconProps): ReactElement => {
  const box = cn("shrink-0", SIZE[size]);
  if (status === "done") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cn(box, "text-emerald-500")} aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cn(box, "text-red-500")} aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 9 6 6m0-6-6 6" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === "active") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cn(box, "text-blue-500")} aria-hidden>
        <circle cx="12" cy="12" r="10" strokeDasharray="4 3" className="origin-center motion-safe:animate-spin" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" className="motion-safe:animate-pulse" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={cn(box, "text-slate-400")} aria-hidden>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};
