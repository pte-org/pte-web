"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Input, Modal, Select } from "@pte/ui";
import { useClassFlowText } from "../hooks/useClassFlowText";
import { validateClassName } from "../utils/validateClassName";

interface CreateClassModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  error?: string;
  isSubmitting?: boolean;
  classLabel: string;
  /** When provided, the modal renders a Program <Select> above the name field. */
  programs?: { value: string; label: string }[];
  programLabel?: string;
  selectedProgramPublicId?: string;
  onProgramChange?: (programPublicId: string) => void;
}

const FORM_ID = "create-class-form";

export const CreateClassModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
  classLabel,
  programs,
  programLabel,
  selectedProgramPublicId,
  onProgramChange,
}: CreateClassModalProps): ReactElement => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [programError, setProgramError] = useState<string | undefined>();
  const tf = useClassFlowText(classLabel);
  const showPicker = programs !== undefined && programLabel !== undefined && onProgramChange !== undefined;

  const handleNameChange = (value: string): void => {
    setName(value);
    if (nameError !== undefined) setNameError(undefined);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    // The header "+ Create Class" entry point opens this modal with no program
    // pre-selected, so the picker must be validated here. Silently returning
    // (the old behaviour) left the Host staring at a modal that did nothing.
    if (showPicker && !selectedProgramPublicId) {
      setProgramError(tf("programRequired", { program: programLabel.toLowerCase() }));
      return;
    }
    const nameError = validateClassName(name, classLabel, tf("nameRequired"));
    if (nameError) {
      setNameError(nameError);
      return;
    }
    setNameError(undefined);
    setProgramError(undefined);
    onSubmit(name.trim());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tf("createTitle")}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {tf("cancel")}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? tf("createSubmitting") : tf("createSubmit")}
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
        {showPicker && (
          <Select
            label={programLabel}
            options={programs}
            value={selectedProgramPublicId ?? ""}
            error={programError}
            onChange={(event) => {
              setProgramError(undefined);
              onProgramChange(event.target.value);
            }}
          />
        )}
        <Input
          label={tf("createNameLabel")}
          placeholder={tf("createNamePlaceholder")}
          value={name}
          error={nameError}
          onChange={(event) => handleNameChange(event.target.value)}
        />
      </form>
    </Modal>
  );
};
