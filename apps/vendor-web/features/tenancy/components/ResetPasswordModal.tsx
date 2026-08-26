"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal } from "@pte/ui";
import { EMPTY_RESET_PASSWORD, RESET_PASSWORD_TEXT } from "../constants";
import { validateResetPassword } from "../utils/validateResetPassword";
import type { ResetPasswordErrors, ResetPasswordInput } from "../types";
import { TenantFormField, fieldInputClass } from "./_TenantFormField";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ResetPasswordInput) => void;
  error?: string;
  isSubmitting?: boolean;
}

const T = RESET_PASSWORD_TEXT;
const FORM_ID = "reset-password-form";

export const ResetPasswordModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: ResetPasswordModalProps): ReactElement => {
  const [form, setForm] = useState<ResetPasswordInput>(EMPTY_RESET_PASSWORD);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateResetPassword(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
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
            form={FORM_ID}
            disabled={isSubmitting}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Resetting..." : T.SUBMIT}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TenantFormField
          label={T.PASSWORD_LABEL}
          htmlFor="reset-password"
          required
          helper={T.PASSWORD_HELPER}
          error={errors.newPassword}
        >
          <input
            id="reset-password"
            type="password"
            value={form.newPassword}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, newPassword: event.target.value }))
            }
            className={fieldInputClass(errors.newPassword)}
          />
        </TenantFormField>
      </form>
    </Modal>
  );
};
