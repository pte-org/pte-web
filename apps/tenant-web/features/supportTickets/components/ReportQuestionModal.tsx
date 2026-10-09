"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, Textarea, useLocale } from "@pte/ui";
import { useReportQuestion } from "../api";

interface ReportQuestionModalProps {
  questionPublicId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FORM_ID = "report-question-form";

export const ReportQuestionModal = ({
  questionPublicId,
  open,
  onClose,
  onSuccess,
}: ReportQuestionModalProps): ReactElement => {
  const { t } = useLocale();
  const [description, setDescription] = useState("");
  const report = useReportQuestion(questionPublicId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!description.trim() || description.length > 2000) return;
    report.mutate(description.trim(), {
      onSuccess: () => {
        setDescription("");
        report.reset();
        onSuccess();
      },
    });
  };

  const handleClose = (): void => {
    setDescription("");
    report.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("tenant.support.reportQuestion.title", "Report question issue")}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-[var(--shell-border)] px-4 py-2 text-sm font-medium text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-subtle)]"
          >
            {t("tenant.support.reportQuestion.cancel", "Cancel")}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={report.isPending || !description.trim() || description.length > 2000}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-[var(--action-foreground)] hover:bg-action-hover disabled:opacity-50"
          >
            {report.isPending
              ? t("tenant.support.reportQuestion.submitting", "Submitting...")
              : t("tenant.support.reportQuestion.submit", "Submit report")}
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {report.isError && <Alert tone="error">{report.error.message}</Alert>}

        <div className="flex flex-col gap-1">
          <label
            className="text-sm font-medium text-[var(--ink-primary)]"
            htmlFor="report-description"
          >
            {t("tenant.support.reportQuestion.description", "Describe the issue")}
          </label>
          <Textarea
            id="report-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t(
              "tenant.support.reportQuestion.placeholder",
              "Describe the issue with this question",
            )}
            rows={5}
          />
          <div className="flex justify-end">
            <span className="text-xs text-[var(--ink-muted)]">{description.length} / 2000</span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
