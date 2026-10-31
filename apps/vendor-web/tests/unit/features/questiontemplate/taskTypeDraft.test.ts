import { describe, expect, it } from "vitest";
import type { QuestionTypeResponse } from "@pte/api-client";
import {
  hasRequiredDraftFields,
  newDraft,
  toCreatePayload,
  toDraft,
  toUpdatePayload,
  type QuestionTypeFormDraft,
} from "../../../../features/questiontemplate/taskTypeDraft";

const completeDraft: QuestionTypeFormDraft = {
  ...newDraft(24),
  taskTypeKey: "CUSTOM_LISTEN",
  section: "LISTENING",
  displayName: " Custom listen ",
  shortName: " CL ",
  screenKey: "CUSTOM_SCREEN_V1",
  contractVersion: 1,
  instruction: "  Listen and answer.  ",
};

describe("task type draft instruction", () => {
  it("sends the trimmed instruction when creating a task type", () => {
    expect(toCreatePayload(completeDraft)).toMatchObject({
      displayName: "Custom listen",
      instruction: "Listen and answer.",
    });
  });

  it("still sends the instruction but no runtime fields for a runtime-locked task type", () => {
    const payload = toUpdatePayload(completeDraft, true);

    expect(payload.instruction).toBe("Listen and answer.");
    expect(payload).not.toHaveProperty("screenKey");
    expect(payload).not.toHaveProperty("contractVersion");
    expect(payload).not.toHaveProperty("section");
  });

  it("sends runtime fields together with the instruction when the task type is unlocked", () => {
    expect(toUpdatePayload(completeDraft, false)).toMatchObject({
      instruction: "Listen and answer.",
      screenKey: "CUSTOM_SCREEN_V1",
      contractVersion: 1,
      section: "LISTENING",
    });
  });

  it("blocks saving while the instruction is empty or whitespace", () => {
    expect(hasRequiredDraftFields(completeDraft)).toBe(true);
    expect(hasRequiredDraftFields({ ...completeDraft, instruction: "" })).toBe(false);
    expect(hasRequiredDraftFields({ ...completeDraft, instruction: "   " })).toBe(false);
  });

  it("starts an edit from the stored instruction and treats a missing one as empty", () => {
    const stored = { ...minimalType(), instruction: "Select the correct response." };

    expect(toDraft(stored).instruction).toBe("Select the correct response.");
    expect(toDraft({ ...stored, instruction: null }).instruction).toBe("");
    expect(newDraft(1).instruction).toBe("");
  });
});

function minimalType(): QuestionTypeResponse {
  return {
    publicId: "type-id",
    code: "MC_READING_SINGLE",
    displayName: "Multiple choice",
    shortName: "MCS",
    section: "READING",
    scored: true,
    active: true,
    displayOrder: 11,
    requiresAudioPrompt: false,
    requiresImagePrompt: false,
    requiresPromptText: true,
    requiresOptions: true,
    requiresCorrectAnswer: true,
    requiresWordCount: false,
    requiresSingleCorrectOption: true,
    usesOptionOrderAsCorrectPosition: false,
    requiresReferenceAnswer: false,
  };
}
