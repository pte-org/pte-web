"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, Modal, StatusBadge, Textarea } from "@pte/ui";
import type { AttendanceRowResponse, IdentityVerificationStatus } from "@pte/api-client";
import {
  getIdentityBadgeProps as getVerificationBadgeProps,
  PROCTOR_IDENTITY_MODAL_TEXT as T,
} from "../constants";

interface IdentityVerificationModalProps {
  open: boolean;
  onClose: () => void;
  row: AttendanceRowResponse | null;
  sessionPublicId: string;
  onConfirmVerification?: (payload: {
    studentPublicId: string;
    status: IdentityVerificationStatus;
    note: string;
  }) => Promise<void> | void;
}

export function IdentityVerificationModal({
  open,
  onClose,
  row,
  sessionPublicId,
  onConfirmVerification,
}: IdentityVerificationModalProps): ReactElement {
  const [targetStatus, setTargetStatus] = useState<IdentityVerificationStatus>(
    () => (row?.identityStatus === "VERIFIED" ? "VERIFIED" : row?.identityStatus === "FAILED" ? "FAILED" : "VERIFIED")
  );
  const [note, setNote] = useState(() => row?.identityNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevRowId, setPrevRowId] = useState<string | null>(row?.studentPublicId ?? null);
  if (row && row.studentPublicId !== prevRowId) {
    setPrevRowId(row.studentPublicId);
    setTargetStatus(row.identityStatus === "VERIFIED" ? "VERIFIED" : row.identityStatus === "FAILED" ? "FAILED" : "VERIFIED");
    setNote(row.identityNote ?? "");
    setError(null);
    setIsSubmitting(false);
  }

  if (!row) return <></>;

  const currentStatus = row.identityStatus ?? "UNVERIFIED";
  const { label: currentLabel, variant: currentVariant } = getVerificationBadgeProps(currentStatus);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (targetStatus === "FAILED" && !note.trim()) {
      setError(T.VALIDATION_ERROR_DESC);
      return;
    }
    setError(null);
    if (onConfirmVerification) {
      try {
        setIsSubmitting(true);
        await onConfirmVerification({
          studentPublicId: row.studentPublicId,
          status: targetStatus,
          note: note.trim(),
        });
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : T.SAVE_ERROR_FALLBACK);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title={T.TITLE}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {T.CLOSE_BTN}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e as unknown as FormEvent)}
          >
            {isSubmitting ? T.SAVING_BTN : T.SAVE_BTN}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div>
          <h4 className="font-medium text-[var(--ink-primary)]">
            {row.displayName || row.studentPublicId}
          </h4>
          <p className="text-xs text-[var(--ink-muted)]">{row.email ?? "—"}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--ink-secondary)]">
          <span>{T.CURRENT_STATUS_LABEL}</span>
          <StatusBadge label={currentLabel} variant={currentVariant} />
        </div>

        {error && (
          <Alert tone="error" title={T.VALIDATION_ERROR_TITLE}>
            {error}
          </Alert>
        )}

        <div>
          <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1.5">
            {T.RESULT_LABEL}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTargetStatus("VERIFIED")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                targetStatus === "VERIFIED"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold"
                  : "border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]"
              }`}
            >
              {T.STATUS_VERIFIED}
            </button>
            <button
              type="button"
              onClick={() => setTargetStatus("FAILED")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                targetStatus === "FAILED"
                  ? "border-red-600 bg-red-50 text-red-800 font-semibold"
                  : "border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]"
              }`}
            >
              {T.STATUS_FAILED}
            </button>
            <button
              type="button"
              onClick={() => setTargetStatus("UNVERIFIED")}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                targetStatus === "UNVERIFIED"
                  ? "border-slate-600 bg-slate-100 text-slate-800 font-semibold"
                  : "border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]"
              }`}
            >
              {T.STATUS_UNVERIFIED}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="identity-note" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            {T.NOTE_LABEL_PREFIX}{targetStatus === "FAILED" ? T.NOTE_REQUIRED_SUFFIX : T.NOTE_OPTIONAL_SUFFIX}
          </label>
          <Textarea
            id="identity-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={T.NOTE_PLACEHOLDER}
          />
        </div>

        {targetStatus === "FAILED" && (
          <Alert tone="warning" title={T.ESCALATION_TITLE}>
            <p className="text-xs">{T.ESCALATION_DESC}</p>
            <div className="mt-2">
              <Link href={`/proctor/incidents/${sessionPublicId}`}>
                <Button variant="secondary" size="sm">
                  {T.OPEN_INCIDENTS_BTN}
                </Button>
              </Link>
            </div>
          </Alert>
        )}
      </div>
    </Modal>
  );
}
