/** Matches scoring's real `ScoringAnswerStatus` enum exactly. */
export type ScoringAnswerStatus = "PENDING" | "AI_SCORING" | "SCORING_FAILED" | "SCORED";

export type AiScoreStatus = "PENDING" | "SCORING" | "FAILED" | "SCORED";

/**
 * Matches scoring's real `AiScoreDetailResponse` record. Host and assigned examiner only;
 * student and reporting responses never carry it. `score` is an estimate, not the final score.
 */
export interface AiScoreDetailResponse {
  status: AiScoreStatus;
  score: number | null;
  criteria: Record<string, number>;
  feedback: string | null;
  transcript: string | null;
  detail: Record<string, unknown>;
  fallback: boolean;
  failureReason: string | null;
}

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
  attemptNumber: number | null;
  aiFallback: boolean;
  /** False for objective answers, whose rawScore is not an AI estimate. */
  aiScored: boolean;
}

/** Matches scoring's real `AttemptReviewItemResponse` record exactly. */
export interface AttemptReviewItemResponse {
  attemptPublicId: string;
  /** Null only when the attempt can no longer be resolved. */
  studentPublicId: string | null;
  /** Null when the student can no longer be resolved. */
  studentName: string | null;
  attemptNumber: number | null;
  /** Null when the attempt can no longer be resolved or was never submitted. */
  submittedAt: string | null;
  answerCount: number;
  scoredCount: number;
  pendingCount: number;
  aiScoringCount: number;
  failedCount: number;
  /** Null while no examiner is assigned to the attempt; the three fields below are then null / 0. */
  examinerPublicId: string | null;
  examinerName: string | null;
  examinerStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | null;
  examinerEligibleCount: number;
  /** Answers with a score saved by the examiner so far. */
  examinerSavedCount: number;
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
  ai: AiScoreDetailResponse | null;
}

/** Matches scoring's real `SubmitTeacherScoreRequest` record exactly. */
export interface SubmitTeacherScoreRequest {
  score: number;
}

export type ScoreSource = "AI" | "EXAMINER";
export type ScoreSourceSelectionScope = "ALL" | "SECTION" | "TASK_TYPE";

export interface HostScoreReviewView {
  answerPublicId: string;
  attemptPublicId: string;
  taskType: string;
  section: string | null;
  scoringMethod: "AI_SPEECH" | "AI_TEXT" | "OBJECTIVE" | "UNSCORED" | null;
  status: ScoringAnswerStatus;
  aiRawScore: number | null;
  aiProviderCategory: "REAL" | "STUB" | null;
  aiProvider: string | null;
  aiModel: string | null;
  aiProviderVersion: string | null;
  aiAvailable: boolean;
  examinerScore: number | null;
  examinerStatus: "NOT_SUBMITTED" | "SUBMITTED";
  assignedExaminerPublicId: string | null;
  examinerAvailable: boolean;
  teacherScore: number | null;
  selectedScoreSource: ScoreSource | null;
  lockVersion: number;
  aiFallback: boolean;
  aiFailureReason: string | null;
}

export interface HostScoreReviewResponse {
  reviewVersion: string;
  publicationLocked: boolean;
  aiEligibleAttemptCount: number;
  assignedAttemptCount: number;
  unassignedAttemptCount: number;
  pendingExaminerAnswerCount: number;
  unavailableSelectedAnswerCount: number;
  rescorableAnswerCount: number;
  answers: HostScoreReviewView[];
  markingMode?: string | null;
  cohortStatus?: string | null;
  canSelectScoreSource?: boolean;
}

export interface SelectScoreSourceRequest {
  scope: ScoreSourceSelectionScope;
  scopeValue: string | null;
  selectedSource: ScoreSource;
  expectedReviewVersion: string | null;
  requestPublicId: string | null;
}

export interface ScoreSourceSelectionPreviewResponse {
  reviewVersion: string;
  scope: ScoreSourceSelectionScope;
  scopeValue: string | null;
  selectedSource: ScoreSource;
  matchedAnswerCount: number;
  availableAnswerCount: number;
  unavailableAnswerCount: number;
  currentAiCount: number;
  currentExaminerCount: number;
  currentUnselectedCount: number;
  publicationLocked: boolean;
  canApply: boolean;
}

export interface ScoreSourceSelectionResultResponse {
  auditPublicId: string;
  requestPublicId: string;
  scope: ScoreSourceSelectionScope;
  scopeValue: string | null;
  selectedSource: ScoreSource;
  affectedAnswerCount: number;
  previousAiCount: number;
  previousExaminerCount: number;
  previousUnselectedCount: number;
  occurredAt: string;
  replayed: boolean;
}

export interface ScoreSourceAuditResponse {
  auditPublicId: string;
  requestPublicId: string | null;
  actorPublicId: string;
  scope: ScoreSourceSelectionScope;
  scopeValue: string | null;
  selectedSource: ScoreSource;
  affectedAnswerCount: number;
  previousAiCount: number;
  previousExaminerCount: number;
  previousUnselectedCount: number;
  occurredAt: string;
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

export * from "./gradingCohort";

/** One eligible submitted attempt; `examinerPublicId` is only filled once the assignment is committed. */
export interface ExaminerAssignmentRosterRow {
  attemptPublicId: string;
  studentPublicId: string;
  studentName: string | null;
  studentEmail: string | null;
  examinerPublicId: string | null;
}

export interface ExaminerAssignmentRosterResponse {
  /** True once the Host has committed; the table is then read-only. */
  locked: boolean;
  rows: ExaminerAssignmentRosterRow[];
}

export interface CommitExaminerAssignmentRequest {
  entries: { attemptPublicId: string; examinerPublicId: string }[];
}

export * from "./examiner";
