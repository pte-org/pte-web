"use client";

import { useState } from "react";
import {
  ApiError,
  finalizeExaminerWork,
  saveExaminerDraft,
  type ExaminerAnswerDetailResponse,
  type ExaminerDecisionKind,
} from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";
import type { ExaminerDraftState } from "./useExaminerDraftState";
import type { UseExaminerSubmissionParams } from "./submissionTypes";

function isStaleReviewVersionError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return (
      error.status === 409 &&
      (error.code === "STALE_REVIEW_VERSION" || error.message?.includes("STALE_REVIEW_VERSION"))
    );
  }
  if (typeof error === "object" && error !== null) {
    const candidate = error as { status?: number; code?: string; message?: string };
    return (
      candidate.status === 409 &&
      (candidate.code === "STALE_REVIEW_VERSION" ||
        (typeof candidate.message === "string" && candidate.message.includes("STALE_REVIEW_VERSION")))
    );
  }
  return false;
}

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
  submitMutation,
  draftState,
}: UseExaminerSubmissionActionsParams) => {
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const clearAnswerState = (answerId: string): void => {
    draftState.setUnresolvedSubmissions((previous) => {
      const next = { ...previous };
      delete next[answerId];
      return next;
    });
    draftState.setDrafts((previous) => {
      const next = { ...previous };
      delete next[answerId];
      return next;
    });
  };

  const handleSubmit = (
    score: number,
    decisionKind: ExaminerDecisionKind,
    requestPublicId: string,
    expectedReviewVersion: string,
  ): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    const payload = {
      score,
      decisionKind,
      reviewedAiVersion: draftState.activeDraft?.reviewedAiVersion ?? null,
      expectedReviewVersion,
      requestPublicId,
    };
    draftState.setSubmittingAnswerPublicId(answerId);
    draftState.setUnresolvedSubmissions((previous) => ({
      ...previous,
      [answerId]: { payload, submittedAt: Date.now() },
    }));
    submitMutation.mutate(
      { answerPublicId: answerId, payload },
      {
        onSuccess: () => {
          draftState.setSubmittingAnswerPublicId(null);
          clearAnswerState(answerId);
        },
        onError: async (error: unknown) => {
          draftState.setSubmittingAnswerPublicId(null);
          if (isStaleReviewVersionError(error)) {
            draftState.setUnresolvedSubmissions((previous) => {
              const next = { ...previous };
              delete next[answerId];
              return next;
            });
            await refetchAttempt();
          }
        },
      },
    );
  };

  const handleRetryIdentical = (): void => {
    if (!currentAnswer || !draftState.currentUnresolved) return;
    const answerId = currentAnswer.answerPublicId;
    const payload = draftState.currentUnresolved.payload;
    draftState.setSubmittingAnswerPublicId(answerId);
    submitMutation.mutate(
      { answerPublicId: answerId, payload },
      {
        onSuccess: () => {
          draftState.setSubmittingAnswerPublicId(null);
          clearAnswerState(answerId);
        },
        onError: async (error: unknown) => {
          draftState.setSubmittingAnswerPublicId(null);
          if (isStaleReviewVersionError(error)) {
            draftState.setUnresolvedSubmissions((previous) => {
              const next = { ...previous };
              delete next[answerId];
              return next;
            });
            await refetchAttempt();
          }
        },
      },
    );
  };

  const handleReconcileServer = async (): Promise<void> => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    const retained = draftState.currentUnresolved;
    const result = (await refetchAttempt()) as {
      data?: { answers?: ExaminerAnswerDetailResponse[] };
    };
    const matched = result.data?.answers?.find((answer) => answer.answerPublicId === answerId);
    if (!matched) return;

    const isCommitted = matched.myScore !== null || matched.decision !== null;
    const receiptMatches =
      Boolean(retained?.payload.requestPublicId) &&
      matched.decision?.requestPublicId === retained?.payload.requestPublicId;
    if (isCommitted || receiptMatches) clearAnswerState(answerId);
  };

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
    handleSubmit,
    handleRetryIdentical,
    handleReconcileServer,
    handleSaveDraft,
    handleFinalizeAttempt,
  };
};
