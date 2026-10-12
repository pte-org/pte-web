"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Button, Modal } from "@pte/ui";

interface ViolationFormProps {
  isOpen: boolean;
  studentName?: string;
  attemptPublicId?: string | null;
  isLoading: boolean;
  disabled?: boolean;
  onClose: () => void;
  onConfirm: (payload: { violationType: string; detail: string }) => Promise<void>;
}

const VIOLATION_TYPES = [
  { value: "TAB_SWITCH", label: "Chuyển tab / ứng dụng khác" },
  { value: "MULTIPLE_FACES", label: "Nhiều khuôn mặt trong camera" },
  { value: "FACE_NOT_VISIBLE", label: "Không nhận diện được khuôn mặt / rời vị trí" },
  { value: "SUSPICIOUS_AUDIO", label: "Âm thanh bất thường / tiếng nói" },
  { value: "TECHNICAL_ISSUE", label: "Sự cố kỹ thuật thiết bị" },
  { value: "OTHER", label: "Hành vi vi phạm quy chế khác" },
];

export function ViolationForm({
  isOpen,
  studentName,
  attemptPublicId,
  isLoading,
  disabled = false,
  onClose,
  onConfirm,
}: ViolationFormProps): ReactElement | null {
  const [violationType, setViolationType] = useState("TAB_SWITCH");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!attemptPublicId) {
      setError("Thí sinh chưa có bài thi để ghi nhận vi phạm.");
      return;
    }
    setError(null);
    try {
      await onConfirm({ violationType, detail: note });
      setNote("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể ghi nhận vi phạm. Vui lòng thử lại.");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Ghi nhận vi phạm quy chế thi"
      size="md"
      isDismissDisabled={isLoading}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={isLoading || disabled}
            onClick={(e) => void handleSubmit(e as unknown as FormEvent)}
          >
            {isLoading ? "Đang xử lý..." : "Lưu biên bản vi phạm"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {studentName && (
          <p className="text-sm text-[var(--ink-secondary)]">
            Thí sinh: <strong className="text-[var(--ink-primary)]">{studentName}</strong>
            {attemptPublicId && (
              <>
                {" "}(Bài thi:{" "}
                <code className="rounded bg-[var(--surface-subtle)] px-1.5 py-0.5 font-mono text-xs text-[var(--ink-primary)]">
                  {attemptPublicId.slice(0, 8).toUpperCase()}
                </code>
                )
              </>
            )}
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="violation-type" className="block text-xs font-medium text-[var(--ink-secondary)]">
            Loại vi phạm *
          </label>
          <select
            id="violation-type"
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={isLoading}
          >
            {VIOLATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="violation-note" className="block text-xs font-medium text-[var(--ink-secondary)]">
            Mô tả chi tiết vi phạm
          </label>
          <textarea
            id="violation-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mô tả cụ thể thời điểm, hành vi quan sát thấy..."
            className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)] focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}
