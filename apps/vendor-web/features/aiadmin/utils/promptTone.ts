import type { PromptCategory } from "@pte/api-client";

/** A soft chip colour and the dot that goes with it. */
export interface Tone {
  chip: string;
  dot: string;
}

const NEUTRAL_TONE: Tone = {
  chip: "bg-slate-500/10 text-slate-700 ring-1 ring-inset ring-slate-500/30 dark:bg-slate-500/25 dark:text-slate-200 dark:ring-slate-400/50",
  dot: "bg-slate-500 dark:bg-slate-300",
};

/** One fixed colour per engine, so Gemini or Kokoro TTS looks the same on every row. */
const ENGINE_TONES: Record<string, Tone> = {
  GEMINI: { chip: "bg-violet-500/10 text-violet-700 ring-1 ring-inset ring-violet-500/30 dark:bg-violet-500/25 dark:text-violet-200 dark:ring-violet-400/50", dot: "bg-violet-500 dark:bg-violet-300" },
  AZURE: { chip: "bg-sky-500/10 text-sky-700 ring-1 ring-inset ring-sky-500/30 dark:bg-sky-500/25 dark:text-sky-200 dark:ring-sky-400/50", dot: "bg-sky-500 dark:bg-sky-300" },
  CODE: NEUTRAL_TONE,
  LLM: { chip: "bg-indigo-500/10 text-indigo-700 ring-1 ring-inset ring-indigo-500/30 dark:bg-indigo-500/25 dark:text-indigo-200 dark:ring-indigo-400/50", dot: "bg-indigo-500 dark:bg-indigo-300" },
  TTS: { chip: "bg-teal-500/10 text-teal-700 ring-1 ring-inset ring-teal-500/30 dark:bg-teal-500/25 dark:text-teal-200 dark:ring-teal-400/50", dot: "bg-teal-500 dark:bg-teal-300" },
  CHART: { chip: "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-500/25 dark:text-amber-200 dark:ring-amber-400/50", dot: "bg-amber-500 dark:bg-amber-300" },
};

const CATEGORY_TONES: Record<PromptCategory, Tone> = {
  GENERATION: { chip: "bg-indigo-500/10 text-indigo-700 ring-1 ring-inset ring-indigo-500/30 dark:bg-indigo-500/25 dark:text-indigo-200 dark:ring-indigo-400/50", dot: "bg-indigo-500 dark:bg-indigo-300" },
  REVIEW: { chip: "bg-rose-500/10 text-rose-700 ring-1 ring-inset ring-rose-500/30 dark:bg-rose-500/25 dark:text-rose-200 dark:ring-rose-400/50", dot: "bg-rose-500 dark:bg-rose-300" },
  SCORING: { chip: "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/30 dark:bg-emerald-500/25 dark:text-emerald-200 dark:ring-emerald-400/50", dot: "bg-emerald-500 dark:bg-emerald-300" },
  CHATBOT: { chip: "bg-sky-500/10 text-sky-700 ring-1 ring-inset ring-sky-500/30 dark:bg-sky-500/25 dark:text-sky-200 dark:ring-sky-400/50", dot: "bg-sky-500 dark:bg-sky-300" },
  SHARED: { chip: "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/30 dark:bg-amber-500/25 dark:text-amber-200 dark:ring-amber-400/50", dot: "bg-amber-500 dark:bg-amber-300" },
};

export const engineTone = (tag: string): Tone => ENGINE_TONES[tag] ?? NEUTRAL_TONE;

export const categoryTone = (category: PromptCategory): Tone => CATEGORY_TONES[category];

/** Level dots run from red (0) to green (top level), so a level list reads at a glance. */
export function levelDot(level: number, maxLevel: number): string {
  const ratio = maxLevel <= 0 ? 0 : level / maxLevel;
  if (ratio >= 0.8) return "bg-emerald-500";
  if (ratio >= 0.5) return "bg-lime-500";
  if (ratio > 0) return "bg-amber-500";
  return "bg-rose-500";
}
