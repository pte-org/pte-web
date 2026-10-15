"use client";

import type { UseExaminerSubmissionParams } from "./submissionTypes";
import { useExaminerDraftState } from "./useExaminerDraftState";
import { useExaminerSubmissionActions } from "./useExaminerSubmissionActions";

export type {
  DraftEntry,
  RetainedSubmission,
  UseExaminerSubmissionParams,
} from "./submissionTypes";

export const useExaminerSubmissions = (params: UseExaminerSubmissionParams) => {
  const draftState = useExaminerDraftState({
    answers: params.answers,
    currentAnswer: params.currentAnswer,
    workflow: params.workflow,
    isSubmitPending: params.submitMutation.isPending,
  });
  const actions = useExaminerSubmissionActions({ ...params, draftState });

  return {
    drafts: draftState.drafts,
    unresolvedSubmissions: draftState.unresolvedSubmissions,
    activeDraft: draftState.activeDraft,
    hasUnsaved: draftState.hasUnsaved,
    isStale: draftState.isStale,
    isCurrentReconciling: draftState.isCurrentReconciling,
    isCurrentSubmitting: draftState.isCurrentSubmitting,
    isSavingDraft: actions.isSavingDraft,
    isFinalizing: actions.isFinalizing,
    handleScoreChange: draftState.handleScoreChange,
    handleCommentChange: draftState.handleCommentChange,
    handleApplyAiScore: draftState.handleApplyAiScore,
    handleAcknowledgeStale: draftState.handleAcknowledgeStale,
    handleSaveDraft: actions.handleSaveDraft,
    handleFinalizeAttempt: actions.handleFinalizeAttempt,
    handleSubmit: actions.handleSubmit,
    handleRetryIdentical: actions.handleRetryIdentical,
    handleReconcileServer: actions.handleReconcileServer,
  };
};
