"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, Modal, Textarea } from "@pte/ui";
import type { IncidentCategory, IncidentSeverity } from "@pte/api-client";
import { useCreateIncidentMutation } from "../api";

interface IncidentReportModalProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
  initialStudentPublicId?: string | null;
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS: Array<{ value: IncidentCategory; label: string }> = [
  { value: "IDENTITY_VERIFICATION", label: "Nghi vấn xác minh danh tính" },
  { value: "RULE_VIOLATION", label: "Vi phạm quy chế thi" },
  { value: "TECHNICAL_ISSUE", label: "Sự cố kỹ thuật / Thiết bị" },
  { value: "DISRUPTION", label: "Mất trật tự / Can thiệp phòng thi" },
  { value: "OTHER", label: "Sự cố khác" },
];

const SEVERITY_OPTIONS: Array<{ value: IncidentSeverity; label: string; desc: string }> = [
  { value: "LOW", label: "Thấp (LOW)", desc: "Không ảnh hưởng nhiều tới tiến trình làm bài" },
  { value: "MEDIUM", label: "Trung bình (MEDIUM)", desc: "Cần giám thị hoặc Host theo dõi, nhắc nhở" },
  { value: "HIGH", label: "Nghiêm trọng (HIGH)", desc: "Nghi vấn gian lận hoặc sự cố cần chuyển cấp khẩn cấp" },
];

export function IncidentReportModal({
  open,
  onClose,
  sessionPublicId,
  initialStudentPublicId,
  onSuccess,
}: IncidentReportModalProps): ReactElement {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IncidentCategory>("IDENTITY_VERIFICATION");
  const [severity, setSeverity] = useState<IncidentSeverity>("MEDIUM");
  const [description, setDescription] = useState("");
  const [studentPublicId, setStudentPublicId] = useState(initialStudentPublicId ?? "");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateIncidentMutation(sessionPublicId);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề sự cố.");
      return;
    }
    if (!description.trim()) {
      setError("Vui lòng nhập mô tả chi tiết sự cố.");
      return;
    }
    setError(null);

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        category,
        severity,
        description: description.trim(),
        studentPublicId: studentPublicId.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo báo cáo sự cố. Vui lòng thử lại.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Báo cáo sự cố phòng thi mới"
      size="lg"
      isDismissDisabled={createMutation.isPending}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createMutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={createMutation.isPending}
            onClick={(e) => void handleSubmit(e as unknown as FormEvent)}
          >
            {createMutation.isPending ? "Đang gửi báo cáo..." : "Gửi báo cáo sự cố"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {error && (
          <Alert tone="error" title="Lỗi gửi báo cáo">
            {error}
          </Alert>
        )}

        <div>
          <label htmlFor="incident-title" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            Tiêu đề sự cố *
          </label>
          <Input
            id="incident-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Thí sinh không mang giấy tờ tùy thân hợp lệ..."
            disabled={createMutation.isPending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="incident-category" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
              Phân loại sự cố *
            </label>
            <select
              id="incident-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)]"
              disabled={createMutation.isPending}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="incident-severity" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
              Mức độ nghiêm trọng *
            </label>
            <select
              id="incident-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)]"
              disabled={createMutation.isPending}
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="incident-student" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            Mã định danh thí sinh liên quan (tùy chọn)
          </label>
          <Input
            id="incident-student"
            value={studentPublicId}
            onChange={(e) => setStudentPublicId(e.target.value)}
            placeholder="Nhập mã định danh công khai của thí sinh (nếu có)..."
            disabled={createMutation.isPending}
          />
        </div>

        <div>
          <label htmlFor="incident-description" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            Mô tả chi tiết sự cố *
          </label>
          <Textarea
            id="incident-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả cụ thể thời điểm phát hiện, hành vi hoặc hiện tượng quan sát thấy..."
            disabled={createMutation.isPending}
          />
        </div>
      </div>
    </Modal>
  );
}
