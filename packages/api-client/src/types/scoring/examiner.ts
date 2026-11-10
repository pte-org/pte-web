import type { ExaminerRubricResponse } from "./examinerWorkflow";
import type { AiScoreDetailResponse } from "./index";

export type ExaminerQueueStatus = "ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type ExaminerAnswerContentKind =
  | "AUDIO"
  | "TEXT"
  | "SELECTION"
  | "POSITIONAL_SELECTION"
  | "WORD_INDICES"
  | "UNRECOGNIZED";

export type ExaminerAiAvailability = "AVAILABLE" | "PENDING" | "FAILED" | "UNAVAILABLE";

export type ExaminerDecisionKind = "CONFIRM_AI" | "MANUAL" | "LEGACY_IMPORTED";

export interface ExaminerAiReferenceResponse {
  traitMaxima?: Record<string, number>;
  traitScores?: Record<string, number>;
  rubricVersionPublicId?: string | null;
  availability: ExaminerAiAvailability;
  score: number | null;
  version: string | null;
  scoredAt?: string | null;
  generatedAt?: string | null;
}

export interface ExaminerDecisionResponse {
  traitScores?: Record<string, number>;
  rubricVersionPublicId?: string | null;
  decisionKind: ExaminerDecisionKind;
  /** Alias for backward compatibility */
  kind?: ExaminerDecisionKind;
  score: number;
  finalizedAt: string;
  /** Alias for backward compatibility */
  decidedAt?: string;
  reviewedAiScore: number | null;
  reviewedAiVersion: string | null;
  status?: string;
  requestPublicId?: string | null;
}

export interface ExaminerQueueItemResponse {
  attemptPublicId: string;
  sessionPublicId: string;
  assignedAt: string;
  eligibleAnswerCount: number;
  submittedAnswerCount: number;
  status: Exclude<ExaminerQueueStatus, "ALL">;
  canFinalize?: boolean;
  blockingReason?: string | null;
  hasOutstandingAnswers?: boolean;
  sessionName?: string | null;
  /** 1-based position among this examiner's assignments in the session. */
  attemptOrdinal?: number;
}

export interface ExaminerOverviewCounts {
  pending: number;
  inProgress: number;
  completed: number;
  /** Backward compatibility aliases */
  unstartedCount?: number;
  inProgressCount?: number;
  finalizedCount?: number;
}

export interface ExaminerOverviewProgress {
  eligibleAnswerTotal: number;
  finalizedAnswerTotal: number;
  /** Computed / backward compatibility aliases */
  completedUnits?: number;
  totalUnits?: number;
  percentComplete?: number;
}

export interface ExaminerWorkspaceOverviewResponse {
  counts: ExaminerOverviewCounts;
  progress: ExaminerOverviewProgress;
  priorityItems: ExaminerQueueItemResponse[];
  /** Backward compatibility alias */
  priorityQueue?: ExaminerQueueItemResponse[];
  asOf: string;
  scope?: string;
}

export interface ExaminerQueueResponse {
  items: ExaminerQueueItemResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface ExaminerPromptOptionResponse {
  orderIndex: number;
  text: string;
  blankIndex: number | null;
  /** Answer key, examiner-only. */
  correct?: boolean;
  correctGapIndex?: number | null;
}

export interface ExaminerResponseOptionResponse {
  orderIndex: number;
  text: string;
  selected: boolean;
}

export interface ExaminerPromptResponse {
  orderIndex: number;
  section: string;
  taskType: string;
  title: string;
  promptText: string | null;
  audioPromptUrl: string | null;
  imagePromptUrl: string | null;
  minWordCount: number | null;
  maxWordCount: number | null;
  options: ExaminerPromptOptionResponse[];
  /** CEFR level of the bank question (A1..C2); null when the question has none. */
  cefrLevel?: string | null;
  /** Model answer, or the transcript of the prompt audio for listening items; examiner-only. */
  referenceAnswerText?: string | null;
  /** Correct answer of an objective item; examiner-only. */
  correctAnswerText?: string | null;
}

export interface ExaminerAnswerPayloadResponse {
  kind: ExaminerAnswerContentKind;
  text: string | null;
  mediaUrl: string | null;
  options: ExaminerResponseOptionResponse[];
  gapValues: (string | null)[] | null;
  wordIndices: number[] | null;
}

export interface ExaminerAnswerDetailResponse {
  rubric?: ExaminerRubricResponse | null;
  answerPublicId: string;
  taskType: string;
  prompt: ExaminerPromptResponse;
  response: ExaminerAnswerPayloadResponse;
  status: "PENDING" | "SUBMITTED";
  myScore: number | null;
  submittedAt: string | null;
  aiReference: ExaminerAiReferenceResponse | null;
  ai: AiScoreDetailResponse | null;
  decision: ExaminerDecisionResponse | null;
  reviewVersion: string | null;
  cohortStatus: string | null;
  canFinalize: boolean;
  blockingReason: string | null;
}

export type ExaminerWorkflowStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type ExaminerGradingOperation =
  | "START"
  | "SAVE_DRAFT"
  | "SCORE_CHANGE"
  | "FINALIZE"
  | "REOPEN"
  | "REGRADE"
  | "REPORT_ISSUE"
  | "RESOLVE_ISSUE";

export type ExaminerGradingIssueType =
  | "AUDIO_UNAVAILABLE"
  | "MEDIA_UNAVAILABLE"
  | "RESPONSE_DATA"
  | "OTHER";

export type ExaminerGradingIssueStatus = "OPEN" | "RESOLVED";


export * from "./examinerWorkflow";
