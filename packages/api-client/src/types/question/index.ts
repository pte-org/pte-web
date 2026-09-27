/**
 * Matches `services/authoring`'s real DTOs exactly (`CreateQuestionRequest`,
 * `QuestionResponse`, `OptionRequest`/`OptionResponse`, `PteTaskType`,
 * `QuestionStatus`) — the previous version of this file (questionType,
 * scoreWeight, prepTime, assetIds, version, parentId, ...) never matched any
 * real controller and was never exercised end to end. `GET /questions`
 * (`QuestionController.list`) returns the common `PagedResult` envelope.
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
  | "FILL_IN_THE_BLANKS_DRAG_AND_DROP"
  | "FILL_IN_THE_BLANKS_DROPDOWN"
  | "SUMMARIZE_SPOKEN_TEXT"
  | "MC_LISTENING_SINGLE"
  | "MC_LISTENING_MULTIPLE"
  | "FILL_IN_THE_BLANKS_TYPE_IN"
  | "HIGHLIGHT_CORRECT_SUMMARY"
  | "SELECT_MISSING_WORD"
  | "HIGHLIGHT_INCORRECT_WORDS"
  | "WRITE_FROM_DICTATION";

export type QuestionVisibility = "SHARED" | "PRIVATE";

/** Real enum (`services/authoring/domain/enums/QuestionStatus.java`) — not the previous fictitious DRAFT|ACTIVE|ARCHIVED. */
export type QuestionStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "ARCHIVED";

export interface OptionRequest {
  text: string;
  correct: boolean;
  orderIndex: number;
  blankIndex?: number | null;
  correctGapIndex?: number | null;
}

export interface OptionResponse extends OptionRequest {
  publicId: string;
}

export interface CreateQuestionRequest {
  pteTaskType: PteTaskType | string;
  visibility?: QuestionVisibility | string;
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

export type UpdateQuestionRequest = Omit<CreateQuestionRequest, "pteTaskType" | "visibility"> & {
  version?: number;
};

export interface QuestionResponse {
  publicId: string;
  pteTaskType: PteTaskType | string;
  taskTypeKey?: string | null;
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
  revisionGroupPublicId?: string | null;
  revisionNumber?: number;
  supersedesPublicId?: string | null;
  current?: boolean;
  version?: number;
  rejectionReason?: string | null;
}

export interface QuestionFilters {
  taskType?: string;
  section?: PteSection | string;
  status?: QuestionStatus | string;
  q?: string;
}

export interface QuestionStatsResponse {
  total: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  draft: number;
}
