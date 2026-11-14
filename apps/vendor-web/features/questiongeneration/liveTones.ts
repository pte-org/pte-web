import type { LiveLane } from "./liveConstants";

/** One colour per agent, so a step looks the same wherever it appears; the status only changes the frame. */
export interface LaneTone {
  frame: string;
  header: string;
  dot: string;
  cursor: string;
  /** A form field the agent is writing or reviewing: tinted and outlined in the agent's colour. */
  mark: string;
}

export const LANE_TONES: Record<LiveLane, LaneTone> = {
  GENERATOR: {
    frame: "border-indigo-500/40 bg-indigo-500/5",
    header: "text-indigo-700 dark:text-indigo-200",
    dot: "bg-indigo-500 dark:bg-indigo-300",
    cursor: "bg-indigo-500",
    mark: "rounded-md bg-indigo-500/10 ring-2 ring-indigo-500/60 transition-colors duration-300",
  },
  REVIEWER: {
    frame: "border-rose-500/40 bg-rose-500/5",
    header: "text-rose-700 dark:text-rose-200",
    dot: "bg-rose-500 dark:bg-rose-300",
    cursor: "bg-rose-500",
    mark: "rounded-md bg-rose-500/10 ring-2 ring-rose-500/60 transition-colors duration-300",
  },
  AUDIO: {
    frame: "border-teal-500/40 bg-teal-500/5",
    header: "text-teal-700 dark:text-teal-200",
    dot: "bg-teal-500 dark:bg-teal-300",
    cursor: "bg-teal-500",
    mark: "rounded-md bg-teal-500/10 ring-2 ring-teal-500/60 transition-colors duration-300",
  },
  IMAGE: {
    frame: "border-amber-500/40 bg-amber-500/5",
    header: "text-amber-700 dark:text-amber-200",
    dot: "bg-amber-500 dark:bg-amber-300",
    cursor: "bg-amber-500",
    mark: "rounded-md bg-amber-500/10 ring-2 ring-amber-500/60 transition-colors duration-300",
  },
  SAVE: {
    frame: "border-emerald-500/40 bg-emerald-500/5",
    header: "text-emerald-700 dark:text-emerald-200",
    dot: "bg-emerald-500 dark:bg-emerald-300",
    cursor: "bg-emerald-500",
    mark: "rounded-md bg-emerald-500/10 ring-2 ring-emerald-500/60 transition-colors duration-300",
  },
};

export const ITEM_CHIP_TONES: Record<string, string> = {
  QUEUED: "bg-slate-500/10 text-slate-700 dark:text-slate-200",
  GENERATING: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200",
  VALIDATING: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200",
  REVIEWING: "bg-rose-500/15 text-rose-700 dark:text-rose-200",
  RENDERING_MEDIA: "bg-teal-500/15 text-teal-700 dark:text-teal-200",
  READY: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
  SAVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
  FAILED: "bg-red-500/15 text-red-700 dark:text-red-200",
  CANCELLED: "bg-slate-500/10 text-slate-700 dark:text-slate-200",
};
