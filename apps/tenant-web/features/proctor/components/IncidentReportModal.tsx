"use client";

import { useFeedbackToast } from "../hooks/useFeedbackToast";

import { useState, type FormEvent, type ReactElement } from "react";
import { Button, Input, Modal, Textarea } from "@pte/ui";
import type { IncidentCategory, IncidentSeverity } from "@pte/api-client";
import { useIncidentText } from "../hooks/useIncidentText";
import { useAttendanceRoster, useCreateIncidentMutation } from "../api";

/** The attendance endpoint caps a page at 100 rows. */
const ROSTER_PICKER_SIZE = 100;

const studentLabel = (
  displayName: string | null | undefined,
  email: string | null | undefined,
  publicId: string,
): string =>
  `${displayName || publicId}${email ? ` — ${email}` : ""}`;

interface IncidentReportModalProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
  initialStudentPublicId?: string | null;
  onSuccess?: () => void;
}

export function IncidentReportModal({
  open,
  onClose,
  sessionPublicId,
  initialStudentPublicId,
  onSuccess,
}: IncidentReportModalProps): ReactElement {
  const text = useIncidentText();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<IncidentCategory>("IDENTITY_VERIFICATION");
  const [severity, setSeverity] = useState<IncidentSeverity>("MEDIUM");
  const [description, setDescription] = useState("");
  const [studentPublicId, setStudentPublicId] = useState(initialStudentPublicId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [previousOpen, setPreviousOpen] = useState(open);
  if (previousOpen !== open) {
    setPreviousOpen(open);
    setError(null);
  }

  useFeedbackToast(open ? error : null);

  const createMutation = useCreateIncidentMutation(sessionPublicId);
  // Load the roster only while the modal is open; an empty id keeps the query disabled.
  const roster = useAttendanceRoster(open ? sessionPublicId : "", { size: ROSTER_PICKER_SIZE });
  const students = roster.data?.data ?? [];
  const studentOptions = students.map((student) => ({
    id: student.studentPublicId,
    label: studentLabel(student.displayName, student.email, student.studentPublicId),
  }));
  // A preselected student beyond the first page must stay selectable.
  if (studentPublicId && !studentOptions.some((option) => option.id === studentPublicId)) {
    studentOptions.unshift({ id: studentPublicId, label: studentPublicId });
  }

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!title.trim()) {
      setError(text.reportTitleRequired);
      return;
    }
    if (!description.trim()) {
      setError(text.reportDescriptionRequired);
      return;
    }
    setError(null);

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        category,
        severity,
        description: description.trim(),
        studentPublicId: studentPublicId || undefined,
      });
      setTitle("");
      setDescription("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : text.reportFallbackError);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={text.reportTitle}
      size="lg"
      isDismissDisabled={createMutation.isPending}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            {text.reportCancel}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={createMutation.isPending}
            onClick={(e) => void handleSubmit(e as unknown as FormEvent)}
          >
            {createMutation.isPending ? text.reportSubmitting : text.reportSubmit}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div>
          <label
            htmlFor="incident-title"
            className="block text-xs font-medium text-[var(--ink-secondary)] mb-1"
          >
            {text.reportFieldTitle}
          </label>
          <Input
            id="incident-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={text.reportTitlePlaceholder}
            disabled={createMutation.isPending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="incident-category"
              className="block text-xs font-medium text-[var(--ink-secondary)] mb-1"
            >
              {text.reportFieldCategory}
            </label>
            <select
              id="incident-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)]"
              disabled={createMutation.isPending}
            >
              {text.categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="incident-severity"
              className="block text-xs font-medium text-[var(--ink-secondary)] mb-1"
            >
              {text.reportFieldSeverity}
            </label>
            <select
              id="incident-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)]"
              disabled={createMutation.isPending}
            >
              {text.severityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="incident-student"
            className="block text-xs font-medium text-[var(--ink-secondary)] mb-1"
          >
            {text.reportFieldStudent}
          </label>
          <select
            id="incident-student"
            value={studentPublicId}
            onChange={(e) => setStudentPublicId(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)]"
            disabled={createMutation.isPending || roster.isLoading}
          >
            <option value="">{roster.isLoading ? text.reportStudentLoading : text.reportStudentNone}</option>
            {studentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="incident-description"
            className="block text-xs font-medium text-[var(--ink-secondary)] mb-1"
          >
            {text.reportFieldDescription}
          </label>
          <Textarea
            id="incident-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={text.reportDescriptionPlaceholder}
            disabled={createMutation.isPending}
          />
        </div>
      </div>
    </Modal>
  );
}
