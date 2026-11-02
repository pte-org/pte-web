import type { ChipTone } from "@pte/ui";

// The same fact has the same colour on every screen: one tone per exam section, and one each for
// the question pool and the task type.
const SECTION_TONES: Record<string, ChipTone> = {
  SPEAKING: "sky",
  WRITING: "mint",
  READING: "cream",
  LISTENING: "blush",
};

/** The colour of an exam section (Speaking, Writing, Reading, Listening); neutral for anything else. */
export const sectionTone = (section: string | null | undefined): ChipTone =>
  SECTION_TONES[(section ?? "").toUpperCase()] ?? "neutral";

export const POOL_TONE: ChipTone = "action";
export const TASK_TYPE_TONE: ChipTone = "brand";
