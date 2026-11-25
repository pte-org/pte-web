import { describe, expect, it } from "vitest";
import type { QuestionTypeResponse } from "@pte/api-client";
import { livePreviewDraft } from "../../../../features/questiongeneration/utils/livePreviewDraft";

// Only the fields the exam screen reads; the rest of the response does not matter here.
const MCS_TYPE = {
  code: "MULTIPLE_CHOICE_SINGLE",
  displayName: "Multiple Choice, Single Answer",
  section: "READING",
  instruction: "Choose the single correct answer.",
  requiresSingleCorrectOption: true,
  requiresWordCount: false,
  requiresImagePrompt: false,
  requiresAudioPrompt: false,
} as QuestionTypeResponse;

const base = {
  taskType: "MULTIPLE_CHOICE_SINGLE",
  questionType: MCS_TYPE,
  audioUrl: null,
  imageUrl: null,
};

describe("livePreviewDraft", () => {
  it("shows the writer's typed passage, question and options before the draft is mapped", () => {
    const draft = livePreviewDraft({
      ...base,
      typed: {
        topic: "Bridges",
        passage: "The council waited.",
        question: "Why?",
        options: ["A", "B"],
      },
      fields: null,
    });
    expect(draft.promptText).toBe("The council waited.\n\nWhy?");
    expect(draft.options).toEqual(["A", "B"]);
    expect(draft.multipleChoice).toBe(false);
    expect(draft.taskName).toBe("Multiple Choice, Single Answer");
  });

  it("switches to the mapped fields once the server sends them, options in order", () => {
    const draft = livePreviewDraft({
      ...base,
      typed: { passage: "half typed" },
      fields: {
        promptText: "Final prompt",
        options: [
          { text: "Second", correct: false, orderIndex: 1 },
          { text: "First", correct: true, orderIndex: 0 },
        ],
      },
    });
    expect(draft.promptText).toBe("Final prompt");
    expect(draft.options).toEqual(["First", "Second"]);
  });

  it("is empty but named while nothing is typed yet", () => {
    const draft = livePreviewDraft({ ...base, typed: null, fields: null });
    expect(draft.promptText).toBe("");
    expect(draft.options).toEqual([]);
    expect(draft.instruction).toBe("Choose the single correct answer.");
  });
});
