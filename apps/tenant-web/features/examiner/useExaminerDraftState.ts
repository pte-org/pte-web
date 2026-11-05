"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ExaminerAnswerDetailResponse, ExaminerWorkflowView } from "@pte/api-client";
import type { DraftEntry } from "./submissionTypes";
import { aiTraitDraft } from "./traitDraft";

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
  handleTraitChange: (key: string, value: number | null) => void;
  handleCommentChange: (comment: string) => void;
  handleApplyAiScore: (score: number, version: string | null) => void;
  handleAcknowledgeStale: () => void;
}

export const useExaminerDraftState = ({ currentAnswer, workflow }: UseExaminerDraftStateParams): ExaminerDraftState => {
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({});
  const [prevServerDrafts, setPrevServerDrafts] = useState(workflow?.drafts);
  if (workflow?.drafts && workflow.drafts !== prevServerDrafts) {
    setPrevServerDrafts(workflow.drafts);
    setDrafts((previous) => {
      const next = { ...previous };
      for (const draft of workflow.drafts) {
        if (!next[draft.answerPublicId]?.isDirty) next[draft.answerPublicId] = {
          score: draft.score !== null ? String(draft.score) : "", comment: draft.comment ?? "",
          traitScores: draft.traitScores ?? {}, itemScore: draft.score,
          decisionKind: draft.decisionKind ?? "MANUAL", reviewedAiVersion: draft.reviewedAiVersion,
          initialReviewVersion: draft.expectedReviewVersion, draftVersion: draft.draftVersion,
          savedAt: draft.savedAt, isDirty: false,
        };
      }
      return next;
    });
  }
  const hasUnsaved = Object.values(drafts).some((draft) => draft.isDirty);
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent): void => { if (hasUnsaved) event.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved]);
  const activeDraft: DraftEntry | null = currentAnswer ? drafts[currentAnswer.answerPublicId] ?? {
    score: currentAnswer.myScore !== null ? String(currentAnswer.myScore) : "",
    traitScores: currentAnswer.decision?.traitScores ?? {}, itemScore: currentAnswer.myScore,
    comment: "", decisionKind: currentAnswer.decision?.decisionKind ?? currentAnswer.decision?.kind ?? "MANUAL",
    reviewedAiVersion: currentAnswer.aiReference?.version ?? null,
    initialReviewVersion: currentAnswer.reviewVersion ?? null, draftVersion: 0, savedAt: null, isDirty: false,
  } : null;
  const update = (patch: Partial<DraftEntry>): void => {
    if (!currentAnswer || !activeDraft) return;
    const id = currentAnswer.answerPublicId;
    setDrafts((previous) => ({ ...previous, [id]: { ...activeDraft, ...previous[id], ...patch, isDirty: true } }));
  };
  const handleApplyAiScore = (score: number, version: string | null): void => {
    if (!currentAnswer) return;
    const traits = currentAnswer.rubric ? aiTraitDraft(currentAnswer.rubric, currentAnswer.aiReference) : undefined;
    if (traits === null) return;
    update({ score: currentAnswer.rubric ? "" : String(score), traitScores: traits,
      itemScore: null, scoreTrace: null, decisionKind: "CONFIRM_AI", reviewedAiVersion: version,
      initialReviewVersion: currentAnswer.reviewVersion ?? null });
  };
  return {
    drafts, setDrafts, activeDraft, hasUnsaved,
    isStale: Boolean(currentAnswer?.reviewVersion && activeDraft?.initialReviewVersion && currentAnswer.reviewVersion !== activeDraft.initialReviewVersion),
    handleScoreChange: (score) => update({ score, decisionKind: "MANUAL", itemScore: null, scoreTrace: null }),
    handleTraitChange: (key, value) => update({ traitScores: { ...activeDraft?.traitScores, [key]: value },
      decisionKind: "MANUAL", itemScore: null, scoreTrace: null }),
    handleCommentChange: (comment) => update({ comment }), handleApplyAiScore,
    handleAcknowledgeStale: () => update({ initialReviewVersion: currentAnswer?.reviewVersion ?? null,
      reviewedAiVersion: currentAnswer?.aiReference?.version ?? null, decisionKind: "MANUAL", itemScore: null, scoreTrace: null }),
  };
};
