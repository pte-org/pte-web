"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, Modal } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { SPLIT_CLASS_ERRORS, SPLIT_CLASS_TEXT } from "../constants";
import { useSplitClass } from "../api";

interface SplitClassModalProps {
  open: boolean;
  onClose: () => void;
  organizationPublicId: string;
  programPublicId: string;
  sourceClassPublicId: string;
  selectedStudentPublicIds: string[];
  classLabel: string;
  /** Called once the split succeeds, so the caller can clear its selection/exit selection mode. */
  onSplit: () => void;
}

const T = SPLIT_CLASS_TEXT;

export const SplitClassModal = ({
  open,
  onClose,
  organizationPublicId,
  programPublicId,
  sourceClassPublicId,
  selectedStudentPublicIds,
  classLabel,
  onSplit,
}: SplitClassModalProps): ReactElement => {
  const [newClassName, setNewClassName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const split = useSplitClass(organizationPublicId, programPublicId, sourceClassPublicId);

  const submitError = errorMessage(split.error);

  const handleClose = (): void => {
    split.reset();
    setNewClassName("");
    setNameError(undefined);
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!newClassName.trim()) {
      setNameError(SPLIT_CLASS_ERRORS.newClassNameRequired(classLabel));
      return;
    }
    setNameError(undefined);
    split.mutate(
      { newClassName: newClassName.trim(), studentPublicIds: selectedStudentPublicIds },
      { onSuccess: onSplit },
    );
  };

  if (split.isSuccess) {
    return (
      <Modal open={open} onClose={handleClose} title={T.title(classLabel)}>
        <div className="flex flex-col gap-4">
          <Alert tone="success">
            {T.successTitle(split.data.movedStudentPublicIds.length, split.data.newClass.name)}
          </Alert>
          <Button type="button" onClick={handleClose}>
            {T.done}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={T.title(classLabel)}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.cancel}
          </button>
          <button
            type="submit"
            form="split-class-form"
            disabled={split.isPending}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {split.isPending ? T.submitting : T.submit}
          </button>
        </>
      }
    >
      {submitError && (
        <div className="mb-4">
          <Alert tone="error">{submitError}</Alert>
        </div>
      )}
      <p className="mb-4 text-sm text-gray-600">{T.movingCount(selectedStudentPublicIds.length)}</p>
      <form id="split-class-form" onSubmit={handleSubmit} noValidate>
        <Input
          label={T.newClassNameLabel(classLabel)}
          placeholder={T.newClassNamePlaceholder}
          value={newClassName}
          error={nameError}
          onChange={(event) => setNewClassName(event.target.value)}
        />
      </form>
    </Modal>
  );
};
