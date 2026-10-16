import type {
  ExaminerAnswerDetailResponse,
  ExaminerDecisionKind,
  ExaminerWorkflowView,
  SubmitExaminerScoreRequest,
} from "@pte/api-client";
import type { useSubmitExaminerScore } from "./api";

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

export interface RetainedSubmission {
  payload: SubmitExaminerScoreRequest;
  submittedAt: number;
}

export interface UseExaminerSubmissionParams {
  answers: ExaminerAnswerDetailResponse[];
  currentAnswer: ExaminerAnswerDetailResponse | null;
  workflow?: ExaminerWorkflowView | null;
  sessionPublicId: string;
  attemptPublicId: string;
  refetchAttempt: () => Promise<unknown>;
  submitMutation: ReturnType<typeof useSubmitExaminerScore>;
}
