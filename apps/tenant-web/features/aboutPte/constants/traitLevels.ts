import {
  CONTENT_READ_ALOUD,
  CONTENT_REPEAT_SENTENCE,
  CONTENT_SPEAKING,
  ORAL_FLUENCY,
  PRONUNCIATION,
  VOCABULARY_SHORT_ANSWER,
  type TraitInfo,
} from "./traitLevels.speaking";
import {
  CONTENT_ESSAY,
  CONTENT_SUMMARY,
  DEVELOPMENT,
  FORM_ESSAY,
  FORM_SUMMARY_SPOKEN,
  FORM_SUMMARY_WRITTEN,
  GENERAL_RANGE,
  GRAMMAR,
  SPELLING,
  VOCABULARY,
  VOCABULARY_RANGE,
} from "./traitLevels.writing";

export type { Localized, TraitInfo, TraitLevel } from "./traitLevels.speaking";

/** Trait name → description, shared by every question type that uses the trait. */
const SHARED: Record<string, TraitInfo> = {
  Pronunciation: PRONUNCIATION,
  "Oral Fluency": ORAL_FLUENCY,
  Grammar: GRAMMAR,
  Vocabulary: VOCABULARY,
  "Vocabulary Range": VOCABULARY_RANGE,
  Spelling: SPELLING,
  "Development, Structure & Coherence": DEVELOPMENT,
  "General Linguistic Range": GENERAL_RANGE,
};

/** "TASK_KEY:Trait" → description, where the same trait name means something different per question type. */
const PER_TASK: Record<string, TraitInfo> = {
  "READ_ALOUD:Content": CONTENT_READ_ALOUD,
  "REPEAT_SENTENCE:Content": CONTENT_REPEAT_SENTENCE,
  "DESCRIBE_IMAGE:Content": CONTENT_SPEAKING,
  "RE_TELL_LECTURE:Content": CONTENT_SPEAKING,
  "SUMMARIZE_GROUP_DISCUSSION:Content": CONTENT_SPEAKING,
  "RESPOND_TO_A_SITUATION:Content": CONTENT_SPEAKING,
  "ANSWER_SHORT_QUESTION:Vocabulary": VOCABULARY_SHORT_ANSWER,
  "SUMMARIZE_WRITTEN_TEXT:Content": CONTENT_SUMMARY,
  "SUMMARIZE_WRITTEN_TEXT:Form": FORM_SUMMARY_WRITTEN,
  "SUMMARIZE_SPOKEN_TEXT:Content": CONTENT_SUMMARY,
  "SUMMARIZE_SPOKEN_TEXT:Form": FORM_SUMMARY_SPOKEN,
  "WRITE_ESSAY:Content": CONTENT_ESSAY,
  "WRITE_ESSAY:Form": FORM_ESSAY,
};

export const traitInfoFor = (taskKey: string, traitName: string): TraitInfo | undefined =>
  PER_TASK[`${taskKey}:${traitName}`] ?? SHARED[traitName];
