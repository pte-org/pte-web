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
  decision: ExaminerDecisionResponse | null;
  reviewVersion: string | null;
  cohortStatus: string | null;
  canFinalize: boolean;
  blockingReason: string | null;
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
