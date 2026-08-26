"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal } from "@pte/ui";
import { CREATE_LOGIN_ACCOUNT_TEXT, EMPTY_CREATE_LOGIN_ACCOUNT } from "../constants";
import { validateCreateLoginAccount } from "../utils/validateCreateLoginAccount";
import type { CreateLoginAccountErrors, CreateLoginAccountInput } from "../types";
import { TenantFormField, fieldInputClass } from "./_TenantFormField";

interface CreateLoginAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateLoginAccountInput) => void;
  error?: string;
  isSubmitting?: boolean;
}

const T = CREATE_LOGIN_ACCOUNT_TEXT;
const FORM_ID = "create-login-account-form";

export const CreateLoginAccountModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: CreateLoginAccountModalProps): ReactElement => {
  const [form, setForm] = useState<CreateLoginAccountInput>(EMPTY_CREATE_LOGIN_ACCOUNT);
  const [errors, setErrors] = useState<CreateLoginAccountErrors>({});

  const handleChange = (
    field: keyof CreateLoginAccountInput,
    value: string,
  ): void => setForm((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateCreateLoginAccount(form);
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
            {isSubmitting ? "Creating..." : T.SUBMIT}
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
        <TenantFormField label={T.EMAIL_LABEL} htmlFor="login-email" required error={errors.email}>
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder={T.EMAIL_PLACEHOLDER}
            className={fieldInputClass(errors.email)}
          />
        </TenantFormField>

        <TenantFormField label={T.FULL_NAME_LABEL} htmlFor="login-full-name" required error={errors.fullName}>
          <input
            id="login-full-name"
            type="text"
            value={form.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            placeholder={T.FULL_NAME_PLACEHOLDER}
            className={fieldInputClass(errors.fullName)}
          />
        </TenantFormField>

        <TenantFormField
          label={T.PASSWORD_LABEL}
          htmlFor="login-password"
          required
          helper={T.PASSWORD_HELPER}
          error={errors.password}
        >
          <input
            id="login-password"
            type="password"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            className={fieldInputClass(errors.password)}
          />
        </TenantFormField>
      </form>
    </Modal>
  );
};
