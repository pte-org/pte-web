"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Button, Modal, Textarea } from "@pte/ui";
import { QUESTIONBANK_TEXT as T } from "../constants";

interface RejectQuestionModalProps {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const FORM_ID = "reject-question-form";

export const RejectQuestionModal = ({
  open,
  isSubmitting = false,
  onClose,
  onConfirm,
}: RejectQuestionModalProps): ReactElement => {
  const [reason, setReason] = useState<string>(T.REJECTION_REASON_DEFAULT);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError(T.REJECT_REASON_REQUIRED);
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.REJECT_MODAL_TITLE}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {T.CANCEL}
          </Button>
          <Button type="submit" form={FORM_ID} variant="danger" isLoading={isSubmitting}>
            {T.REJECT_CONFIRM_BUTTON}
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-gray-600">{T.REJECT_MODAL_DESCRIPTION}</p>
      <form id={FORM_ID} onSubmit={handleSubmit}>
        <Textarea
          id="reject-reason"
          label={T.REJECT_REASON_LABEL}
          placeholder={T.REJECT_REASON_PLACEHOLDER}
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            if (error) setError(undefined);
          }}
          error={error}
          required
          autoFocus
        />
      </form>
    </Modal>
  );
};
