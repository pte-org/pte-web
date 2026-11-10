import { expect, it } from "vitest";
import type { AiScoreDetailResponse } from "@pte/api-client";
import { readAiRationales } from "../../../../features/examiner/utils/aiRationale";

const ai = (detail: Record<string, unknown>): AiScoreDetailResponse => ({ status: "SCORED", score: 1, criteria: {}, feedback: null,
  transcript: null, detail, fallback: false, failureReason: null });

it("reads trimmed reasons and evidence and skips malformed or empty entries", () => {
  expect(readAiRationales(ai({ traitRationales: { CONTENT: { reason: " ok ", evidence: 3 }, FORM: "x", GRAMMAR: { reason: "", evidence: "" } } })))
    .toEqual({ CONTENT: { reason: "ok", evidence: "" } });
});
it("returns nothing for results without rationales", () => {
  expect(readAiRationales(null)).toEqual({});
  expect(readAiRationales(ai({ traitRationales: null }))).toEqual({});
});
