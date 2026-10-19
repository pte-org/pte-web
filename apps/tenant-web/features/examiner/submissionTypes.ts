import type {
  ExaminerAnswerDetailResponse,
  ExaminerDecisionKind,
  ExaminerWorkflowView,
} from "@pte/api-client";

export interface DraftEntry {
  score: string;
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
