"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Input, Modal, Select } from "@pte/ui";
import { CREATE_SESSION_TEXT, EMPTY_CREATE_SESSION } from "../constants";
import { validateCreateSession } from "../utils/validateCreateSession";
import { useBlueprints } from "../api";
import type { CreateSessionErrors, CreateSessionInput } from "../types";

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSessionInput) => void;
  error?: string;
  isSubmitting?: boolean;
}

const T = CREATE_SESSION_TEXT;
const FORM_ID = "create-session-form";

export const CreateSessionModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: CreateSessionModalProps): ReactElement => {
  const [form, setForm] = useState<CreateSessionInput>(EMPTY_CREATE_SESSION);
  const [errors, setErrors] = useState<CreateSessionErrors>({});
  const { data: blueprints, isLoading: blueprintsLoading } = useBlueprints();

  const handleChange = (field: keyof CreateSessionInput, value: string): void =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateCreateSession(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
  };

  const blueprintOptions = (blueprints ?? []).map((blueprint) => ({
    label: blueprint.name,
    value: blueprint.id,
  }));

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
      {!blueprintsLoading && blueprintOptions.length === 0 && (
        <div className="mb-4">
          <Alert tone="warning">{T.NO_BLUEPRINTS}</Alert>
        </div>
      )}
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={T.NAME_LABEL}
          placeholder={T.NAME_PLACEHOLDER}
          value={form.name}
          error={errors.name}
          onChange={(event) => handleChange("name", event.target.value)}
        />
        <Select
          label={T.BLUEPRINT_LABEL}
          placeholder={T.BLUEPRINT_PLACEHOLDER}
          options={blueprintOptions}
          value={form.blueprintPublicId}
          error={errors.blueprintPublicId}
          disabled={blueprintsLoading}
          onChange={(event) => handleChange("blueprintPublicId", event.target.value)}
        />
        <Input
          type="datetime-local"
          label={T.OPENS_AT_LABEL}
          value={form.opensAt}
          error={errors.opensAt}
          onChange={(event) => handleChange("opensAt", event.target.value)}
        />
        <Input
          type="datetime-local"
          label={T.CLOSES_AT_LABEL}
          value={form.closesAt}
          error={errors.closesAt}
          onChange={(event) => handleChange("closesAt", event.target.value)}
        />
      </form>
    </Modal>
  );
};
