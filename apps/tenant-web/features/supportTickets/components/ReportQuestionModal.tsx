"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, Textarea } from "@pte/ui";
import { REPORT_QUESTION_TEXT as T } from "../constants";
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
      title={T.TITLE}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.CANCEL}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={report.isPending || !description.trim() || description.length > 2000}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:opacity-50"
          >
            {report.isPending ? "Submitting…" : T.SUBMIT}
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {report.isError && <Alert tone="error">{report.error.message}</Alert>}

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">{T.QUESTION_ID_LABEL}</span>
          <span className="font-mono text-xs text-gray-500 break-all">{questionPublicId}</span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="report-description">
            {T.DESCRIPTION_LABEL}
          </label>
          <Textarea
            id="report-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={T.DESCRIPTION_PLACEHOLDER}
            rows={5}
          />
          <div className="flex justify-end">
            <span className="text-xs text-gray-400">{description.length} / 2000</span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
