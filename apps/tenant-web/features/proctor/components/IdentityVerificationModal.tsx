"use client";

import { useState, useEffect, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, Modal, StatusBadge, Textarea } from "@pte/ui";
import type { AttendanceRowResponse, IdentityVerificationStatus } from "@pte/api-client";

interface IdentityVerificationModalProps {
  open: boolean;
  onClose: () => void;
  row: AttendanceRowResponse | null;
  sessionPublicId: string;
  onConfirmVerification?: (payload: {
    studentPublicId: string;
    status: IdentityVerificationStatus;
    note: string;
  }) => void;
}

function getVerificationBadgeProps(status: IdentityVerificationStatus): {
  label: string;
  variant: "success" | "danger" | "neutral";
} {
  switch (status) {
    case "VERIFIED":
      return { label: "Đã xác minh", variant: "success" };
    case "FAILED":
      return { label: "Không xác minh được / Nghi vấn", variant: "danger" };
    case "UNVERIFIED":
    default:
      return { label: "Chưa xác minh", variant: "neutral" };
  }
}

export function IdentityVerificationModal({
  open,
  onClose,
  row,
  sessionPublicId,
  onConfirmVerification,
}: IdentityVerificationModalProps): ReactElement {
  const [targetStatus, setTargetStatus] = useState<IdentityVerificationStatus>("VERIFIED");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && row) {
      setTargetStatus(row.identityStatus === "VERIFIED" ? "VERIFIED" : row.identityStatus === "FAILED" ? "FAILED" : "VERIFIED");
      setNote(row.identityNote ?? "");
      setError(null);
    }
  }, [open, row]);

  if (!row) return <></>;

  const currentStatus = row.identityStatus ?? "UNVERIFIED";
  const { label: currentLabel, variant: currentVariant } = getVerificationBadgeProps(currentStatus);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (targetStatus === "FAILED" && !note.trim()) {
      setError("Vui lòng nhập mô tả hoặc lý do không xác minh được danh tính.");
      return;
    }
    setError(null);
    if (onConfirmVerification) {
      onConfirmVerification({
        studentPublicId: row.studentPublicId,
        status: targetStatus,
        note: note.trim(),
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xác minh danh tính thí sinh"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={(e) => handleSubmit(e as unknown as FormEvent)}
          >
            Lưu xác minh
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
          <span>Trạng thái hiện tại:</span>
          <StatusBadge label={currentLabel} variant={currentVariant} />
        </div>

        {error && (
          <Alert tone="error" title="Thông tin chưa hợp lệ">
            {error}
          </Alert>
        )}

        <div>
          <label className="block text-xs font-medium text-[var(--ink-secondary)] mb-1.5">
            Kết quả đối chiếu danh tính *
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
              Hợp lệ (VERIFIED)
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
              Nghi vấn (FAILED)
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
              Chưa xác minh
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="identity-note" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            Ghi chú đối chiếu {targetStatus === "FAILED" ? "(Bắt buộc)" : "(Tùy chọn)"}
          </label>
          <Textarea
            id="identity-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi nhận kết quả kiểm tra giấy tờ tùy thân, thẻ sinh viên..."
          />
        </div>

        {targetStatus === "FAILED" && (
          <Alert tone="warning" title="Thủ tục chuyển giao sự cố">
            <p className="text-xs">
              Trường hợp không xác minh được danh tính, quy chế yêu cầu lập biên bản sự cố gửi Host để
              xử lý hoặc chuyển cấp Admin.
            </p>
            <div className="mt-2">
              <Link href={`/proctor/incidents/${sessionPublicId}`}>
                <Button variant="secondary" size="sm">
                  Mở quản lý sự cố ca thi
                </Button>
              </Link>
            </div>
          </Alert>
        )}
      </div>
    </Modal>
  );
}
