"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Modal, Textarea } from "@pte/ui";
import { PROMPT_EDIT_CONFIG, type PromptEditCopy } from "../promptEditConstants";

interface PromptRejectDialogProps {
  copy: PromptEditCopy;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onReject: (reason: string) => void;
}

/** Asks for the reason a manager or admin sends a version back; the author sees it above the editor. */
export const PromptRejectDialog = ({ copy, pending, error, onClose, onReject }: PromptRejectDialogProps): ReactElement => {
  const [reason, setReason] = useState("");
  return (
    <Modal open title={copy.RETURN} onClose={onClose} isDismissDisabled={pending}>
      <div className="space-y-4">
        <Textarea
          label={copy.REASON}
          value={reason}
          required
          maxLength={PROMPT_EDIT_CONFIG.MAX_REASON_LENGTH}
          disabled={pending}
          onChange={(event) => setReason(event.target.value)}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            {copy.CANCEL}
          </Button>
          <Button variant="danger" disabled={pending || !reason.trim()} isLoading={pending} onClick={() => onReject(reason.trim())}>
            {copy.RETURN}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
