"use client";
import { useState, type ReactElement } from "react";
import { Button, Modal } from "@pte/ui";
import { QuestionNavigator } from "./QuestionNavigator";
import type { ExaminerAttemptController } from "../useExaminerAttemptController";

interface QuestionListButtonProps { state: ExaminerAttemptController }

/** Opens the attempt's questions in a popup; choosing one jumps to it and closes the popup. */
export const QuestionListButton = ({ state }: QuestionListButtonProps): ReactElement => {
  const { T, answers, currentIndex, drafts, carriedOverIds, handleSelectIndex, isSavingDraft, isFinalizing } = state;
  const [open, setOpen] = useState(false);
  return <>
    <Button type="button" variant="secondary" size="sm" className="whitespace-nowrap" disabled={answers.length === 0}
      onClick={() => setOpen(true)}>{T.NAV_TITLE}</Button>
    <Modal open={open} onClose={() => setOpen(false)} title={T.NAV_TITLE} size="full">
      <div className="max-h-[70vh] overflow-y-auto p-4">
        <QuestionNavigator answers={answers} currentIndex={currentIndex} drafts={drafts} carriedOverIds={carriedOverIds} disabled={isSavingDraft || isFinalizing}
          onSelectIndex={(index) => { handleSelectIndex(index); setOpen(false); }} />
      </div>
    </Modal>
  </>;
};
