"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal } from "@aptis/ui";
import {
  CREATE_ORGANIZATION_TEXT,
  EMPTY_CREATE_ORGANIZATION,
  FACILITY_TYPE_OPTIONS,
} from "../constants";
import { validateCreateOrganization } from "../utils/validateCreateOrganization";
import type { CreateOrganizationErrors, CreateOrganizationInput } from "../types";
import { TenantFormField, fieldInputClass } from "./_TenantFormField";

interface CreateOrganizationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateOrganizationInput) => void;
  error?: string;
  isSubmitting?: boolean;
}

const T = CREATE_ORGANIZATION_TEXT;
const FORM_ID = "create-organization-form";

export const CreateOrganizationModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: CreateOrganizationModalProps): ReactElement => {
  const [form, setForm] = useState<CreateOrganizationInput>(EMPTY_CREATE_ORGANIZATION);
  const [errors, setErrors] = useState<CreateOrganizationErrors>({});

  const handleChange = (
    field: keyof CreateOrganizationInput,
    value: string,
  ): void => setForm((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateCreateOrganization(form);
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
            {isSubmitting ? "Adding..." : T.SUBMIT}
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
        <TenantFormField label={T.NAME_LABEL} htmlFor="org-name" required error={errors.name}>
          <input
            id="org-name"
            type="text"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder={T.NAME_PLACEHOLDER}
            className={fieldInputClass(errors.name)}
          />
        </TenantFormField>

        <TenantFormField label={T.FACILITY_TYPE_LABEL} htmlFor="org-facility-type" required error={errors.facilityType}>
          <select
            id="org-facility-type"
            value={form.facilityType}
            onChange={(event) => handleChange("facilityType", event.target.value)}
            className={fieldInputClass(errors.facilityType)}
          >
            <option value="" disabled>
              {T.FACILITY_TYPE_PLACEHOLDER}
            </option>
            {FACILITY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </TenantFormField>

        <TenantFormField label={T.ADDRESS_LABEL} htmlFor="org-address">
          <input
            id="org-address"
            type="text"
            value={form.address}
            onChange={(event) => handleChange("address", event.target.value)}
            placeholder={T.ADDRESS_PLACEHOLDER}
            className={fieldInputClass()}
          />
        </TenantFormField>
      </form>
    </Modal>
  );
};
