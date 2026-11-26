import type { ApiClient } from "../client/client";
import type { QuestionResponse } from "../types/question";
import type {
  ChangeQuestionVoiceRequest,
  QuestionVoiceCatalogResponse,
} from "../types/generationVoice";

export const QUESTION_VOICE_ENDPOINTS = {
  voices: "/api/v1/question-generation/voices",
  sample: (voice: string) => `/api/v1/question-generation/voices/${encodeURIComponent(voice)}/sample`,
  change: (questionId: string) => `/api/v1/questions/${questionId}/audio/voice`,
} as const;

/** The voices that are switched on and the task types whose voice can be changed. */
export function getQuestionVoiceCatalog(client: ApiClient): Promise<QuestionVoiceCatalogResponse> {
  return client.request<QuestionVoiceCatalogResponse>(QUESTION_VOICE_ENDPOINTS.voices);
}

/** A short spoken sample of one voice, as audio the browser can play. */
export async function getQuestionVoiceSample(client: ApiClient, voice: string): Promise<Blob> {
  const { blob } = await client.download(QUESTION_VOICE_ENDPOINTS.sample(voice));
  return blob;
}

/** Speaks a draft question again with another voice; the question comes back with its new audio. */
export function changeQuestionVoice(
  client: ApiClient,
  questionId: string,
  payload: ChangeQuestionVoiceRequest,
): Promise<QuestionResponse> {
  return client.request<QuestionResponse>(QUESTION_VOICE_ENDPOINTS.change(questionId), {
    method: "POST",
    body: payload,
  });
}
