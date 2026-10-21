"use client";

import { useState } from "react";
import { finalizeExaminerWork, saveExaminerDraft } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import type { ExaminerDraftState } from "./useExaminerDraftState";
import type { UseExaminerSubmissionParams } from "./submissionTypes";

interface UseExaminerSubmissionActionsParams extends UseExaminerSubmissionParams {
  draftState: ExaminerDraftState;
}

export const useExaminerSubmissionActions = ({
  answers,
  currentAnswer,
  workflow,
  sessionPublicId,
  attemptPublicId,
  refetchAttempt,
  draftState,
}: UseExaminerSubmissionActionsParams) => {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleSaveDraft = async (answerIdToSave?: string): Promise<boolean> => {
    const targetAnswer = answerIdToSave
      ? answers.find((answer) => answer.answerPublicId === answerIdToSave)
      : currentAnswer;
    if (!targetAnswer) return false;
    const answerId = targetAnswer.answerPublicId;
    const draft = draftState.drafts[answerId];
    if (!draft) return false;

    const parsedScore = draft.score.trim() === "" ? null : Number(draft.score);
    if (parsedScore !== null && (!Number.isInteger(parsedScore) || parsedScore < 0 || parsedScore > 100)) {
      return false;
    }

    try {
      setIsSavingDraft(true);
      const response = await saveExaminerDraft(apiClient, sessionPublicId, attemptPublicId, answerId, {
        requestPublicId: crypto.randomUUID(),
        expectedWorkVersion: workflow?.workVersion ?? 0,
        expectedDraftVersion: draft.draftVersion ?? 0,
        score: parsedScore,
        comment: draft.comment || null,
        decisionKind: draft.decisionKind,
        expectedReviewVersion: targetAnswer.reviewVersion,
        reviewedAiVersion: draft.reviewedAiVersion,
      });

      draftState.setDrafts((previous) => {
        const current = previous[answerId];
        if (!current) return previous;
        const hasUnsavedChanges = current.score !== draft.score || current.comment !== draft.comment;
        return {
          ...previous,
          [answerId]: {
            ...current,
            draftVersion: response.draft?.draftVersion ?? (draft.draftVersion ?? 0) + 1,
            savedAt: response.draft?.savedAt ?? new Date().toISOString(),
            isDirty: hasUnsavedChanges,
          },
        };
      });
      return true;
    } catch {
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFinalizeAttempt = async (): Promise<boolean> => {
    try {
      setIsFinalizing(true);
      const items = answers.map((answer) => {
        const draft = draftState.drafts[answer.answerPublicId];
        return {
          answerPublicId: answer.answerPublicId,
          expectedDraftVersion: draft?.draftVersion ?? 0,
          expectedReviewVersion: answer.reviewVersion,
          reviewedAiVersion: draft?.reviewedAiVersion ?? null,
        };
      });

      await finalizeExaminerWork(apiClient, sessionPublicId, attemptPublicId, {
        requestPublicId: crypto.randomUUID(),
        expectedWorkVersion: workflow?.workVersion ?? 0,
        answers: items,
      });
      await refetchAttempt();
      return true;
    } catch {
      return false;
    } finally {
      setIsFinalizing(false);
    }
  };

  return {
    isSavingDraft,
    isFinalizing,
    handleSaveDraft,
    handleFinalizeAttempt,
  };
};
