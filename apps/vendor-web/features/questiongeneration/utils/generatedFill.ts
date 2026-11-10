import type { CreateQuestionRequest, QuestionGenerationLiveItem } from "@pte/api-client";

const KEY_PREFIX = "pte.generatedFill.";

/** The form values of a question an AI run wrote: its fields plus the audio or image made for it. */
export function generatedValues(item: QuestionGenerationLiveItem | undefined): Partial<CreateQuestionRequest> | null {
  if (!item?.draft) return null;
  const values: Partial<CreateQuestionRequest> = { ...item.draft.fields };
  if (item.audioRef) values.audioPromptRef = item.audioRef;
  if (item.imageRef) values.imagePromptRef = item.imageRef;
  return values;
}

/** Hands a written question to the new-question form, for this browser tab only. */
export function storeGeneratedFill(jobId: string, valuesJson: string): void {
  sessionStorage.setItem(KEY_PREFIX + jobId, valuesJson);
}

/** The raw stored question for a job, or null; read as a string so React can compare snapshots. */
export function readGeneratedFill(jobId: string): string | null {
  return sessionStorage.getItem(KEY_PREFIX + jobId);
}
