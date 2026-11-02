import { describe, expect, it } from "vitest";
import type { QuestionResponse, QuestionTypeResponse } from "@pte/api-client";
import { buildQuestionPreviewDraft } from "../../../../features/questionbank/questionPreviewDraft";

const media = { imageUrl: null, audioUrl: null };

const question = (overrides: Partial<QuestionResponse> = {}): QuestionResponse =>
  ({
    publicId: "q-1",
    pteTaskType: "READ_ALOUD",
    taskTypeKey: "READ_ALOUD",
    section: "SPEAKING",
    promptText: "Cities are greening.",
    audioPromptRef: null,
    imagePromptRef: null,
    minWordCount: null,
    maxWordCount: null,
    options: [],
    ...overrides,
  }) as QuestionResponse;

const type = (overrides: Partial<QuestionTypeResponse> = {}): QuestionTypeResponse =>
  ({
    code: "READ_ALOUD",
    displayName: "Read Aloud",
    section: "SPEAKING",
    instruction: "Read the text aloud.",
    requiresAudioPrompt: false,
    requiresImagePrompt: false,
    requiresWordCount: false,
    requiresSingleCorrectOption: false,
    ...overrides,
  }) as QuestionTypeResponse;

describe("buildQuestionPreviewDraft", () => {
  it("takes the name, section and instruction from the task type", () => {
    const draft = buildQuestionPreviewDraft(question(), type(), media);
    expect(draft).toMatchObject({
      taskName: "Read Aloud",
      section: "SPEAKING",
      instruction: "Read the text aloud.",
      promptText: "Cities are greening.",
    });
  });

  it("orders options and marks several-answer questions as multiple choice", () => {
    const draft = buildQuestionPreviewDraft(
      question({
        options: [
          { publicId: "b", text: "Second", correct: true, orderIndex: 1 },
          { publicId: "a", text: "First", correct: true, orderIndex: 0 },
        ] as QuestionResponse["options"],
      }),
      type({ requiresSingleCorrectOption: false }),
      media,
    );
    expect(draft.options).toEqual(["First", "Second"]);
    expect(draft.multipleChoice).toBe(true);
  });

  it("falls back to the question's own data when the task type is unknown", () => {
    const draft = buildQuestionPreviewDraft(
      question({ imagePromptRef: "img-1", minWordCount: 50, maxWordCount: 80 }),
      undefined,
      { imageUrl: "https://cdn/x.png", audioUrl: null },
    );
    expect(draft).toMatchObject({
      taskName: "READ_ALOUD",
      expectsImage: true,
      expectsAudio: false,
      needsWordCount: true,
      minWordCount: 50,
      maxWordCount: 80,
      imageUrl: "https://cdn/x.png",
    });
  });
});
