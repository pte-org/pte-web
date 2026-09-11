"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Input, Modal } from "@pte/ui";
import { CREATE_CLASS_ERRORS, CREATE_CLASS_TEXT } from "../constants";

interface CreateClassModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  error?: string;
  isSubmitting?: boolean;
  classLabel: string;
}

const FORM_ID = "create-class-form";

export const CreateClassModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
  classLabel,
}: CreateClassModalProps): ReactElement => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const T = CREATE_CLASS_TEXT;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!name.trim()) {
      setNameError(CREATE_CLASS_ERRORS.nameRequired(classLabel));
      return;
    }
    setNameError(undefined);
    onSubmit(name.trim());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.title(classLabel)}
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
            {isSubmitting ? T.submitting : T.submit(classLabel)}
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
          label={T.nameLabel(classLabel)}
          placeholder={T.namePlaceholder}
          value={name}
          error={nameError}
          onChange={(event) => setName(event.target.value)}
        />
      </form>
    </Modal>
  );
};
