/** Matches scoring's real `ScoringAnswerStatus` enum exactly. */
export type ScoringAnswerStatus = "PENDING" | "AI_SCORING" | "SCORING_FAILED" | "SCORED";

/** Matches scoring's real `AnswerListItemResponse` record exactly. */
export interface AnswerListItemResponse {
  answerPublicId: string;
  attemptPublicId: string;
  sessionPublicId: string;
  taskType: string;
  status: ScoringAnswerStatus;
  rawScore: number | null;
  teacherScore: number | null;
  createdAt: string;
}

/** Matches scoring's real `AnswerListResponse` record exactly. */
export interface AnswerListResponse {
  items: AnswerListItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Matches scoring's real `AnswerPayloadKind` enum exactly. */
export type AnswerPayloadKind = "AUDIO" | "TEXT" | "SELECTION" | "UNRECOGNIZED";

/** Matches scoring's real `AnswerOptionView` record exactly. */
export interface AnswerOptionView {
  orderIndex: number | null;
  text: string;
  correct: boolean;
  selectedByStudent: boolean;
}

/** Matches scoring's real `DecodedAnswerPayload` record exactly — fields are mutually exclusive per `kind`. */
export interface DecodedAnswerPayload {
  kind: AnswerPayloadKind;
  text: string | null;
  mediaPublicId: string | null;
  options: AnswerOptionView[] | null;
  mediaUrl: string | null;
}

/** Matches scoring's real `AnswerReviewDetailResponse` record exactly. */
export interface AnswerReviewDetailResponse {
  answerPublicId: string;
  attemptPublicId: string;
  sessionPublicId: string;
  taskType: string;
  status: ScoringAnswerStatus;
  rawScore: number | null;
  teacherScore: number | null;
  createdAt: string;
  payload: DecodedAnswerPayload;
}

/** Matches scoring's real `SubmitTeacherScoreRequest` record exactly. */
export interface SubmitTeacherScoreRequest {
  score: number;
}

/** Matches scoring's real `ScoringAnswerResponse` record exactly. */
export interface ScoringAnswerResponse {
  answerPublicId: string;
  attemptPublicId: string;
  taskType: string;
  status: ScoringAnswerStatus;
  rawScore: number | null;
  teacherScore: number | null;
}

export type AssignmentScopeType = "CLASS" | "PROGRAM";
export type ExaminerAssignmentMode = "MANUAL" | "RANDOM";
export type ExaminerAssignmentBatchStatus =
  "PREVIEWED" | "COMMITTED" | "EXPIRED" | "STALE" | "INVALID";

export interface ExaminerAssignmentScopeRequest {
  type: AssignmentScopeType;
  scopePublicId: string;
  examinerPublicId: string | null;
}

export interface CreateExaminerAssignmentPreviewRequest {
  mode: ExaminerAssignmentMode;
  scopes: ExaminerAssignmentScopeRequest[];
  examinerPublicIds: string[];
}

export interface ExaminerAssignmentConflictResponse {
  attemptPublicId: string;
  conflictingScopes: { type: AssignmentScopeType; scopePublicId: string }[];
}

export interface ExaminerAssignmentLoadResponse {
  examinerPublicId: string;
  attemptCount: number;
  eligibleAnswerCount: number;
}

export interface ExaminerAssignmentPreviewResponse {
  batchPublicId: string | null;
  mode: ExaminerAssignmentMode;
  status: ExaminerAssignmentBatchStatus;
  valid: boolean;
  supplemental: boolean;
  attemptCount: number;
  eligibleAnswerCount: number;
  examinerLoads: ExaminerAssignmentLoadResponse[];
  conflicts: ExaminerAssignmentConflictResponse[];
  previewExpiresAt: string | null;
  committedAt: string | null;
}

export interface ExaminerAssignmentBatchSummaryResponse {
  batchPublicId: string;
  mode: ExaminerAssignmentMode;
  status: ExaminerAssignmentBatchStatus;
  attemptCount: number;
  eligibleAnswerCount: number;
  createdAt: string;
  previewExpiresAt: string;
  committedAt: string | null;
}

export interface ExaminerAssignmentOverviewResponse {
  batches: ExaminerAssignmentBatchSummaryResponse[];
  committedExaminerLoads: ExaminerAssignmentLoadResponse[];
  assignedAttemptCount: number;
  page: number;
  size: number;
  totalBatches: number;
  totalPages: number;
}
