/**
 * Question generation API types
 * Maps to backend DTOs in com.pte.itembank.internal.generation.dto
 * (Not to be confused with exam form generation in scheduling)
 */

import type { CreateQuestionRequest } from "../question";

export type QuestionGenerationJobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLING" | "CANCELLED";

export type QuestionGenerationItemStage =
  | "QUEUED"
  | "GENERATING"
  | "VALIDATING"
  | "REVIEWING"
  | "RENDERING_MEDIA"
  /** Written into the question form it was asked from and not saved: the person decides. */
  | "READY"
  | "SAVED"
  | "FAILED"
  | "CANCELLED";

export type QuestionGenerationJobAction = "CANCEL";

export interface QuestionGenerationTaskTypeResponse {
  taskType: string;
  section: string;
  needsAudio: boolean;
  needsImage: boolean;
  estimatedSecondsPerItem: number;
}

export interface QuestionGenerationItemResponse {
  index: number;
  stage: QuestionGenerationItemStage;
  questionPublicId: string | null;
  failureCode: string | null;
  failureNote: string | null;
}

export interface QuestionGenerationJobResponse {
  publicId: string;
  taskType: string;
  cefrLevel: string; // B1, B2, C1, C2
  pool: string; // PRACTICE or EXAM
  topicHint: string | null;
  /** Describe Image only: AUTO, CHART or PICTURE. */
  imageKind?: string | null;
  /** False for a job started from the question form: its question goes back to the form, not into the bank. */
  saveQuestions?: boolean;
  requestedCount: number;
  status: QuestionGenerationJobStatus;
  succeededCount: number;
  failedCount: number;
  failureCode: string | null;
  createdAt: string; // ISO 8601
  startedAt: string | null; // ISO 8601
  finishedAt: string | null; // ISO 8601
  items: QuestionGenerationItemResponse[];
}

/** The agent that wrote a piece of text in the live view of a job. */
export type QuestionGenerationLiveAgent = "GENERATOR" | "REVIEWER";

/** What an agent wrote in its current call for an item, and how many calls it made for it. */
export interface QuestionGenerationLiveText {
  attempt: number;
  text: string;
}

export interface QuestionGenerationLiveItem {
  index: number;
  stage: QuestionGenerationItemStage | null;
  /** The agent that started last; the writer may rewrite a rejected draft while the stage is still REVIEWING. */
  activeAgent: QuestionGenerationLiveAgent | null;
  generator: QuestionGenerationLiveText | null;
  reviewer: QuestionGenerationLiveText | null;
  audioRef: string | null;
  imageRef: string | null;
  /** The generator's latest draft as the question form's fields (absent from an older server). */
  draft?: QuestionGenerationLiveDraft | null;
  /** The last verdict of a reviewer. */
  review?: QuestionGenerationLiveReview | null;
  /** The checks of the current round of writing, in the order they started (absent from an older server). */
  checks?: QuestionGenerationLiveCheck[];
}

/** A step inside writing a draft: the prompt, the model writing, the JSON, the task type's rules, duplicates. */
export type QuestionGenerationCheckStep =
  | "PROMPT" | "WRITE" | "JSON" | "RULES" | "DUPLICATE"
  /** The reviewer's steps. */
  | "REVIEW_PROMPT" | "REVIEW_WRITE" | "REVIEW_VERDICT";

export interface QuestionGenerationLiveCheck {
  index: number;
  step: QuestionGenerationCheckStep;
  status: "RUNNING" | "PASSED" | "FAILED";
  /** Facts shown next to the check, by name: cefr, topic, avoidedTopics, feedback, retry, fixed, issues. */
  facts: Record<string, string>;
  /** Lines listed under the check, in order (absent from an older server). */
  details?: QuestionGenerationCheckDetail[];
}

/**
 * One line under a check. CHARS, WORDS and ITEMS come with `count`; TEXT with `text`; PRESENT only names `key`, a
 * field the model wrote. `key` is a draft field or one of: systemPrompt, taskPrompt, promptKey, cefr, topicHint,
 * avoidedTopics, feedback, output, answerHintVi, answerHintEn, contentHash, taskType.
 */
export interface QuestionGenerationCheckDetail {
  key: string;
  unit: "CHARS" | "WORDS" | "ITEMS" | "TEXT" | "PRESENT";
  text: string | null;
  count: number | null;
}

export interface QuestionGenerationLiveDraft {
  index: number;
  /** 1 for the first draft, 2 for the rewrite after a rejection. */
  attempt: number;
  fields: CreateQuestionRequest;
}

export interface QuestionGenerationLiveReview {
  index: number;
  /** CONTENT for the text, IMAGE for a drawn chart. */
  kind: "CONTENT" | "IMAGE";
  passed: boolean;
  fixSuggestion: string | null;
  /** The note of every check that failed, by check name. */
  notes: Record<string, string>;
}

/** The events of `GET /question-generation/jobs/{id}/live`, by name. */
export type QuestionGenerationLiveEvent =
  | { type: "snapshot"; items: QuestionGenerationLiveItem[]; finished: boolean }
  | { type: "begin"; index: number; agent: QuestionGenerationLiveAgent; attempt: number }
  | { type: "token"; index: number; agent: QuestionGenerationLiveAgent; delta: string }
  | { type: "stage"; index: number; stage: QuestionGenerationItemStage }
  | { type: "media"; index: number; audioRef: string | null; imageRef: string | null }
  | ({ type: "draft" } & QuestionGenerationLiveDraft)
  | ({ type: "review" } & QuestionGenerationLiveReview)
  | ({ type: "check" } & QuestionGenerationLiveCheck)
  | { type: "item"; index: number }
  | { type: "end"; finished: boolean };

export interface QuestionGenerationQuotaResponse {
  usedToday: number;
  dailyLimit: number;
}

export interface QuestionGenerationJobCreateRequest {
  taskType: string;
  cefrLevel: string; // B1, B2, C1, C2
  pool: string; // PRACTICE or EXAM
  topicHint?: string | null;
  count: number;
  /** False for a question written into the form only; the person saves it. Defaults to true. */
  saveQuestions?: boolean;
  /** Describe Image only: a chart from data, an AI-painted picture, or AUTO (chosen from the topic). */
  imageKind?: "AUTO" | "CHART" | "PICTURE";
}

export interface QuestionGenerationJobStatusRequest {
  action: QuestionGenerationJobAction;
}

// Export legacy names for backward compatibility (but deprecated)
/** @deprecated Use QuestionGenerationJobStatus */
export type GenerationJobStatus = QuestionGenerationJobStatus;

/** @deprecated Use QuestionGenerationJobResponse */
export type GenerationJobResponse = QuestionGenerationJobResponse;
