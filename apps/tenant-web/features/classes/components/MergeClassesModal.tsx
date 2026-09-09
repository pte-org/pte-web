"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Modal } from "@pte/ui";
import type { ClassResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { MERGE_CLASSES_TEXT } from "../constants";
import { useMergeClasses } from "../api";

interface MergeClassesModalProps {
  open: boolean;
  onClose: () => void;
  organizationPublicId: string;
  programPublicId: string;
  /** The classes the Host checked in the selection-mode table — at least 2. */
  selectedClasses: ClassResponse[];
  classLabel: string;
  /** Called once the merge succeeds, so the caller can clear its selection/exit selection mode. */
  onMerged: () => void;
}

const T = MERGE_CLASSES_TEXT;

export const MergeClassesModal = ({
  open,
  onClose,
  organizationPublicId,
  programPublicId,
  selectedClasses,
  classLabel,
  onMerged,
}: MergeClassesModalProps): ReactElement => {
  const [targetClassPublicId, setTargetClassPublicId] = useState(selectedClasses[0]?.publicId ?? "");
  const merge = useMergeClasses(organizationPublicId, programPublicId, targetClassPublicId);

  const sourceClasses = selectedClasses.filter((studentClass) => studentClass.publicId !== targetClassPublicId);
  const submitError = errorMessage(merge.error);

  const handleClose = (): void => {
    merge.reset();
    onClose();
  };

  const handleSubmit = (): void => {
    merge.mutate(
      sourceClasses.map((studentClass) => studentClass.publicId),
      { onSuccess: onMerged },
    );
  };

  if (merge.isSuccess) {
    return (
      <Modal open={open} onClose={handleClose} title={T.title(classLabel)}>
        <div className="flex flex-col gap-4">
          <Alert tone="success">{T.successTitle(merge.data.movedStudentPublicIds.length)}</Alert>
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
            type="button"
            onClick={handleSubmit}
            disabled={merge.isPending || sourceClasses.length === 0}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {merge.isPending ? T.submitting : T.submit}
          </button>
        </>
      }
    >
      {submitError && (
        <div className="mb-4">
          <Alert tone="error">{submitError}</Alert>
        </div>
      )}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-gray-700">{T.destinationLabel(classLabel)}</legend>
        {selectedClasses.map((studentClass) => (
          <label key={studentClass.publicId} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="merge-target"
              value={studentClass.publicId}
              checked={targetClassPublicId === studentClass.publicId}
              onChange={() => setTargetClassPublicId(studentClass.publicId)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {studentClass.name}
          </label>
        ))}
      </fieldset>
      <p className="mt-4 text-sm text-gray-500">{T.sourcesLabel(classLabel)}</p>
    </Modal>
  );
};
