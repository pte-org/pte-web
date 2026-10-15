"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Modal } from "@pte/ui";
import { PROCTOR_LIVE_TEXT, PROCTOR_VIOLATION_TYPES } from "../constants";

interface ViolationFormProps {
  isOpen: boolean;
  studentName?: string;
  attemptPublicId?: string | null;
  isLoading: boolean;
  disabled?: boolean;
  onClose: () => void;
  onConfirm: (payload: { violationType: string; detail: string }) => Promise<void>;
}

export function ViolationForm({
  isOpen,
  studentName,
  attemptPublicId,
  isLoading,
  disabled = false,
  onClose,
  onConfirm,
}: ViolationFormProps): ReactElement | null {
  const [violationType, setViolationType] = useState<string>(PROCTOR_VIOLATION_TYPES[0].value);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!attemptPublicId) {
      setError(PROCTOR_LIVE_TEXT.VIOLATION_NO_ATTEMPT_ERROR);
      return;
    }
    setError(null);
    try {
      await onConfirm({ violationType, detail: note });
      setNote("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : PROCTOR_LIVE_TEXT.VIOLATION_SUBMIT_ERROR);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={PROCTOR_LIVE_TEXT.VIOLATION_TITLE}
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
            {isLoading ? PROCTOR_LIVE_TEXT.VIOLATION_PROCESSING : PROCTOR_LIVE_TEXT.VIOLATION_CONFIRM_BTN}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {studentName && (
          <p className="text-sm text-[var(--ink-secondary)]">
            {PROCTOR_LIVE_TEXT.STUDENT_PREFIX}<strong className="text-[var(--ink-primary)]">{studentName}</strong>
            {attemptPublicId && (
              <>
                {" "}{PROCTOR_LIVE_TEXT.FORCE_SUBMIT_EXAM_LABEL}
                <code className="rounded bg-[var(--surface-subtle)] px-1.5 py-0.5 font-mono text-xs text-[var(--ink-primary)]">
                  {attemptPublicId.slice(0, 8).toUpperCase()}
                </code>
                )
              </>
            )}
          </p>
        )}

        {error && <Alert tone="error">{error}</Alert>}

        <div>
          <label htmlFor="violation-type" className="block text-xs font-medium text-[var(--ink-secondary)]">
            {PROCTOR_LIVE_TEXT.VIOLATION_TYPE_LABEL}
          </label>
          <select
            id="violation-type"
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={isLoading}
          >
            {PROCTOR_VIOLATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="violation-note" className="block text-xs font-medium text-[var(--ink-secondary)]">
            {PROCTOR_LIVE_TEXT.VIOLATION_DETAIL_LABEL}
          </label>
          <textarea
            id="violation-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={PROCTOR_LIVE_TEXT.VIOLATION_DETAIL_PLACEHOLDER}
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}
