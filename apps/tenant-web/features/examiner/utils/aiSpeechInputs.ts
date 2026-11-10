import type { AiScoreDetailResponse } from "@pte/api-client";

/** The raw Azure measurements behind the machine-scored speaking bands; absent for non-Azure results. */
export interface AiSpeechInputs {
  accuracy: number | null;
  oralFluencyInput: number | null;
  content: { achieved: number; wordCount: number; replacements: number; omissions: number; insertions: number } | null;
}

const SPEECH_FIELD = "speech";
const READ_ALOUD_CONTENT_FIELD = "readAloudContent";

const numberOf = (source: unknown, key: string): number | null => {
  if (typeof source !== "object" || source === null) return null;
  const value: unknown = Reflect.get(source, key);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

export function readAiSpeechInputs(ai: AiScoreDetailResponse | null | undefined): AiSpeechInputs {
  const speech = ai?.detail?.[SPEECH_FIELD];
  const raw = ai?.detail?.[READ_ALOUD_CONTENT_FIELD];
  const achieved = numberOf(raw, "achieved");
  const wordCount = numberOf(raw, "wordCount");
  const content = achieved !== null && wordCount !== null
    ? { achieved, wordCount, replacements: numberOf(raw, "replacements") ?? 0,
      omissions: numberOf(raw, "omissions") ?? 0, insertions: numberOf(raw, "insertions") ?? 0 }
    : null;
  return { accuracy: numberOf(speech, "accuracy"), oralFluencyInput: numberOf(speech, "oralFluencyInput"), content };
}
