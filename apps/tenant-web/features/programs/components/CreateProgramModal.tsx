"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Input, Modal } from "@pte/ui";
import { CREATE_PROGRAM_ERRORS, CREATE_PROGRAM_TEXT, EMPTY_CREATE_PROGRAM } from "../constants";
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
  const [submitted, setSubmitted] = useState(false);
  const T = CREATE_PROGRAM_TEXT;

  const handleChange = (field: keyof CreateProgramInput, value: string): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    // Drop this field's stored error as soon as the Host edits it. Without
    // this, an error raised by a failed submit stays pinned to a field the
    // user has since corrected, and the form shows red on a valid value.
    // Keyed on the error type, not the input type: `description` never errors.
    setErrors((previous) => {
      const key = field as keyof CreateProgramErrors;
      return previous[key] === undefined ? previous : { ...previous, [key]: undefined };
    });
  };

  // Derived rather than stored: moving `startDate` past an already-entered `endDate`
  // must surface the error immediately (spec P5) without a submit round-trip. Derived
  // state also keeps this out of an effect, which the repo's `set-state-in-effect` lint
  // rule rejects. Only shown once the Host has attempted a submit, so the form doesn't
  // greet them with an error before they have touched anything.
  const dateError: string | undefined =
    form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)
      ? CREATE_PROGRAM_ERRORS.endDateBeforeStartDate
      : undefined;
  const shownErrors: CreateProgramErrors = {
    ...(submitted ? errors : {}),
    ...(dateError ? { endDate: dateError } : {}),
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateCreateProgram(form, programLabel);
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.title}
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
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? T.submitting : T.submit}
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
          placeholder={T.namePlaceholder(programLabel)}
          value={form.name}
          error={shownErrors.name}
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
          error={shownErrors.startDate}
          onChange={(event) => handleChange("startDate", event.target.value)}
        />
        <Input
          type="date"
          label={T.endDateLabel}
          value={form.endDate}
          error={shownErrors.endDate}
          min={form.startDate || undefined}
          onChange={(event) => handleChange("endDate", event.target.value)}
        />
      </form>
    </Modal>
  );
};
