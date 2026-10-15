"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Modal } from "@pte/ui";
import { PROCTOR_LIVE_TEXT } from "../constants";

interface ForceSubmitDialogProps {
  isOpen: boolean;
  studentName: string;
  attemptPublicId: string;
  isLoading: boolean;
  disabled?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export function ForceSubmitDialog({
  isOpen,
  studentName,
  attemptPublicId,
  isLoading,
  disabled = false,
  onClose,
  onConfirm,
}: ForceSubmitDialogProps): ReactElement | null {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      await onConfirm(reason);
      setReason("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : PROCTOR_LIVE_TEXT.FORCE_SUBMIT_ERROR);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={PROCTOR_LIVE_TEXT.FORCE_SUBMIT_TITLE}
      size="md"
      isDismissDisabled={isLoading}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {PROCTOR_LIVE_TEXT.CANCEL}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={isLoading || disabled}
            onClick={(e) => void handleSubmit(e as unknown as FormEvent)}
          >
            {isLoading ? PROCTOR_LIVE_TEXT.FORCE_SUBMIT_PROCESSING : PROCTOR_LIVE_TEXT.FORCE_SUBMIT_CONFIRM_BTN}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--ink-secondary)]">
          Bạn có chắc chắn muốn nộp bài bắt buộc cho thí sinh{" "}
          <strong className="text-[var(--ink-primary)]">{studentName}</strong> (Bài thi:{" "}
          <code className="rounded bg-[var(--surface-subtle)] px-1.5 py-0.5 font-mono text-xs text-[var(--ink-primary)]">
            {attemptPublicId ? attemptPublicId.slice(0, 8).toUpperCase() : "—"}
          </code>
          )? Thí sinh sẽ không thể tiếp tục làm bài.
        </p>

        {error && <Alert tone="error">{error}</Alert>}

        <div>
          <label htmlFor="force-submit-reason" className="block text-xs font-medium text-[var(--ink-secondary)]">
            {PROCTOR_LIVE_TEXT.FORCE_SUBMIT_REASON_LABEL}
          </label>
          <textarea
            id="force-submit-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={PROCTOR_LIVE_TEXT.FORCE_SUBMIT_REASON_PLACEHOLDER}
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}
