"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { AudienceSourceRequest } from "@pte/api-client";
import { Alert, Button, Modal, useLocale } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useEnrollExistingStudents, useSessionRoster } from "@/features/examoperations/api";
import { SESSION_DETAIL_TEXT } from "../constants";
import { useAudienceStudentPicker } from "../hooks/useAudienceStudentPicker";
import { useCreateExamWizardText } from "../hooks/useCreateExamWizardText";
import { fillTemplate } from "../utils/fillTemplate";
import { AudienceStudentPicker } from "./create-exam/AudienceStudentPicker";

interface AddExamStudentsModalProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
}

const T = SESSION_DETAIL_TEXT;

export const AddExamStudentsModal = ({
  open,
  onClose,
  sessionPublicId,
}: AddExamStudentsModalProps): ReactElement => {
  const { t } = useLocale();
  const wizardText = useCreateExamWizardText();
  const [sources, setSources] = useState<AudienceSourceRequest[]>([]);
  const { data: sessionRoster } = useSessionRoster(sessionPublicId, open);
  const enroll = useEnrollExistingStudents(sessionPublicId);
  const enrolledStudentIds = useMemo(
    () => new Set((sessionRoster ?? []).map((entry) => entry.student.publicId)),
    [sessionRoster],
  );
  const picker = useAudienceStudentPicker({
    open,
    sources,
    onSourcesChange: setSources,
    excludedStudentIds: enrolledStudentIds,
  });
  const selectedCount = picker.selectedIds.size;
  const enrollError = errorMessage(enroll.error);

  const handleClose = (): void => {
    enroll.reset();
    setSources([]);
    onClose();
  };

  const handleSubmit = (): void => {
    if (selectedCount === 0) return;
    enroll.mutate([...picker.selectedIds], { onSuccess: handleClose });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("tenant.participants.addStudents", T.ADD_EXISTING_STUDENTS)}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t("tenant.participants.addCancel", T.ADD_STUDENTS_CANCEL)}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedCount === 0}
            isLoading={enroll.isPending}
            loadingText={t("tenant.participants.addSubmitting", T.ADD_STUDENTS_SUBMITTING)}
          >
            {t("tenant.participants.addSubmit", T.ADD_STUDENTS_SUBMIT)}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {enrollError && <Alert tone="error">{enrollError}</Alert>}
        <div>
          <AudienceStudentPicker wizardText={wizardText} {...picker} />
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
