import { describe, expect, it } from "vitest";
import type { QuestionGenerationBatchQuestion } from "@pte/api-client";
import {
  filterSlots,
  previewKind,
  sectionCounts,
  slotAgent,
  slotState,
} from "../../../../features/batchgeneration/utils/batchResults";

const slot = (
  change: Partial<QuestionGenerationBatchQuestion>,
): QuestionGenerationBatchQuestion => ({
  jobPublicId: "job-a",
  batchSeq: 0,
  itemIndex: 0,
  taskType: "READ_ALOUD",
  cefrLevel: "B2",
  stage: "QUEUED",
  failureCode: null,
  questionPublicId: null,
  section: null,
  topic: null,
  promptExcerpt: null,
  options: [],
  correctOptionIndex: null,
  audioRef: null,
  imageRef: null,
  audioSeconds: null,
  voice: null,
  chartType: null,
  words: null,
  reviewPassed: null,
  reviewTotal: null,
  ...change,
});

describe("batch results", () => {
  it("reads where a slot stands and which agent works on it", () => {
    expect(slotState(slot({ stage: "SAVED" }))).toBe("saved");
    expect(slotState(slot({ stage: "READY" }))).toBe("saved");
    expect(slotState(slot({ stage: "REVIEWING" }))).toBe("running");
    expect(slotState(slot({ stage: "FAILED" }))).toBe("failed");
    expect(slotState(slot({ stage: "QUEUED" }))).toBe("waiting");
    expect(slotAgent(slot({ stage: "VALIDATING" }))).toBe("GEN");
    expect(slotAgent(slot({ stage: "RENDERING_MEDIA" }))).toBe("MEDIA");
    expect(slotAgent(slot({ stage: "SAVED" }))).toBeNull();
  });

  it("previews a question by what it has", () => {
    expect(previewKind(slot({ imageRef: "img" }))).toBe("image");
    expect(previewKind(slot({ options: ["A"], promptExcerpt: "Read" }))).toBe("options");
    expect(previewKind(slot({ audioRef: "aud" }))).toBe("audio");
    expect(previewKind(slot({ promptExcerpt: "The city" }))).toBe("text");
  });

  it("counts saved slots per section and filters them", () => {
    const slots = [
      slot({ stage: "SAVED", section: "SPEAKING" }),
      slot({ itemIndex: 1, stage: "GENERATING" }),
      slot({ jobPublicId: "job-b", batchSeq: 1, taskType: "WRITE_ESSAY", stage: "FAILED" }),
    ];
    const sectionOf = (taskType: string): string | null =>
      taskType === "WRITE_ESSAY" ? "WRITING" : "SPEAKING";
    expect(sectionCounts(slots, sectionOf)).toEqual([
      { section: "SPEAKING", done: 1, total: 2 },
      { section: "WRITING", done: 0, total: 1 },
    ]);
    expect(filterSlots(slots, "failed")).toHaveLength(1);
    expect(filterSlots(slots, "all")).toHaveLength(3);
  });
});
