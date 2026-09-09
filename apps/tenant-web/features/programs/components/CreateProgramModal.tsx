"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Input, Modal } from "@pte/ui";
import { CREATE_PROGRAM_TEXT, EMPTY_CREATE_PROGRAM } from "../constants";
import { validateCreateProgram } from "../utils/validateCreateProgram";
import type { CreateProgramErrors, CreateProgramInput } from "../types";

interface CreateProgramModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProgramInput) => void;
  error?: string;
  isSubmitting?: boolean;
  programLabel: string;
}

const FORM_ID = "create-program-form";

export const CreateProgramModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
  programLabel,
}: CreateProgramModalProps): ReactElement => {
  const [form, setForm] = useState<CreateProgramInput>(EMPTY_CREATE_PROGRAM);
  const [errors, setErrors] = useState<CreateProgramErrors>({});
  const T = CREATE_PROGRAM_TEXT;

  const handleChange = (field: keyof CreateProgramInput, value: string): void =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateCreateProgram(form, programLabel);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.title(programLabel)}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.cancel}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? T.submitting : T.submit(programLabel)}
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
        <Input
          label={T.nameLabel(programLabel)}
          placeholder={T.namePlaceholder}
          value={form.name}
          error={errors.name}
          onChange={(event) => handleChange("name", event.target.value)}
        />
        <Input
          label={T.descriptionLabel}
          value={form.description}
          onChange={(event) => handleChange("description", event.target.value)}
        />
        <Input
          type="date"
          label={T.startDateLabel}
          value={form.startDate}
          onChange={(event) => handleChange("startDate", event.target.value)}
        />
        <Input
          type="date"
          label={T.endDateLabel}
          value={form.endDate}
          onChange={(event) => handleChange("endDate", event.target.value)}
        />
      </form>
    </Modal>
  );
};
