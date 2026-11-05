import type {
  ExaminerAnswerDetailResponse,
  ExaminerDecisionKind,
  ExaminerWorkflowView,
} from "@pte/api-client";

export interface DraftEntry {
  score: string;
  traitScores?: Record<string, number | null>;
  itemScore?: number | null;
  scoreTrace?: import("@pte/api-client").ScoreTraceResponse | null;
  comment?: string;
  decisionKind: ExaminerDecisionKind;
  reviewedAiVersion: string | null;
  initialReviewVersion: string | null;
  draftVersion?: number;
  savedAt?: string | null;
  isDirty?: boolean;
}

export interface UseExaminerSubmissionParams {
  answers: ExaminerAnswerDetailResponse[];
  currentAnswer: ExaminerAnswerDetailResponse | null;
  workflow?: ExaminerWorkflowView | null;
  sessionPublicId: string;
  attemptPublicId: string;
  refetchAttempt: () => Promise<unknown>;
}
