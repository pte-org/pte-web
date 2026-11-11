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

/** Which product a question serves at creation; later moves use the availability flags on a draft. */
export type QuestionPool = "EXAM" | "PRACTICE";

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

/** CEFR level (A1 to C2) a question is written for. */
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface CreateQuestionRequest {
  pteTaskType: PteTaskType | string;
  /** Defaults to EXAM on the server; only accepted on create. */
  pool?: QuestionPool;
  promptText?: string | null;
  audioPromptRef?: string | null;
  imagePromptRef?: string | null;
  referenceAnswerText?: string | null;
  correctAnswerText?: string | null;
  minWordCount?: number | null;
  maxWordCount?: number | null;
  options?: OptionRequest[];
  /** Required before an exam question is submitted for approval. */
  cefrLevel?: CefrLevel | null;
  /** Student hint (Vietnamese) shown on request in practice; it explains the approach, never the answer. */
  answerHintVi?: string | null;
  /** Student hint (English) shown on request in practice. */
  answerHintEn?: string | null;
}

export type UpdateQuestionRequest = Omit<CreateQuestionRequest, "pteTaskType" | "pool"> & {
  version?: number;
  /** Moves a draft between products; omit both to leave availability untouched. */
  availableForExam?: boolean;
  availableForPractice?: boolean;
};

export interface GenerationMetricsResponse {
  words: number;
  avgSentenceLength: number;
  fleschKincaid: number;
}

export interface GenerationMediaResponse {
  voice: string | null;
  speed: number | null;
  durationSec: number | null;
  chartType: string | null;
}

export interface CheckResultResponse {
  ok: boolean;
  note?: string | null;
}

export interface ReviewVerdictResponse {
  verdict: string;
  checks: Record<string, CheckResultResponse>;
  fixSuggestion?: string | null;
}

export interface GenerationMetaResponse {
  schema: number;
  jobPublicId: string;
  model: Record<string, string>;
  promptVersion: string;
  topic: string;
  attempts: number;
  review: ReviewVerdictResponse;
  metrics: GenerationMetricsResponse;
  keyPoints: string[];
  media: GenerationMediaResponse;
  editedByHuman: boolean;
}

export interface QuestionResponse {
  publicId: string;
  pteTaskType: PteTaskType | string;
  taskTypeKey?: string | null;
  section: PteSection | string;
  pool: QuestionPool | string;
  tenantId: string | null;
  status: QuestionStatus | string;
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
  canDeleteDraft?: boolean;
  canArchive?: boolean;
  deleteBlockReason?: string | null;
  availableForExam?: boolean;
  availableForPractice?: boolean;
  /** True when this or an earlier revision was ever published (exam content may already be exposed). */
  previouslyPublished?: boolean;
  /** When the question last changed (ISO 8601). */
  updatedAt?: string;
  /** CEFR level the question is written for; null until classified. */
  cefrLevel?: CefrLevel | null;
  /** The academic who wrote the question; null for legacy rows without an owner. */
  authorUserPublicId?: string | null;
  /** AI provenance and review sheet; null for hand-written questions. Only exposed to authoring callers. */
  generationMeta?: GenerationMetaResponse | null;
  answerHintVi?: string | null;
  answerHintEn?: string | null;
}

export interface QuestionFilters {
  taskType?: string;
  section?: PteSection | string;
  status?: QuestionStatus | string;
  pool?: QuestionPool | string;
  q?: string;
  cefrLevel?: CefrLevel | string;
  aiGenerated?: boolean;
}

export interface QuestionStatsResponse {
  total: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  draft: number;
}
