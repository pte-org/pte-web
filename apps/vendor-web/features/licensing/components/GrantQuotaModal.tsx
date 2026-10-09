"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, Select } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { PLAN_SELECT_OPTIONS as RAW_PLAN_SELECT_OPTIONS } from "../../tenancy/constants";
import { TenantFormField, fieldInputClass } from "../../tenancy/components/_TenantFormField";
import {
  EMPTY_GRANT_QUOTA,
  GRANT_QUOTA_ERRORS as RAW_GRANT_QUOTA_ERRORS,
  GRANT_QUOTA_TEXT as RAW_GRANT_QUOTA_TEXT,
} from "../constants";
import type { GrantQuotaErrors, GrantQuotaInput } from "../types";

interface GrantQuotaModalProps {
  open: boolean;
  tenantName?: string;
  onClose: () => void;
  onSubmit: (input: GrantQuotaInput) => void;
  error?: string;
  isSubmitting?: boolean;
}

const FORM_ID = "grant-quota-form";
const AMOUNT_PATTERN = /^[1-9]\d*$/;

export const GrantQuotaModal = ({
  open,
  tenantName,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: GrantQuotaModalProps): ReactElement => {
  const T = useAdminCopy(RAW_GRANT_QUOTA_TEXT);
  const E = useAdminCopy(RAW_GRANT_QUOTA_ERRORS);
  const planOptions = useAdminCopy(RAW_PLAN_SELECT_OPTIONS);
  const grantingLabel = useAdminCopy("Granting...");
  const [form, setForm] = useState<GrantQuotaInput>(EMPTY_GRANT_QUOTA);
  const [errors, setErrors] = useState<GrantQuotaErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors: GrantQuotaErrors = {};
    if (!form.packageName) nextErrors.packageName = E.REQUIRED;
    if (!form.amount.trim()) {
      nextErrors.amount = E.REQUIRED;
    } else if (!AMOUNT_PATTERN.test(form.amount.trim())) {
      nextErrors.amount = E.AMOUNT_INVALID;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tenantName ? `${T.TITLE} — ${tenantName}` : T.TITLE}
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
            {isSubmitting ? grantingLabel : T.SUBMIT}
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
          label={T.PACKAGE_LABEL}
          htmlFor="grant-package"
          required
          error={errors.packageName}
        >
          <Select
            id="grant-package"
            value={form.packageName}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                packageName: event.target.value as GrantQuotaInput["packageName"],
              }))
            }
            placeholder={T.PACKAGE_PLACEHOLDER}
            options={planOptions}
            className={errors.packageName ? "!border-red-300 !bg-red-50/40" : undefined}
          />
        </TenantFormField>

        <TenantFormField
          label={T.AMOUNT_LABEL}
          htmlFor="grant-amount"
          required
          helper={T.AMOUNT_HELPER}
          error={errors.amount}
        >
          <input
            id="grant-amount"
            type="number"
            min="1"
            value={form.amount}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, amount: event.target.value }))
            }
            placeholder={T.AMOUNT_PLACEHOLDER}
            className={fieldInputClass(errors.amount)}
          />
        </TenantFormField>

        <TenantFormField label={T.NOTE_LABEL} htmlFor="grant-note">
          <textarea
            id="grant-note"
            value={form.note}
            onChange={(event) => setForm((previous) => ({ ...previous, note: event.target.value }))}
            placeholder={T.NOTE_PLACEHOLDER}
            rows={3}
            className={fieldInputClass()}
          />
        </TenantFormField>
      </form>
    </Modal>
  );
};
