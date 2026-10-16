"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ExaminerAnswerDetailResponse, ExaminerWorkflowView } from "@pte/api-client";
import type { DraftEntry, RetainedSubmission } from "./submissionTypes";

interface UseExaminerDraftStateParams {
  answers: ExaminerAnswerDetailResponse[];
  currentAnswer: ExaminerAnswerDetailResponse | null;
  workflow?: ExaminerWorkflowView | null;
  isSubmitPending: boolean;
}

export interface ExaminerDraftState {
  drafts: Record<string, DraftEntry>;
  setDrafts: Dispatch<SetStateAction<Record<string, DraftEntry>>>;
  unresolvedSubmissions: Record<string, RetainedSubmission>;
  setUnresolvedSubmissions: Dispatch<SetStateAction<Record<string, RetainedSubmission>>>;
  submittingAnswerPublicId: string | null;
  setSubmittingAnswerPublicId: Dispatch<SetStateAction<string | null>>;
  activeDraft: DraftEntry | null;
  hasUnsaved: boolean;
  isStale: boolean;
  currentUnresolved: RetainedSubmission | undefined;
  isCurrentReconciling: boolean;
  isCurrentSubmitting: boolean;
  handleScoreChange: (score: string) => void;
  handleCommentChange: (comment: string) => void;
  handleApplyAiScore: (aiScore: number, version: string | null) => void;
  handleAcknowledgeStale: () => void;
}

export const useExaminerDraftState = ({
  answers,
  currentAnswer,
  workflow,
  isSubmitPending,
}: UseExaminerDraftStateParams): ExaminerDraftState => {
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({});
  const [unresolvedSubmissions, setUnresolvedSubmissions] = useState<
    Record<string, RetainedSubmission>
  >({});
  const [submittingAnswerPublicId, setSubmittingAnswerPublicId] = useState<string | null>(null);

  const [prevServerDrafts, setPrevServerDrafts] = useState(workflow?.drafts);
  if (workflow?.drafts && workflow.drafts !== prevServerDrafts) {
    setPrevServerDrafts(workflow.drafts);
    setDrafts((previous) => {
      const next = { ...previous };
      for (const draft of workflow.drafts) {
        if (!next[draft.answerPublicId] || !next[draft.answerPublicId].isDirty) {
          next[draft.answerPublicId] = {
            score: draft.score !== null ? String(draft.score) : "",
            comment: draft.comment ?? "",
            decisionKind: draft.decisionKind ?? "MANUAL",
            reviewedAiVersion: draft.reviewedAiVersion,
            initialReviewVersion: draft.expectedReviewVersion,
            draftVersion: draft.draftVersion,
            savedAt: draft.savedAt,
            isDirty: false,
          };
        }
      }
      return next;
    });
  }

  const hasUnsaved =
    Object.values(drafts).some((draft) => draft.isDirty && draft.score.trim() !== "") ||
    Object.keys(unresolvedSubmissions).length > 0;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (hasUnsaved) event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsaved]);

  const [prevAnswers, setPrevAnswers] = useState(answers);
  if (answers !== prevAnswers) {
    setPrevAnswers(answers);
    const answeredIds = new Set(
      answers
        .filter((answer) => answer.myScore !== null || answer.decision !== null)
        .map((answer) => answer.answerPublicId),
    );
    if (answeredIds.size > 0) {
      setUnresolvedSubmissions((previous) => {
        const keysToRemove = Object.keys(previous).filter((id) => answeredIds.has(id));
        if (keysToRemove.length === 0) return previous;
        const next = { ...previous };
        for (const id of keysToRemove) delete next[id];
        return next;
      });
    }
  }

  const activeDraft: DraftEntry | null = currentAnswer
    ? drafts[currentAnswer.answerPublicId] ?? {
        score: currentAnswer.myScore !== null ? String(currentAnswer.myScore) : "",
        comment: "",
        decisionKind: currentAnswer.decision?.decisionKind ?? currentAnswer.decision?.kind ?? "MANUAL",
        reviewedAiVersion: currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: currentAnswer.reviewVersion ?? null,
        draftVersion: 0,
        savedAt: null,
        isDirty: false,
      }
    : null;

  const handleScoreChange = (score: string): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    if (unresolvedSubmissions[answerId] || submittingAnswerPublicId === answerId) return;
    setDrafts((previous) => ({
      ...previous,
      [answerId]: {
        score,
        comment: previous[answerId]?.comment ?? "",
        decisionKind: previous[answerId]?.decisionKind ?? "MANUAL",
        reviewedAiVersion: previous[answerId]?.reviewedAiVersion ?? currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: previous[answerId]?.initialReviewVersion ?? currentAnswer.reviewVersion ?? null,
        draftVersion: previous[answerId]?.draftVersion ?? 0,
        savedAt: previous[answerId]?.savedAt ?? null,
        isDirty: true,
      },
    }));
  };

  const handleCommentChange = (comment: string): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    setDrafts((previous) => ({
      ...previous,
      [answerId]: {
        score: previous[answerId]?.score ?? "",
        comment,
        decisionKind: previous[answerId]?.decisionKind ?? "MANUAL",
        reviewedAiVersion: previous[answerId]?.reviewedAiVersion ?? currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: previous[answerId]?.initialReviewVersion ?? currentAnswer.reviewVersion ?? null,
        draftVersion: previous[answerId]?.draftVersion ?? 0,
        savedAt: previous[answerId]?.savedAt ?? null,
        isDirty: true,
      },
    }));
  };

  const handleApplyAiScore = (aiScore: number, version: string | null): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    if (unresolvedSubmissions[answerId] || submittingAnswerPublicId === answerId) return;
    setDrafts((previous) => ({
      ...previous,
      [answerId]: {
        score: String(aiScore),
        comment: previous[answerId]?.comment ?? "",
        decisionKind: "CONFIRM_AI",
        reviewedAiVersion: version,
        initialReviewVersion: currentAnswer.reviewVersion ?? null,
        draftVersion: previous[answerId]?.draftVersion ?? 0,
        savedAt: previous[answerId]?.savedAt ?? null,
        isDirty: true,
      },
    }));
  };

  const handleAcknowledgeStale = (): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    setDrafts((previous) => ({
      ...previous,
      [answerId]: {
        score: activeDraft?.score ?? "",
        comment: activeDraft?.comment ?? "",
        decisionKind: activeDraft?.decisionKind ?? "MANUAL",
        reviewedAiVersion: currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: currentAnswer.reviewVersion ?? null,
        draftVersion: activeDraft?.draftVersion ?? 0,
        savedAt: activeDraft?.savedAt ?? null,
        isDirty: true,
      },
    }));
  };

  const currentUnresolved = currentAnswer
    ? unresolvedSubmissions[currentAnswer.answerPublicId]
    : undefined;
  const isCurrentSubmitting =
    isSubmitPending && submittingAnswerPublicId === currentAnswer?.answerPublicId;

  return {
    drafts,
    setDrafts,
    unresolvedSubmissions,
    setUnresolvedSubmissions,
    submittingAnswerPublicId,
    setSubmittingAnswerPublicId,
    activeDraft,
    hasUnsaved,
    isStale:
      Boolean(currentAnswer?.reviewVersion) &&
      Boolean(activeDraft?.initialReviewVersion) &&
      currentAnswer?.reviewVersion !== activeDraft?.initialReviewVersion,
    currentUnresolved,
    isCurrentReconciling: Boolean(currentUnresolved) && !isCurrentSubmitting,
    isCurrentSubmitting,
    handleScoreChange,
    handleCommentChange,
    handleApplyAiScore,
    handleAcknowledgeStale,
  };
};
