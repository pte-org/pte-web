"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, Modal, Textarea } from "@pte/ui";
import type { IncidentCategory, IncidentSeverity } from "@pte/api-client";
import {
  PROCTOR_INCIDENT_CATEGORY_OPTIONS,
  PROCTOR_INCIDENT_REPORT_TEXT as T,
  PROCTOR_INCIDENT_SEVERITY_OPTIONS,
} from "../constants";
import { useCreateIncidentMutation } from "../api";

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
      setError(T.ERROR_TITLE_REQUIRED);
      return;
    }
    if (!description.trim()) {
      setError(T.ERROR_DESC_REQUIRED);
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
      setError(err instanceof Error ? err.message : T.ERROR_FALLBACK);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.TITLE}
      size="lg"
      isDismissDisabled={createMutation.isPending}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createMutation.isPending}>
            {T.CANCEL_BTN}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={createMutation.isPending}
            onClick={(e) => void handleSubmit(e as unknown as FormEvent)}
          >
            {createMutation.isPending ? T.SUBMITTING_BTN : T.SUBMIT_BTN}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {error && (
          <Alert tone="error" title={T.ERROR_TITLE}>
            {error}
          </Alert>
        )}

        <div>
          <label htmlFor="incident-title" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            {T.FIELD_TITLE}
          </label>
          <Input
            id="incident-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={T.TITLE_PLACEHOLDER}
            disabled={createMutation.isPending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="incident-category" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
              {T.FIELD_CATEGORY}
            </label>
            <select
              id="incident-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)]"
              disabled={createMutation.isPending}
            >
              {PROCTOR_INCIDENT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="incident-severity" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
              {T.FIELD_SEVERITY}
            </label>
            <select
              id="incident-severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-default)] p-2 text-sm text-[var(--ink-primary)]"
              disabled={createMutation.isPending}
            >
              {PROCTOR_INCIDENT_SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="incident-student" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            {T.FIELD_STUDENT_ID}
          </label>
          <Input
            id="incident-student"
            value={studentPublicId}
            onChange={(e) => setStudentPublicId(e.target.value)}
            placeholder={T.STUDENT_ID_PLACEHOLDER}
            disabled={createMutation.isPending}
          />
        </div>

        <div>
          <label htmlFor="incident-description" className="block text-xs font-medium text-[var(--ink-secondary)] mb-1">
            {T.FIELD_DESCRIPTION}
          </label>
          <Textarea
            id="incident-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={T.DESCRIPTION_PLACEHOLDER}
            disabled={createMutation.isPending}
          />
        </div>
      </div>
    </Modal>
  );
}
