"use client";

import { useFeedbackToast } from "../hooks/useFeedbackToast";

import { useState, type ReactElement } from "react";
import { Alert, Button, Modal, StatusBadge, Textarea } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
import {
  getAttendanceBadgeVariant,
} from "../constants";
import { useAttendanceText } from "../hooks/useAttendanceText";
import { useRecordAttendanceMutation, useRecordHostAttendanceMutation } from "../api";

interface RecordAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  row: AttendanceRowResponse | null;
  targetStatus: AttendanceStatus | null;
  sessionPublicId: string;
  isHost?: boolean;
  onSuccess?: () => void;
}

const generateUuid = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function RecordAttendanceModal({
  open,
  onClose,
  row,
  targetStatus,
  sessionPublicId,
  isHost = false,
  onSuccess,
}: RecordAttendanceModalProps): ReactElement {
  const text = useAttendanceText();
  const [reason, setReason] = useState("");
  const [requestUuid, setRequestUuid] = useState(generateUuid);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isIntentFrozen, setIsIntentFrozen] = useState(false);
  const [isStaleConflict, setIsStaleConflict] = useState(false);

  useFeedbackToast(open && !isStaleConflict ? errorMessage : null);

  const proctorMutation = useRecordAttendanceMutation(sessionPublicId);
  const hostMutation = useRecordHostAttendanceMutation(sessionPublicId);
  const mutation = isHost ? hostMutation : proctorMutation;

  const targetKey = `${open}-${row?.studentPublicId}-${targetStatus}`;
  const [prevTargetKey, setPrevTargetKey] = useState(targetKey);
  if (targetKey !== prevTargetKey) {
    setPrevTargetKey(targetKey);
    setReason("");
    setErrorMessage(null);
    setIsIntentFrozen(false);
    setIsStaleConflict(false);
    setRequestUuid(generateUuid());
  }

  if (!row || !targetStatus) return <></>;

  const isCorrection = row.status !== "UNMARKED" || targetStatus === "UNMARKED";
  const isReasonRequired = isHost || isCorrection;
  const hasDiscrepancy = targetStatus === "ABSENT" && Boolean(row.latestAttemptActivityStatus);

  const handleSubmit = async () => {
    if (isReasonRequired && !reason.trim()) {
      setErrorMessage(text.reasonValidationError);
      return;
    }
    setErrorMessage(null);

    try {
      await mutation.mutateAsync({
        studentPublicId: row.studentPublicId,
        request: {
          status: targetStatus,
          enrollmentPublicId: row.enrollmentPublicId,
          expectedVersion: row.version,
          requestPublicId: requestUuid,
          reasonOrNote: reason.trim() || null,
        },
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("409") ||
        msg.includes("Conflict") ||
        msg.includes("stale") ||
        msg.includes("version")
      ) {
        setIsStaleConflict(true);
        setErrorMessage(text.staleConflictError);
      } else {
        // Freeze current intent so user retries exact same payload and UUID, preventing idempotency conflicts
        setIsIntentFrozen(true);
        setErrorMessage(text.unknownNetworkError);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      isDismissDisabled={mutation.isPending}
      title={text.recordTitle}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" disabled={mutation.isPending} onClick={onClose}>
            {isStaleConflict ? text.close : text.cancel}
          </Button>
          {!isStaleConflict && (
            <Button
              variant="primary"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => void handleSubmit()}
            >
              {mutation.isPending
                ? text.recordProcessing
                : isIntentFrozen
                  ? text.recordRetryExact
                  : text.recordConfirm}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <div className="rounded-lg bg-[var(--surface-subtle)] p-3 text-sm">
          <div className="font-medium text-[var(--ink-primary)]">
            {row.displayName || row.studentPublicId}
          </div>
          {row.email && <div className="text-xs text-[var(--ink-secondary)]">{row.email}</div>}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] p-3 text-sm">
          <div>
            <span className="text-xs text-[var(--ink-muted)]">{text.recordCurrent}</span>
            <div className="mt-1">
              <StatusBadge
                label={text.statusLabel(row.status)}
                variant={getAttendanceBadgeVariant(row.status)}
              />
            </div>
          </div>
          <span className="text-lg text-[var(--ink-muted)]">→</span>
          <div>
            <span className="text-xs text-[var(--ink-muted)]">{text.recordTarget}</span>
            <div className="mt-1">
              <StatusBadge
                label={text.statusLabel(targetStatus)}
                variant={getAttendanceBadgeVariant(targetStatus)}
              />
            </div>
          </div>
        </div>

        {hasDiscrepancy && (
          <Alert tone="warning" title={text.discrepancyTitle}>
            {text.discrepancyPrefix}
            <span className="font-medium">{row.latestAttemptActivityStatus}</span>
            {text.discrepancySuffix}
          </Alert>
        )}

        <Textarea
          id="attendance-reason-input"
          label={isReasonRequired ? text.reasonRequiredLabel : text.reasonOptionalLabel}
          required={isReasonRequired}
          disabled={isIntentFrozen || isStaleConflict}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            isReasonRequired ? text.reasonRequiredPlaceholder : text.reasonOptionalPlaceholder
          }
          className="w-full"
        />
        {isStaleConflict && errorMessage && <Alert tone="warning">{errorMessage}</Alert>}
      </div>
    </Modal>
  );
}
