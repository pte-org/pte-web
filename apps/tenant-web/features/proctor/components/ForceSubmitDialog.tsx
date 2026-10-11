"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Button } from "@pte/ui";

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

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      await onConfirm(reason);
      setReason("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đình chỉ bài làm. Vui lòng thử lại.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="force-submit-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="force-submit-title" className="text-lg font-semibold text-slate-900">
          Xác nhận đình chỉ & Nộp bài bắt buộc
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Bạn có chắc chắn muốn nộp bài bắt buộc cho thí sinh{" "}
          <strong className="text-slate-900">{studentName}</strong> (Bài thi:{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">
            {attemptPublicId.slice(0, 8).toUpperCase()}
          </code>
          )? Thí sinh sẽ không thể tiếp tục làm bài.
        </p>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="force-submit-reason" className="block text-xs font-medium text-slate-700">
              Lý do đình chỉ (tùy chọn)
            </label>
            <textarea
              id="force-submit-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do nộp bài bắt buộc hoặc căn cứ biên bản..."
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={isLoading || disabled}
              title={disabled ? "Không khả dụng khi mất kết nối" : undefined}
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận nộp bài"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
