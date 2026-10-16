"use client";

import type { ReactElement } from "react";
import { ConfirmDialog } from "@pte/ui";
import { EXAMINER_WORK_TEXT as T } from "../constants";

interface ConfirmAttemptFinalizeDialogProps {
  open: boolean;
  totalAnswers: number;
  isFinalizing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmAttemptFinalizeDialog({
  open,
  totalAnswers,
  isFinalizing,
  onConfirm,
  onClose,
}: ConfirmAttemptFinalizeDialogProps): ReactElement {
  return (
    <ConfirmDialog
      open={open}
      title={T.CONFIRM_FINALIZE_TITLE}
      tone="primary"
      confirmLabel={isFinalizing ? T.FINALIZING : T.FINALIZE_WORK}
      cancelLabel={T.CANCEL}
      description={`${T.CONFIRM_FINALIZE_DESC} (${totalAnswers} ${T.QUESTIONS_SUFFIX})`}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
