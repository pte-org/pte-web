"use client";

import { useRef, useState } from "react";
import { useFinalizeExaminerWork, useSaveExaminerDraft } from "./api";
import { applySavedDraft, traitRequest } from "./traitDraft";
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
  const saveMutation = useSaveExaminerDraft(sessionPublicId, attemptPublicId);
  const finalizeMutation = useFinalizeExaminerWork(sessionPublicId, attemptPublicId);
  const saving = useRef(false);
  const retryKeys = useRef(new Map<string, string>());
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleSaveDraft = async (answerIdToSave?: string): Promise<boolean> => {
    const targetAnswer = answerIdToSave
      ? answers.find((answer) => answer.answerPublicId === answerIdToSave)
      : currentAnswer;
    if (!targetAnswer) return false;
    const answerId = targetAnswer.answerPublicId;
    const draft = draftState.drafts[answerId];
    if (!draft || saving.current) return false;
    const traitScores = targetAnswer.rubric ? traitRequest(targetAnswer.rubric, draft.traitScores) : undefined;
    if (traitScores === null) return false;

    const parsedScore = targetAnswer.rubric || draft.score.trim() === "" ? null : Number(draft.score);
    if (parsedScore !== null && (!Number.isInteger(parsedScore) || parsedScore < 0 || parsedScore > 100)) {
      return false;
    }

    try {
      saving.current = true;
      setIsSavingDraft(true);
      const payload = {
        expectedWorkVersion: workflow?.workVersion ?? 0,
        expectedDraftVersion: draft.draftVersion ?? 0,
        score: parsedScore,
        traitScores,
        comment: draft.comment || null,
        aiGapReasons: draft.aiGapReasons ?? null,
        decisionKind: draft.decisionKind,
        expectedReviewVersion: draft.initialReviewVersion,
        reviewedAiVersion: draft.reviewedAiVersion,
      };
      const fingerprint = JSON.stringify({ answerId, ...payload });
      const requestPublicId = retryKeys.current.get(fingerprint) ?? crypto.randomUUID();
      retryKeys.current.set(fingerprint, requestPublicId);
      const response = await saveMutation.mutateAsync({ answerPublicId: answerId, payload: { ...payload, requestPublicId } });
      retryKeys.current.delete(fingerprint);
      draftState.setDrafts((previous) => {
        const current = previous[answerId];
        if (!current) return previous;
        return { ...previous, [answerId]: applySavedDraft(current, draft, response) };
      });
      return true;
    } catch {
      return false;
    } finally {
      saving.current = false;
      setIsSavingDraft(false);
    }
  };

  const handleFinalizeAttempt = async (): Promise<boolean> => {
    if (saving.current || draftState.hasUnsaved) return false;
    try {
      setIsFinalizing(true);
      const items = answers.map((answer) => {
        const draft = draftState.drafts[answer.answerPublicId];
        return {
          answerPublicId: answer.answerPublicId,
          expectedDraftVersion: draft?.draftVersion ?? 0,
          expectedReviewVersion: draft?.initialReviewVersion ?? answer.reviewVersion,
          reviewedAiVersion: draft?.reviewedAiVersion ?? null,
        };
      });

      await finalizeMutation.mutateAsync({
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
