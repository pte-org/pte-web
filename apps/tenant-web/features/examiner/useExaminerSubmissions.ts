"use client";

import type { UseExaminerSubmissionParams } from "./submissionTypes";
import { useExaminerDraftState } from "./useExaminerDraftState";
import { useExaminerSubmissionActions } from "./useExaminerSubmissionActions";

export type { DraftEntry, UseExaminerSubmissionParams } from "./submissionTypes";

export const useExaminerSubmissions = (params: UseExaminerSubmissionParams) => {
  const draftState = useExaminerDraftState({
    currentAnswer: params.currentAnswer,
    workflow: params.workflow,
  });
  const actions = useExaminerSubmissionActions({ ...params, draftState });

  return {
    drafts: draftState.drafts,
    activeDraft: draftState.activeDraft,
    hasUnsaved: draftState.hasUnsaved,
    isStale: draftState.isStale,
    isSavingDraft: actions.isSavingDraft,
    isFinalizing: actions.isFinalizing,
    handleScoreChange: draftState.handleScoreChange,
    handleCommentChange: draftState.handleCommentChange,
    handleApplyAiScore: draftState.handleApplyAiScore,
    handleAcknowledgeStale: draftState.handleAcknowledgeStale,
    handleSaveDraft: actions.handleSaveDraft,
    handleFinalizeAttempt: actions.handleFinalizeAttempt,
  };
};
