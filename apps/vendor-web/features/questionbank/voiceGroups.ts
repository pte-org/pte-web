import type {
  QuestionResponse,
  QuestionVoiceAccent,
  QuestionVoiceCatalogResponse,
  QuestionVoiceGender,
  QuestionVoiceOption,
} from "@pte/api-client";
import { VOICE_ACCENT_ORDER, VOICE_GENDER_ORDER } from "./voiceConstants";

export interface VoiceAccentGroup {
  accent: QuestionVoiceAccent;
  genders: { gender: QuestionVoiceGender; voices: QuestionVoiceOption[] }[];
}

/** The voices to pick from, by accent and then by gender; a group nobody speaks in is left out. */
export function groupVoices(voices: readonly QuestionVoiceOption[]): VoiceAccentGroup[] {
  return VOICE_ACCENT_ORDER.map((accent) => ({
    accent,
    genders: VOICE_GENDER_ORDER.map((gender) => ({
      gender,
      voices: voices.filter((voice) => voice.accent === accent && voice.gender === gender),
    })).filter((group) => group.voices.length > 0),
  })).filter((group) => group.genders.length > 0);
}

/** The single voice that spoke a generated question; null for hand-made or dialogue audio. */
export function currentVoiceOf(question: QuestionResponse): string | null {
  return question.generationMeta?.media?.voice ?? null;
}

/** Whether a draft's voice can be changed: the server keeps the text only for some task types. */
export function canChangeVoice(
  question: QuestionResponse,
  catalog: QuestionVoiceCatalogResponse | undefined,
): boolean {
  return (
    question.status === "DRAFT" &&
    Boolean(question.audioPromptRef) &&
    currentVoiceOf(question) !== null &&
    catalog !== undefined &&
    catalog.supportedTaskTypes.includes(String(question.pteTaskType))
  );
}
