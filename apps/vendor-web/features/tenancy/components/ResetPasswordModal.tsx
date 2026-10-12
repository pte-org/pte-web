"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EMPTY_RESET_PASSWORD, RESET_PASSWORD_TEXT as RAW_RESET_PASSWORD_TEXT } from "../constants";
import { validateResetPassword } from "../utils/validateResetPassword";
import type { ResetPasswordErrors, ResetPasswordInput } from "../types";
import { TenantFormField, fieldInputClass } from "./_TenantFormField";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ResetPasswordInput) => void;
  error?: string;
  isSubmitting?: boolean;
  tenantName: string;
  targetName: string;
  targetUsername: string;
  targetRoles: string[];
}

const FORM_ID = "reset-password-form";

export const ResetPasswordModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
  tenantName,
  targetName,
  targetUsername,
  targetRoles,
}: ResetPasswordModalProps): ReactElement => {
  const T = useAdminCopy(RAW_RESET_PASSWORD_TEXT);
  const [form, setForm] = useState<ResetPasswordInput>(EMPTY_RESET_PASSWORD);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const localizedErrors = useAdminCopy(errors);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string>();
  const roleLabel = targetRoles.length > 0 ? targetRoles.join(", ") : T.EMPTY_VALUE;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateResetPassword(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!confirmed) {
      setConfirmationError(T.TARGET_CONFIRMATION_REQUIRED);
      return;
    }
    onSubmit(form);
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
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
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
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">{T.TARGET_TITLE}</p>
          <dl className="mt-2 grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-x-3">
            <dt className="font-medium">{T.TENANT_LABEL}</dt>
            <dd>{tenantName}</dd>
            <dt className="font-medium">{T.TARGET_NAME_LABEL}</dt>
            <dd>{targetName}</dd>
            <dt className="font-medium">{T.TARGET_USERNAME_LABEL}</dt>
            <dd>{targetUsername}</dd>
            <dt className="font-medium">{T.TARGET_ROLES_LABEL}</dt>
            <dd>{roleLabel}</dd>
          </dl>
          <label className="mt-4 flex items-start gap-2">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => {
                setConfirmed(event.target.checked);
                if (event.target.checked) setConfirmationError(undefined);
              }}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-action focus:ring-action"
            />
            <span>{T.TARGET_CONFIRMATION}</span>
          </label>
          {confirmationError && <p className="mt-2 text-sm text-red-700">{confirmationError}</p>}
        </div>
        <TenantFormField
          label={T.PASSWORD_LABEL}
          htmlFor="reset-password"
          required
          helper={T.PASSWORD_HELPER}
          error={localizedErrors.newPassword}
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
