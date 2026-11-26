import { describe, expect, it } from "vitest";
import type { QuestionResponse, QuestionVoiceCatalogResponse, QuestionVoiceOption } from "@pte/api-client";
import { canChangeVoice, currentVoiceOf, groupVoices } from "../../../../features/questionbank/voiceGroups";

const voice = (
  code: string,
  accent: QuestionVoiceOption["accent"],
  gender: QuestionVoiceOption["gender"],
): QuestionVoiceOption => ({ code, accent, gender, label: code });

const catalog: QuestionVoiceCatalogResponse = {
  voices: [],
  supportedTaskTypes: ["REPEAT_SENTENCE"],
};

function question(overrides: Partial<QuestionResponse> = {}): QuestionResponse {
  return {
    status: "DRAFT",
    pteTaskType: "REPEAT_SENTENCE",
    audioPromptRef: "audio-1",
    generationMeta: { media: { voice: "af_bella" } },
    ...overrides,
  } as unknown as QuestionResponse;
}

describe("groupVoices", () => {
  it("groups by accent then by gender, in a fixed order", () => {
    const groups = groupVoices([
      voice("bm_george", "UK", "MALE"),
      voice("af_heart", "US", "FEMALE"),
      voice("am_adam", "US", "MALE"),
      voice("bf_emma", "UK", "FEMALE"),
      voice("af_bella", "US", "FEMALE"),
    ]);

    expect(groups.map((group) => group.accent)).toEqual(["US", "UK"]);
    expect(groups[0]?.genders.map((entry) => entry.gender)).toEqual(["FEMALE", "MALE"]);
    expect(groups[0]?.genders[0]?.voices.map((entry) => entry.code)).toEqual(["af_heart", "af_bella"]);
    expect(groups[1]?.genders[1]?.voices.map((entry) => entry.code)).toEqual(["bm_george"]);
  });

  it("leaves out an accent or gender nobody speaks in", () => {
    const groups = groupVoices([voice("af_heart", "US", "FEMALE")]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.genders).toHaveLength(1);
  });

  it("returns nothing for no voices", () => {
    expect(groupVoices([])).toEqual([]);
  });
});

describe("currentVoiceOf", () => {
  it("reads the voice from the generation meta", () => {
    expect(currentVoiceOf(question())).toBe("af_bella");
  });

  it("is null for a hand-made question", () => {
    expect(currentVoiceOf(question({ generationMeta: null }))).toBeNull();
  });
});

describe("canChangeVoice", () => {
  it("allows a generated draft of a supported task type", () => {
    expect(canChangeVoice(question(), catalog)).toBe(true);
  });

  it.each([
    ["not a draft", question({ status: "APPROVED" })],
    ["no audio", question({ audioPromptRef: null })],
    ["a hand-made question", question({ generationMeta: null })],
    ["an unsupported task type", question({ pteTaskType: "SUMMARIZE_GROUP_DISCUSSION" })],
  ])("refuses %s", (_name, candidate) => {
    expect(canChangeVoice(candidate, catalog)).toBe(false);
  });

  it("waits for the catalog", () => {
    expect(canChangeVoice(question(), undefined)).toBe(false);
  });
});
