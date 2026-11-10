import type { ChipTone } from "@pte/ui";

const CEFR_TONES: Record<string, ChipTone> = {
  A1: "neutral",
  A2: "neutral",
  B1: "sky",
  B2: "mint",
  C1: "cream",
  C2: "blush",
};

/** The colour of a CEFR level; neutral for the levels below the standard exam range. */
export const cefrTone = (level: string | null | undefined): ChipTone =>
  CEFR_TONES[(level ?? "").toUpperCase()] ?? "neutral";

const SECTION_TONES: Record<string, ChipTone> = {
  SPEAKING: "sky",
  WRITING: "mint",
  READING: "cream",
  LISTENING: "blush",
};

/** The colour of an exam section; the same section has the same colour on every screen. */
export const sectionTone = (section: string | null | undefined): ChipTone =>
  SECTION_TONES[(section ?? "").toUpperCase()] ?? "neutral";
