import { describe, expect, it } from "vitest";
import type { AiScoreDetailResponse } from "@pte/api-client";
import { readAiSpeechInputs } from "@/features/examiner/utils/aiSpeechInputs";

const ai = (detail: Record<string, unknown>): AiScoreDetailResponse => ({
  status: "SCORED", score: 45, criteria: {}, feedback: null, transcript: null, detail, fallback: false, failureReason: null,
});

describe("readAiSpeechInputs", () => {
  it("reads the Azure measurements and Read Aloud word counts", () => {
    const inputs = readAiSpeechInputs(ai({
      speech: { accuracy: 61.5, fluency: 40, prosody: null, oralFluencyInput: 40 },
      readAloudContent: { wordCount: 12, achieved: 6, replacements: 2, omissions: 4, insertions: 0 },
    }));
    expect(inputs).toEqual({ accuracy: 61.5, oralFluencyInput: 40,
      content: { achieved: 6, wordCount: 12, replacements: 2, omissions: 4, insertions: 0 } });
  });

  it("returns nothing for an LLM result or malformed detail", () => {
    expect(readAiSpeechInputs(ai({ speech: "x", readAloudContent: { achieved: "6" } })))
      .toEqual({ accuracy: null, oralFluencyInput: null, content: null });
    expect(readAiSpeechInputs(null)).toEqual({ accuracy: null, oralFluencyInput: null, content: null });
  });
});
