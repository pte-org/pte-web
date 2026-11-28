import type { SectionKey } from "./scoringWeights";

/** Text colour of each exam part, used for its icon, its numbers and its heading figure so the three parts read apart. */
export const PART_ACCENT: Record<SectionKey, string> = {
  speakingWriting: "text-[var(--sky-action)]",
  reading: "text-[var(--brand-ink)]",
  listening: "text-[var(--cream-action)]",
};
