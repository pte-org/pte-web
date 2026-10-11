"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Button } from "@pte/ui";

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

  if (!isOpen) return null;

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="violation-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="violation-form-title" className="text-lg font-semibold text-slate-900">
          Ghi nhận vi phạm quy chế thi
        </h2>
        {studentName && (
          <p className="mt-1 text-sm text-slate-600">
            Thí sinh: <strong className="text-slate-900">{studentName}</strong>
            {attemptPublicId && (
              <>
                {" "}(Bài thi:{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">
                  {attemptPublicId.slice(0, 8).toUpperCase()}
                </code>
                )
              </>
            )}
          </p>
        )}

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="violation-type" className="block text-xs font-medium text-slate-700">
              Loại vi phạm *
            </label>
            <select
              id="violation-type"
              value={violationType}
              onChange={(e) => setViolationType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
            <label htmlFor="violation-note" className="block text-xs font-medium text-slate-700">
              Mô tả chi tiết vi phạm
            </label>
            <textarea
              id="violation-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú chi tiết diễn biến vi phạm..."
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || disabled}
              title={disabled ? "Không khả dụng khi mất kết nối" : undefined}
            >
              {isLoading ? "Đang lưu..." : "Ghi nhận vi phạm"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
