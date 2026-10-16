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
  availability: ExaminerAiAvailability;
  score: number | null;
  version: string | null;
  scoredAt?: string | null;
  generatedAt?: string | null;
}

export interface ExaminerDecisionResponse {
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

export interface ExaminerDraftResponse {
  answerPublicId: string;
  draftVersion: number;
  score: number | null;
  comment: string | null;
  decisionKind: ExaminerDecisionKind | null;
  expectedReviewVersion: string | null;
  reviewedAiVersion: string | null;
  savedAt: string;
}

export interface ExaminerWorkflowView {
  mode: "ATOMIC_DRAFT" | string;
  status: ExaminerWorkflowStatus;
  workVersion: number;
  startedAt: string | null;
  finalizedAt: string | null;
  readOnly: boolean;
  canStart: boolean;
  canSaveDraft: boolean;
  canFinalize: boolean;
  blockingReason: string | null;
  drafts: ExaminerDraftResponse[];
}

export interface ExaminerAttemptDetailResponse {
  attemptPublicId: string;
  sessionPublicId: string;
  assignedAt: string;
  eligibleAnswerCount: number;
  submittedAnswerCount: number;
  answers: ExaminerAnswerDetailResponse[];
  cohortMode?: string | null;
  markingMode?: string | null;
  cohortStatus: string | null;
  publicationState: "UNPUBLISHED" | "PUBLISHED" | "DRAFT";
  canFinalize: boolean;
  blockingReason: string | null;
  workflow?: ExaminerWorkflowView | null;
}

export interface ExaminerCommandReceiptChild {
  answerPublicId: string;
  requestPublicId: string;
}

export interface ExaminerCommandReceiptResponse {
  requestPublicId: string;
  operation: ExaminerGradingOperation;
  committedAt: string;
  workVersion: number;
  answerPublicId?: string | null;
  draftVersion?: number | null;
  childRequests?: ExaminerCommandReceiptChild[];
}

export interface ExaminerCommandResponse {
  receipt: ExaminerCommandReceiptResponse;
  current: ExaminerWorkflowView;
  draft?: ExaminerDraftResponse | null;
}

export interface StartExaminerWorkRequest {
  requestPublicId: string;
  expectedWorkVersion: number;
}

export interface SaveExaminerDraftRequest {
  requestPublicId: string;
  expectedWorkVersion: number;
  expectedDraftVersion: number;
  score: number | null;
  comment?: string | null;
  decisionKind?: ExaminerDecisionKind | null;
  expectedReviewVersion?: string | null;
  reviewedAiVersion?: string | null;
}

export interface FinalizeExaminerWorkItem {
  answerPublicId: string;
  expectedDraftVersion: number;
  expectedReviewVersion?: string | null;
  reviewedAiVersion?: string | null;
}

export interface FinalizeExaminerWorkRequest {
  requestPublicId: string;
  expectedWorkVersion: number;
  answers: FinalizeExaminerWorkItem[];
}

export interface ReportGradingIssueRequest {
  requestPublicId: string;
  expectedWorkVersion: number;
  answerPublicId?: string | null;
  type: ExaminerGradingIssueType;
  description: string;
}

export interface ResolveGradingIssueRequest {
  requestPublicId: string;
  resolution: string;
}

export interface ExaminerGradingIssueResponse {
  issuePublicId: string;
  sessionPublicId: string;
  attemptPublicId: string;
  answerPublicId: string | null;
  type: ExaminerGradingIssueType;
  description: string;
  status: ExaminerGradingIssueStatus;
  reportedAt: string;
  resolvedAt: string | null;
  resolution: string | null;
}

export interface ExaminerHistoryItemResponse {
  eventPublicId: string;
  sessionPublicId: string;
  attemptPublicId: string;
  answerPublicId: string | null;
  operation: ExaminerGradingOperation;
  occurredAt: string;
  workVersion: number;
  draftVersion: number | null;
  actorPublicId?: string | null;
  actorRole?: string | null;
  assignmentPublicId?: string | null;
  previousScore?: number | null;
  newScore?: number | null;
  rubricVersion?: number | null;
  reason?: string | null;
}

export interface ExaminerReportSummary {
  finalizedCount: number;
  inProgressCount: number;
  pendingCount: number;
  totalAssignedCount: number;
  avgGradingDurationMinutes: number;
  regradeCount: number;
}

export interface ExaminerReportTaskTypeBreakdown {
  taskType: string;
  totalQuestions: number;
  scoredQuestions: number;
  averageScore: number | null;
}

export interface ExaminerReportRecentItem {
  attemptPublicId: string;
  sessionPublicId: string;
  finalizedAt: string;
  scoreCount: number;
  averageScore: number | null;
  workVersion: number;
}

export interface ExaminerReportsResponse {
  summary: ExaminerReportSummary;
  taskTypeBreakdowns: ExaminerReportTaskTypeBreakdown[];
  recentFinalizedItems: ExaminerReportRecentItem[];
}

export interface ExaminerHistoryResponse {
  items: ExaminerHistoryItemResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ExaminerTemplateGuidelineItem {
  scoreTemplatePublicId: string;
  items: unknown[];
}

export interface ExaminerGuidelinesResponse {
  scaleMin: number;
  scaleMax: number;
  limitation: string;
  templates: ExaminerTemplateGuidelineItem[];
}

export interface SubmitExaminerScoreRequest {
  score: number;
  decisionKind?: ExaminerDecisionKind;
  reviewedAiVersion?: string | null;
  expectedReviewVersion?: string;
  requestPublicId?: string;
}

export interface ExaminerScoreSubmissionResponse {
  answerPublicId: string;
  myScore: number;
  status: "SUBMITTED" | string;
  submittedAt: string;
  decision?: ExaminerDecisionResponse | null;
  selectedScoreSource?: string | null;
  reviewVersion: string | null;
}
