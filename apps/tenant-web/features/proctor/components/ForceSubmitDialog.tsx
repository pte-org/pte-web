"use client";

import type { ReactElement } from "react";
import { Alert, Button, Modal } from "@pte/ui";
import { PROCTOR_FORCE_SUBMIT_TEXT } from "../constants";

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
}: ForceSubmitDialogProps): ReactElement => (
  <Modal
    open={studentName !== null}
    onClose={onClose}
    title={PROCTOR_FORCE_SUBMIT_TEXT.TITLE}
    size="md"
    isDismissDisabled={isLoading}
    footer={
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
          {PROCTOR_FORCE_SUBMIT_TEXT.CANCEL}
        </Button>
        <Button type="button" variant="danger" disabled={isLoading} onClick={onConfirm}>
          {isLoading ? PROCTOR_FORCE_SUBMIT_TEXT.PROCESSING : PROCTOR_FORCE_SUBMIT_TEXT.CONFIRM}
        </Button>
      </div>
    }
  >
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-secondary)]">
        {PROCTOR_FORCE_SUBMIT_TEXT.MESSAGE_PREFIX}
        <strong className="text-[var(--ink-primary)]">{studentName}</strong>
        {PROCTOR_FORCE_SUBMIT_TEXT.MESSAGE_SUFFIX}
      </p>
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
    </div>
  </Modal>
);
