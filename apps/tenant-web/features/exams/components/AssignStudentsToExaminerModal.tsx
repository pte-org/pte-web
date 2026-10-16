"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { AudienceSourceRequest } from "@pte/api-client";
import { Button, Modal } from "@pte/ui";
import { useSessionRoster } from "@/features/examoperations/api";
import { useAudienceStudentPicker } from "../hooks/useAudienceStudentPicker";
import { useCreateExamWizardText } from "../hooks/useCreateExamWizardText";
import { fillTemplate } from "../utils/fillTemplate";
import { AudienceStudentPicker } from "./create-exam/AudienceStudentPicker";

export interface PickedStudent {
  publicId: string;
  fullName: string;
}

export interface AssignStudentsLabels {
  hint: string;
  add: string;
  cancel: string;
}

interface AssignStudentsToExaminerModalProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
  title: string;
  labels: AssignStudentsLabels;
  /** Students already placed in the assignment, hidden so nobody gets two Examiners. */
  excludedStudentIds: ReadonlySet<string>;
  onAdd: (students: PickedStudent[]) => void;
}

/** Pick enrolled students with program/class filters; the caller decides which Examiner they go to. */
export const AssignStudentsToExaminerModal = ({
  open,
  onClose,
  sessionPublicId,
  title,
  labels,
  excludedStudentIds,
  onAdd,
}: AssignStudentsToExaminerModalProps): ReactElement => {
  const wizardText = useCreateExamWizardText();
  const [sources, setSources] = useState<AudienceSourceRequest[]>([]);
  const { data: roster, isLoading: rosterLoading } = useSessionRoster(sessionPublicId, open);
  const enrolled = useMemo(
    () =>
      new Map(
        (roster ?? []).map(
          ({ student }) =>
            [student.publicId, student.fullName?.trim() || student.email || student.username] as const,
        ),
      ),
    [roster],
  );
  const allowedStudentIds = useMemo(() => new Set(enrolled.keys()), [enrolled]);
  const picker = useAudienceStudentPicker({
    open,
    sources,
    onSourcesChange: setSources,
    excludedStudentIds,
    allowedStudentIds,
  });
  const selectedCount = picker.selectedIds.size;

  const handleClose = (): void => {
    setSources([]);
    onClose();
  };

  const handleAdd = (): void => {
    if (selectedCount === 0) return;
    onAdd(
      [...picker.selectedIds].map((publicId) => ({
        publicId,
        fullName: enrolled.get(publicId) ?? publicId,
      })),
    );
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {labels.cancel}
          </Button>
          <Button type="button" onClick={handleAdd} disabled={selectedCount === 0}>
            {labels.add}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--ink-secondary)]">{labels.hint}</p>
        <div>
          <AudienceStudentPicker
            wizardText={wizardText}
            {...picker}
            loading={picker.loading || rosterLoading}
          />
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--ink-primary)]">
            {selectedCount === 0
              ? wizardText.NO_SOURCES
              : fillTemplate(wizardText.SELECTED_TOTAL, { count: selectedCount })}
          </span>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={picker.clearSelection}
              className="text-[var(--blush-action)] hover:underline"
            >
              {wizardText.CLEAR_SELECTION}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
