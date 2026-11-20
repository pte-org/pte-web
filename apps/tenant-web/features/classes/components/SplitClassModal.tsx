"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, Modal, useToast } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useClassFlowText } from "../hooks/useClassFlowText";
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
  const { showToast } = useToast();
  const tf = useClassFlowText(classLabel);
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

  const handleNameChange = (value: string): void => {
    setNewClassName(value);
    if (nameError !== undefined) setNameError(undefined);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!newClassName.trim()) {
      setNameError(tf("splitNameRequired"));
      return;
    }
    setNameError(undefined);
    split.mutate(
      { newClassName: newClassName.trim(), studentPublicIds: selectedStudentPublicIds },
      {
        onSuccess: (result) => {
          showToast(tf("splitSuccess", { count: result.movedStudentPublicIds.length, className: result.newClass.name }), {
            tone: "success",
          });
          onSplit();
        },
      },
    );
  };

  if (split.isSuccess) {
    return (
      <Modal open={open} onClose={handleClose} title={tf("splitTitle")}>
        <div className="flex flex-col gap-4">
          <Button type="button" onClick={handleClose}>
            {tf("done")}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={tf("splitTitle")}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {tf("cancel")}
          </button>
          <button
            type="submit"
            form="split-class-form"
            disabled={split.isPending}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {split.isPending ? tf("splitSubmitting") : tf("splitSubmit")}
          </button>
        </>
      }
    >
      {submitError && (
        <div className="mb-4">
          <Alert tone="error">{submitError}</Alert>
        </div>
      )}
      <p className="mb-4 text-sm text-gray-600">{tf("splitMovingCount", { count: selectedStudentPublicIds.length })}</p>
      <form id="split-class-form" onSubmit={handleSubmit} noValidate>
        <Input
          label={tf("splitNameLabel")}
          placeholder={tf("splitNamePlaceholder")}
          value={newClassName}
          error={nameError}
          onChange={(event) => handleNameChange(event.target.value)}
        />
      </form>
    </Modal>
  );
};
