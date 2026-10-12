"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, PasswordInput, useLocale } from "@pte/ui";
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
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string | undefined>();
  const text = {
    title: t("tenant.studentRoster.passwordModalTitle", T.TITLE),
    cancel: t("tenant.studentRoster.cancel", T.CANCEL),
    submit: t("tenant.studentRoster.submit", T.SUBMIT),
    submitting: t("tenant.studentRoster.submitting", T.SUBMITTING),
    newPassword: t("tenant.studentRoster.newPassword", T.NEW_PASSWORD_LABEL),
    minLength: (minLength: number) =>
      t("tenant.studentRoster.passwordMinLength", T.MIN_LENGTH_ERROR, { minLength }),
  };

  const handlePasswordChange = (value: string): void => {
    setPassword(value);
    if (validationError !== undefined) setValidationError(undefined);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (password.length < MIN_LENGTH) {
      setValidationError(text.minLength(MIN_LENGTH));
      return;
    }
    setValidationError(undefined);
    onSubmit(password);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={text.title}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {text.cancel}
          </button>
          <button
            type="submit"
            form="reset-student-password-form"
            disabled={isSubmitting}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? text.submitting : text.submit}
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
          label={text.newPassword}
          value={password}
          error={validationError}
          onChange={(event) => handlePasswordChange(event.target.value)}
        />
      </form>
    </Modal>
  );
};
