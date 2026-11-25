"use client";

import { useFeedbackToast } from "../hooks/useFeedbackToast";

import type { ReactElement } from "react";
import { Button, Modal } from "@pte/ui";
import { useAttendanceText } from "../hooks/useAttendanceText";

interface ForceSubmitDialogProps {
  studentName: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirms a force submit; the dialog is open while a target Student is set. */
export const ForceSubmitDialog = ({
  studentName,
  isLoading,
  errorMessage,
  onClose,
  onConfirm,
}: ForceSubmitDialogProps): ReactElement => {
  const text = useAttendanceText();
  useFeedbackToast(studentName ? errorMessage : null);
  return (
    <Modal
      open={studentName !== null}
      onClose={onClose}
      title={text.forceSubmitTitle}
      size="md"
      isDismissDisabled={isLoading}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {text.cancel}
          </Button>
          <Button type="button" variant="danger" disabled={isLoading} onClick={onConfirm}>
            {isLoading ? text.forceSubmitProcessing : text.forceSubmitConfirm}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--ink-secondary)]">
          {text.forceSubmitMessagePrefix}
          <strong className="text-[var(--ink-primary)]">{studentName}</strong>
          {text.forceSubmitMessageSuffix}
        </p>
      </div>
    </Modal>
  );
};
