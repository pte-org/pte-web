"use client";

import type { ReactElement } from "react";
import { Modal, useLocale } from "@pte/ui";
import { ExamPreviewSurface } from "./ExamPreviewSurface";

interface ExamPreviewModalProps {
  sessionPublicId: string;
  snapshotPublicId: string | null;
  open: boolean;
  onClose: () => void;
}

export const ExamPreviewModal = ({
  sessionPublicId,
  snapshotPublicId,
  open,
  onClose,
}: ExamPreviewModalProps): ReactElement => {
  const { t } = useLocale();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("tenant.examQuestions.title", "Exam questions")}
      size="full"
    >
      <ExamPreviewSurface
        sessionPublicId={sessionPublicId}
        snapshotPublicId={snapshotPublicId}
        enabled={open}
      />
    </Modal>
  );
};
