import type { ExaminerAnswerDetailResponse, ExaminerDecisionKind, ExaminerDecisionResponse, ExaminerGradingIssueStatus, ExaminerGradingIssueType, ExaminerGradingOperation, ExaminerWorkflowStatus } from "./examiner";
export interface ExaminerDraftResponse {
  traitScores?: Record<string, number>;
  rubricVersionPublicId?: string | null;
  answerPublicId: string;
  draftVersion: number;
  score: number | null;
  comment: string | null;
  decisionKind: ExaminerDecisionKind | null;
  expectedReviewVersion: string | null;
  reviewedAiVersion: string | null;
  savedAt: string;
  /** True for a draft inherited from the previous Examiner; saving it again clears the flag. */
  carriedOver: boolean;
  /** Trait key to the examiner's reason for differing from the AI band. */
  aiGapReasons?: Record<string, string>;
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
  sessionName?: string | null;
  attemptOrdinal?: number;
}

export interface ExaminerCommandReceiptChild {
  itemScore?: number | null;
  scoreTrace?: import("../scoreexplanation").ScoreTraceResponse | null;
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
  itemScore?: number | null;
  scoreTrace?: import("../scoreexplanation").ScoreTraceResponse | null;
  receipt: ExaminerCommandReceiptResponse;
  current: ExaminerWorkflowView;
  draft?: ExaminerDraftResponse | null;
}

export interface StartExaminerWorkRequest {
  requestPublicId: string;
  expectedWorkVersion: number;
}

export interface SaveExaminerDraftRequest {
  traitScores?: Record<string, number | null>;
  requestPublicId: string;
  expectedWorkVersion: number;
  expectedDraftVersion: number;
  score: number | null;
  comment?: string | null;
  decisionKind?: ExaminerDecisionKind | null;
  expectedReviewVersion?: string | null;
  reviewedAiVersion?: string | null;
  aiGapReasons?: Record<string, string> | null;
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
  sessionName?: string | null;
  attemptOrdinal?: number;
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
  examDefinitionPublicId: string;
  items: unknown[];
}

export interface ExaminerGuidelinesResponse {
  scaleMin: number;
  scaleMax: number;
  limitation: string;
  templates: ExaminerTemplateGuidelineItem[];
}

export interface SubmitExaminerScoreRequest {
  traitScores?: Record<string, number | null>;
  score?: number;
  decisionKind?: ExaminerDecisionKind;
  reviewedAiVersion?: string | null;
  expectedReviewVersion?: string;
  requestPublicId?: string;
}

export interface ExaminerScoreSubmissionResponse {
  itemScore?: number | null;
  scoreTrace?: import("../scoreexplanation").ScoreTraceResponse | null;
  answerPublicId: string;
  myScore: number;
  status: "SUBMITTED" | string;
  submittedAt: string;
  decision?: ExaminerDecisionResponse | null;
  selectedScoreSource?: string | null;
  reviewVersion: string | null;
}

export interface ExaminerRubricResponse {
  rubricVersionPublicId: string;
  taskType: string;
  traits: { key: string; displayNameVi: string; displayNameEn: string; maxScore: number;
    source: string; editable: boolean; useAiWhenNull: boolean; levels: { level: number; text: string }[] }[];
  mechanicalScores: Record<string, number>;
}
