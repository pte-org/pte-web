"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ExaminerAnswerDetailResponse, ExaminerWorkflowView } from "@pte/api-client";
import type { DraftEntry } from "./submissionTypes";

interface UseExaminerDraftStateParams {
  currentAnswer: ExaminerAnswerDetailResponse | null;
  workflow?: ExaminerWorkflowView | null;
}

export interface ExaminerDraftState {
  drafts: Record<string, DraftEntry>;
  setDrafts: Dispatch<SetStateAction<Record<string, DraftEntry>>>;
  activeDraft: DraftEntry | null;
  hasUnsaved: boolean;
  isStale: boolean;
  handleScoreChange: (score: string) => void;
  handleCommentChange: (comment: string) => void;
  handleApplyAiScore: (aiScore: number, version: string | null) => void;
  handleAcknowledgeStale: () => void;
}

export const useExaminerDraftState = ({
  currentAnswer,
  workflow,
}: UseExaminerDraftStateParams): ExaminerDraftState => {
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({});

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

  const hasUnsaved = Object.values(drafts).some(
    (draft) => draft.isDirty && draft.score.trim() !== "",
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (hasUnsaved) event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsaved]);

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

  return {
    drafts,
    setDrafts,
    activeDraft,
    hasUnsaved,
    isStale:
      Boolean(currentAnswer?.reviewVersion) &&
      Boolean(activeDraft?.initialReviewVersion) &&
      currentAnswer?.reviewVersion !== activeDraft?.initialReviewVersion,
    handleScoreChange,
    handleCommentChange,
    handleApplyAiScore,
    handleAcknowledgeStale,
  };
};
