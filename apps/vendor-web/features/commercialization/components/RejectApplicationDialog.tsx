"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Input, Modal } from "@pte/ui";

interface RejectApplicationDialogProps {
  open: boolean;
  title: string;
  description: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel: string;
  isRejecting: boolean;
  errorMessage?: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

const REASON_MAX_LENGTH = 500;

/** Rejection needs a written reason, so it is asked for here instead of sitting next to the approve button. */
export const RejectApplicationDialog = ({
  open,
  title,
  description,
  reasonLabel,
  reasonPlaceholder,
  confirmLabel,
  pendingLabel,
  cancelLabel,
  isRejecting,
  errorMessage,
  onConfirm,
  onClose,
}: RejectApplicationDialogProps): ReactElement => {
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      isDismissDisabled={isRejecting}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isRejecting}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            isLoading={isRejecting}
            disabled={!trimmedReason || isRejecting}
            onClick={() => onConfirm(trimmedReason)}
          >
            {isRejecting ? pendingLabel : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{description}</p>
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
        <Input
          id="rejection-reason"
          label={reasonLabel}
          placeholder={reasonPlaceholder}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          disabled={isRejecting}
          required
          maxLength={REASON_MAX_LENGTH}
        />
      </div>
    </Modal>
  );
};
