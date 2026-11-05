"use client";
import { useState, type ReactElement } from "react";
import { Button, ErrorState, Modal, Textarea } from "@pte/ui";
import { RUBRIC_EDIT_CONFIG } from "../versionConstants";
import type { RubricEditText } from "../versionTypes";

interface RejectDialogProps { pending: boolean; text: RubricEditText; error?: string | null; onClose: () => void; onReject: (reason: string) => void }
export const RejectDialog = ({ pending, text: T, error, onClose, onReject }: RejectDialogProps): ReactElement => {
  const [reason, setReason] = useState("");
  return <Modal open title={T.reject} onClose={onClose} isDismissDisabled={pending}>
    <div className="space-y-4"><Textarea label={T.reason} value={reason} required maxLength={RUBRIC_EDIT_CONFIG.maxReason} disabled={pending}
      onChange={(event) => setReason(event.target.value)} />
      {error && <ErrorState title={error} />}
      <Button disabled={pending || !reason.trim()} onClick={() => onReject(reason)}>{T.reject}</Button>
    </div>
  </Modal>;
};
