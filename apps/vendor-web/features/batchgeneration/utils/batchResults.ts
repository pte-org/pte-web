import type { QuestionGenerationBatchQuestion } from "@pte/api-client";

/** Where one question slot of a batch stands, which decides how its card looks. */
export type SlotState = "saved" | "running" | "waiting" | "failed" | "cancelled";
/** The agent at work on a running slot: the writer (writing and checking), the reviewer, or the media makers. */
export type SlotAgent = "GEN" | "REV" | "MEDIA";
export type ResultFilter = "all" | "saved" | "failed";
/** What a saved question's card previews. */
export type PreviewKind = "text" | "options" | "audio" | "image";

const SAVED_STAGES: readonly string[] = ["READY", "SAVED"];
const AGENT_OF_STAGE: Readonly<Record<string, SlotAgent>> = {
  GENERATING: "GEN",
  VALIDATING: "GEN",
  REVIEWING: "REV",
  RENDERING_MEDIA: "MEDIA",
};

export function slotState(slot: QuestionGenerationBatchQuestion): SlotState {
  if (SAVED_STAGES.includes(slot.stage)) return "saved";
  if (slot.stage === "FAILED") return "failed";
  if (slot.stage === "CANCELLED") return "cancelled";
  return AGENT_OF_STAGE[slot.stage] ? "running" : "waiting";
}

export const slotAgent = (slot: QuestionGenerationBatchQuestion): SlotAgent | null =>
  AGENT_OF_STAGE[slot.stage] ?? null;

export function previewKind(slot: QuestionGenerationBatchQuestion): PreviewKind {
  if (slot.imageRef) return "image";
  if (slot.options.length > 0) return "options";
  if (slot.audioRef && !slot.promptExcerpt) return "audio";
  return slot.promptExcerpt ? "text" : "audio";
}

export interface SectionCount {
  section: string;
  done: number;
  total: number;
}

/** Saved out of planned per exam section, in the order sections first appear. */
export function sectionCounts(
  slots: readonly QuestionGenerationBatchQuestion[],
  sectionOf: (taskType: string) => string | null,
): SectionCount[] {
  const counts = new Map<string, SectionCount>();
  for (const slot of slots) {
    const section = slot.section ?? sectionOf(slot.taskType);
    if (!section) continue;
    const entry = counts.get(section) ?? { section, done: 0, total: 0 };
    entry.total += 1;
    if (slotState(slot) === "saved") entry.done += 1;
    counts.set(section, entry);
  }
  return [...counts.values()];
}

export function filterSlots(
  slots: readonly QuestionGenerationBatchQuestion[],
  filter: ResultFilter,
): QuestionGenerationBatchQuestion[] {
  if (filter === "all") return [...slots];
  return slots.filter((slot) => slotState(slot) === filter);
}
