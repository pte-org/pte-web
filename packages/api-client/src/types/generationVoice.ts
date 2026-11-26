/**
 * Voices of spoken questions.
 * Maps to backend DTOs in com.pte.itembank.internal.generation.voice
 */

export type QuestionVoiceAccent = "US" | "UK";
export type QuestionVoiceGender = "FEMALE" | "MALE";

export interface QuestionVoiceOption {
  code: string;
  accent: QuestionVoiceAccent;
  gender: QuestionVoiceGender;
  label: string;
}

export interface QuestionVoiceCatalogResponse {
  voices: QuestionVoiceOption[];
  /** Task types whose saved questions can be spoken again with another voice. */
  supportedTaskTypes: string[];
}

export interface ChangeQuestionVoiceRequest {
  voice: string;
  /** The version of the question the person was looking at. */
  version: number;
}
