"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, PasswordInput } from "@pte/ui";

interface ResetStudentPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
  error?: string;
  isSubmitting?: boolean;
}

const MIN_LENGTH = 8;

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
      setValidationError(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    setValidationError(undefined);
    onSubmit(password);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Password"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="reset-student-password-form"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
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
          label="New password"
          value={password}
          error={validationError}
          onChange={(event) => setPassword(event.target.value)}
        />
      </form>
    </Modal>
  );
};
