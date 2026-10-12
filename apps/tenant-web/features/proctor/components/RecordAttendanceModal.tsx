"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Alert, Button, Modal, StatusBadge, Textarea } from "@pte/ui";
import type { AttendanceRowResponse, AttendanceStatus } from "@pte/api-client";
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

const getStatusBadgeVariant = (status: AttendanceStatus) => {
  switch (status) {
    case "PRESENT":
      return "success";
    case "ABSENT":
      return "danger";
    case "UNMARKED":
    default:
      return "neutral";
  }
};

const getStatusLabel = (status: AttendanceStatus) => {
  switch (status) {
    case "PRESENT":
      return "Có mặt";
    case "ABSENT":
      return "Vắng mặt";
    case "UNMARKED":
    default:
      return "Chưa điểm danh";
  }
};

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
  const [reason, setReason] = useState("");
  const [requestUuid, setRequestUuid] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isIntentFrozen, setIsIntentFrozen] = useState(false);
  const [isStaleConflict, setIsStaleConflict] = useState(false);

  const proctorMutation = useRecordAttendanceMutation(sessionPublicId);
  const hostMutation = useRecordHostAttendanceMutation(sessionPublicId);
  const mutation = isHost ? hostMutation : proctorMutation;

  useEffect(() => {
    if (open) {
      setReason("");
      setErrorMessage(null);
      setIsIntentFrozen(false);
      setIsStaleConflict(false);
      setRequestUuid(generateUuid());
    }
  }, [open, row?.studentPublicId, targetStatus]);

  if (!row || !targetStatus) return <></>;

  const isCorrection = row.status !== "UNMARKED" || targetStatus === "UNMARKED";
  const isReasonRequired = isHost || isCorrection;
  const hasDiscrepancy =
    targetStatus === "ABSENT" && Boolean(row.latestAttemptActivityStatus);

  const handleSubmit = async () => {
    if (isReasonRequired && !reason.trim()) {
      setErrorMessage("Vui lòng nhập lý do thay đổi điểm danh.");
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
      if (msg.includes("409") || msg.includes("Conflict") || msg.includes("stale") || msg.includes("version")) {
        setIsStaleConflict(true);
        setErrorMessage(
          "Dữ liệu điểm danh đã được thay đổi bởi người khác. Vui lòng tải lại trang để xem trạng thái mới nhất.",
        );
      } else {
        // Freeze current intent so user retries exact same payload and UUID, preventing idempotency conflicts
        setIsIntentFrozen(true);
        setErrorMessage("Lỗi kết nối hoặc phản hồi máy chủ chưa xác định. Bạn có thể gửi lại chính xác lệnh này hoặc hủy để tải lại.");
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      isDismissDisabled={mutation.isPending}
      title="Xác nhận ghi nhận điểm danh"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" disabled={mutation.isPending} onClick={onClose}>
            {isStaleConflict ? "Đóng" : "Hủy"}
          </Button>
          {!isStaleConflict && (
            <Button
              variant="primary"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => void handleSubmit()}
            >
              {mutation.isPending
                ? "Đang xử lý..."
                : isIntentFrozen
                ? "Thử lại chính xác"
                : "Xác nhận"}
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
            <span className="text-xs text-[var(--ink-muted)]">Hiện tại:</span>
            <div className="mt-1">
              <StatusBadge
                label={getStatusLabel(row.status)}
                variant={getStatusBadgeVariant(row.status)}
              />
            </div>
          </div>
          <span className="text-lg text-[var(--ink-muted)]">→</span>
          <div>
            <span className="text-xs text-[var(--ink-muted)]">Mục tiêu:</span>
            <div className="mt-1">
              <StatusBadge
                label={getStatusLabel(targetStatus)}
                variant={getStatusBadgeVariant(targetStatus)}
              />
            </div>
          </div>
        </div>

        {hasDiscrepancy && (
          <Alert tone="warning" title="Cảnh báo bất đồng bộ bài thi">
            Thí sinh có ghi nhận hoạt động bài thi (Trạng thái:{" "}
            <span className="font-medium">{row.latestAttemptActivityStatus}</span>). Thao tác đánh
            dấu VẮNG MẶT không hủy bỏ hay ngắt bài thi của thí sinh.
          </Alert>
        )}

        <Textarea
          id="attendance-reason-input"
          label={isReasonRequired ? "Lý do thay đổi (bắt buộc)" : "Ghi chú (tùy chọn)"}
          required={isReasonRequired}
          disabled={isIntentFrozen || isStaleConflict}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            isReasonRequired
              ? "Nhập lý do điều chỉnh trạng thái điểm danh..."
              : "Nhập ghi chú nếu có..."
          }
          className="w-full"
        />

        {errorMessage && (
          <Alert tone={isStaleConflict ? "warning" : "error"}>
            {errorMessage}
          </Alert>
        )}
      </div>
    </Modal>
  );
}
