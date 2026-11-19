"use client";

import { useState, type MouseEvent, type ReactElement } from "react";
import { Button, ConfirmDialog, useToast } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useDeleteQuestion } from "@/features/questionbank/api";
import type { Question } from "@/features/questionbank/types";
import { EXAM_STUDIO_TEXT } from "../constants";
import { nextQuickStep, type KanbanColumn } from "../kanbanTransitions";

interface KanbanCardActionsProps {
  question: Question;
  canReview: boolean;
  isMoving: boolean;
  onMove: (question: Question, target: KanbanColumn) => void;
}

// The card opens the question on a click, so a click on one of its buttons must not reach it.
const stop = (event: MouseEvent): void => event.stopPropagation();

/** One-click versions of the board's drags: the card's next lifecycle step, and deleting a draft. */
export const KanbanCardActions = ({ question, canReview, isMoving, onMove }: KanbanCardActionsProps): ReactElement | null => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const { showToast } = useToast();
  const remove = useDeleteQuestion();
  const [confirming, setConfirming] = useState(false);
  const step = nextQuickStep(question, canReview);
  const canDelete = question.status === "draft" && question.canDeleteDraft === true;
  if (!step && !canDelete) return null;
  const stepLabel = { pending: text.SUBMIT_APPROVAL, approved: text.APPROVE, archived: text.QUICK_ARCHIVE, draft: "" }[
    step ?? "draft"
  ];

  const deleteDraft = (): void =>
    remove.mutate(question.id, {
      onSuccess: () => {
        setConfirming(false);
        showToast(text.QUICK_DELETE_DONE, { tone: "success" });
      },
      onError: () => showToast(text.ACTION_ERROR, { tone: "error" }),
    });

  return (
    <div className="flex w-full gap-2" onClick={stop} onDragStart={(event) => event.preventDefault()}>
      {step && (
        <Button size="sm" disabled={isMoving} onClick={() => onMove(question, step)}>
          {stepLabel}
        </Button>
      )}
      {canDelete && (
        <Button size="sm" variant="danger" appearance="outline" onClick={() => setConfirming(true)}>
          {text.QUICK_DELETE}
        </Button>
      )}
      <ConfirmDialog
        open={confirming}
        title={text.QUICK_DELETE_TITLE}
        description={text.QUICK_DELETE_BODY}
        confirmLabel={text.QUICK_DELETE}
        cancelLabel={text.BULK_DELETE_CANCEL}
        tone="danger"
        isConfirming={remove.isPending}
        onConfirm={deleteDraft}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
};
