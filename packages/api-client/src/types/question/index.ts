/**
 * Matches `services/authoring`'s real DTOs exactly (`CreateQuestionRequest`,
 * `QuestionResponse`, `OptionRequest`/`OptionResponse`, `PteTaskType`,
 * `QuestionStatus`) — the previous version of this file (questionType,
 * scoreWeight, prepTime, assetIds, version, parentId, ...) never matched any
 * real controller and was never exercised end to end. `GET /questions`
 * (`QuestionController.list`) returns a plain `List<QuestionResponse>` with
 * no pagination — there is no `page`/`size` query param on the real endpoint.
 */
export type PteSection = "SPEAKING" | "WRITING" | "READING" | "LISTENING";

export type PteTaskType =
  | "PERSONAL_INTRODUCTION"
  | "READ_ALOUD"
  | "REPEAT_SENTENCE"
  | "DESCRIBE_IMAGE"
  | "RE_TELL_LECTURE"
  | "ANSWER_SHORT_QUESTION"
  | "RESPOND_TO_A_SITUATION"
  | "SUMMARIZE_GROUP_DISCUSSION"
  | "SUMMARIZE_WRITTEN_TEXT"
  | "WRITE_ESSAY"
  | "MC_READING_SINGLE"
  | "MC_READING_MULTIPLE"
  | "RE_ORDER_PARAGRAPHS"
  | "FILL_BLANKS_READING"
  | "FILL_BLANKS_READING_WRITING"
  | "SUMMARIZE_SPOKEN_TEXT"
  | "MC_LISTENING_SINGLE"
  | "MC_LISTENING_MULTIPLE"
  | "FILL_BLANKS_LISTENING"
  | "HIGHLIGHT_CORRECT_SUMMARY"
  | "SELECT_MISSING_WORD"
  | "HIGHLIGHT_INCORRECT_WORDS"
  | "WRITE_FROM_DICTATION";

export type QuestionVisibility = "SHARED" | "PRIVATE";

/** Real enum (`services/authoring/domain/enums/QuestionStatus.java`) — not the previous fictitious DRAFT|ACTIVE|ARCHIVED. */
export type QuestionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface OptionRequest {
  text: string;
  correct: boolean;
  orderIndex: number;
}

export interface OptionResponse extends OptionRequest {
  publicId: string;
}

export interface CreateQuestionRequest {
  pteTaskType: PteTaskType | string;
  visibility: QuestionVisibility | string;
  title: string;
  promptText?: string | null;
  audioPromptRef?: string | null;
  imagePromptRef?: string | null;
  referenceAnswerText?: string | null;
  correctAnswerText?: string | null;
  minWordCount?: number | null;
  maxWordCount?: number | null;
  options?: OptionRequest[];
}

/** The real backend has no PUT /questions/{id} — kept only as a type; nothing calls it (QuestionEditorForm is an explicit stub). */
export type UpdateQuestionRequest = CreateQuestionRequest;

export interface QuestionResponse {
  publicId: string;
  pteTaskType: PteTaskType | string;
  section: PteSection | string;
  visibility: QuestionVisibility | string;
  tenantId: string | null;
  status: QuestionStatus | string;
  title: string;
  promptText: string | null;
  audioPromptRef: string | null;
  imagePromptRef: string | null;
  referenceAnswerText: string | null;
  correctAnswerText: string | null;
  minWordCount: number | null;
  maxWordCount: number | null;
  options: OptionResponse[];
}

/** GET /questions takes no query params at all today — kept as an empty shape so call sites don't need an `if` for "no filters yet". */
export type QuestionFilters = Record<string, never>;
