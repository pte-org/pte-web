"use client";

import { useState, type ReactElement } from "react";
import type { ExaminerGradingIssueType } from "@pte/api-client";
import { Button, Modal, Select } from "@pte/ui";
import { EXAMINER_ISSUE_OPTIONS, EXAMINER_WORK_TEXT as T } from "../constants";

interface ReportIssueDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (type: ExaminerGradingIssueType, description: string) => void;
}

export function ReportIssueDialog({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: ReportIssueDialogProps): ReactElement {
  const [type, setType] = useState<ExaminerGradingIssueType>("AUDIO_UNAVAILABLE");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit(type, description.trim());
  };

  return (
    <Modal open={open} onClose={onClose} title={T.REPORT_ISSUE_TITLE} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div>
          <label htmlFor="issue-type" className="block text-xs font-medium text-slate-700 mb-1">
            {T.ISSUE_TYPE_LABEL}
          </label>
          <Select
            id="issue-type"
            value={type}
            onChange={(e) => setType(e.target.value as ExaminerGradingIssueType)}
            options={EXAMINER_ISSUE_OPTIONS}
          />
        </div>

        <div>
          <label htmlFor="issue-description" className="block text-xs font-medium text-slate-700 mb-1">
            {T.ISSUE_DESC_LABEL}
          </label>
          <textarea
            id="issue-description"
            rows={4}
            maxLength={2000}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={T.ISSUE_DESC_PLACEHOLDER}
            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            {T.CANCEL}
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={isSubmitting || !description.trim()}
          >
            {isSubmitting ? T.SUBMITTING_ISSUE : T.SUBMIT_ISSUE}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
