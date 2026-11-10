"use client";

import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import type { ExaminerAttemptController } from "../useExaminerAttemptController";
import { traitRequest } from "../traitDraft";

interface ExaminerMarkingToolbarProps { state: ExaminerAttemptController }

export const ExaminerMarkingToolbar = ({ state }: ExaminerMarkingToolbarProps): ReactElement => {
  const { T, currentIndex, answers, handleSelectIndex, workflow, isSavingDraft, isFinalizing } = state;
  const { currentAnswer: answer, activeDraft: draft } = state;
  const hasNext = currentIndex < answers.length - 1;
  const saved = Boolean(answer && (answer.myScore !== null || answer.decision !== null));
  const score = draft?.score.trim() ? Number(draft.score) : Number.NaN;
  const valid = answer?.rubric ? traitRequest(answer.rubric, draft?.traitScores ?? {}) !== null : Number.isInteger(score) && score >= 0 && score <= 100;
  const machineReady = !answer?.rubric || answer.rubric.traits.filter((trait) => trait.useAiWhenNull).every((trait) =>
    draft?.traitScores?.[trait.key] != null ||
    answer.aiReference?.availability === "AVAILABLE" && answer.aiReference.rubricVersionPublicId === answer.rubric?.rubricVersionPublicId && answer.aiReference.traitScores?.[trait.key] !== undefined);
  const canSave = Boolean(answer?.canFinalize && valid && machineReady && !state.isStale && state.promptMedia !== "failed" && state.responseMedia !== "failed" && state.promptMedia !== "loading" && state.responseMedia !== "loading");
  const needsSave = !saved && (draft?.isDirty || !draft?.savedAt);
  const saveAndNext = async (): Promise<void> => {
    if (await state.handleSaveClick()) {
      if (hasNext) handleSelectIndex(currentIndex + 1);
    }
  };
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--table-border)] bg-[var(--surface-card)] p-3">
      <Button variant="secondary" size="sm" className="whitespace-nowrap" disabled={currentIndex === 0 || isSavingDraft || isFinalizing}
        onClick={() => handleSelectIndex(currentIndex - 1)}>{T.PREV_QUESTION}</Button>
      <div className="text-xs tabular-nums text-[var(--ink-secondary)]">
        <span>{currentIndex + 1} / {answers.length}</span>
        {!saved && <span className="ml-3" role="status">{isSavingDraft ? T.SAVING_DRAFT : draft?.isDirty ? T.UNSAVED_DRAFT : draft?.savedAt ? T.DRAFT_SAVED : ""}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {workflow?.canStart && <Button size="sm" disabled={state.startMutation.isPending} onClick={state.handleStartWork}>{state.startMutation.isPending ? T.STARTING_WORK : T.START_WORK}</Button>}
        {hasNext && (!needsSave || !canSave) && <Button variant={saved || !needsSave ? "primary" : "secondary"} size="sm" className="whitespace-nowrap" disabled={isSavingDraft || isFinalizing}
          onClick={() => handleSelectIndex(currentIndex + 1)}>{T.NEXT_QUESTION}</Button>}
        {needsSave && !workflow?.canStart && <Button size="sm" className="whitespace-nowrap" disabled={!canSave || isSavingDraft || isFinalizing}
          onClick={saveAndNext}>{isSavingDraft ? T.SAVING_DRAFT : hasNext ? T.SAVE_AND_NEXT : T.SAVE_DRAFT}</Button>}
      </div>
    </div>
  );
};
