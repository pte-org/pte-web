"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, PasswordInput } from "@pte/ui";
import { RESET_STUDENT_PASSWORD_TEXT } from "./constants";

interface ResetStudentPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
  error?: string;
  isSubmitting?: boolean;
}

const MIN_LENGTH = 8;
const T = RESET_STUDENT_PASSWORD_TEXT;

export const ResetStudentPasswordModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: ResetStudentPasswordModalProps): ReactElement => {
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (password.length < MIN_LENGTH) {
      setValidationError(T.MIN_LENGTH_ERROR.replace("{minLength}", String(MIN_LENGTH)));
      return;
    }
    setValidationError(undefined);
    onSubmit(password);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.TITLE}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.CANCEL}
          </button>
          <button
            type="submit"
            form="reset-student-password-form"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? T.SUBMITTING : T.SUBMIT}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <form id="reset-student-password-form" onSubmit={handleSubmit} noValidate>
        <PasswordInput
          label={T.NEW_PASSWORD_LABEL}
          value={password}
          error={validationError}
          onChange={(event) => setPassword(event.target.value)}
        />
      </form>
    </Modal>
  );
};
