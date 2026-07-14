"use client";

import {
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { Alert, BuildingIcon, Modal, UsersIcon } from "@aptis/ui";
import { CREATE_TENANT_TEXT, EMPTY_CREATE_TENANT } from "../constants";
import { validateCreateTenant } from "../utils/validateCreateTenant";
import type { CreateTenantErrors, CreateTenantInput } from "../types";
import { TenantGeneralFields } from "./_TenantGeneralFields";
import { TenantContactFields } from "./_TenantContactFields";

interface CreateTenantModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the validated form values when the user confirms creation. */
  onSubmit: (input: CreateTenantInput) => void;
  error?: string;
  isSubmitting?: boolean;
}

const T = CREATE_TENANT_TEXT;
const FORM_ID = "create-tenant-form";

const SectionHeading = ({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}): ReactElement => (
  <div className="mb-4 flex items-center gap-2 text-blue-700">
    <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
    <h3 className="text-sm font-semibold text-gray-900">{text}</h3>
  </div>
);

export const CreateTenantModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: CreateTenantModalProps): ReactElement => {
  const [form, setForm] = useState<CreateTenantInput>(EMPTY_CREATE_TENANT);
  const [errors, setErrors] = useState<CreateTenantErrors>({});

  const handleChange = (
    field: keyof CreateTenantInput,
    value: string,
  ): void => setForm((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateCreateTenant(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.TITLE}
      size="xl"
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
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-6"
      >
        <section>
          <SectionHeading icon={<BuildingIcon />} text={T.SECTION_GENERAL} />
          <TenantGeneralFields
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        </section>
        <hr className="border-gray-100" />
        <section>
          <SectionHeading icon={<UsersIcon />} text={T.SECTION_CONTACT} />
          <TenantContactFields
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        </section>
      </form>
    </Modal>
  );
};
