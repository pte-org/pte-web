"use client";

import { useState, type ReactElement } from "react";
import { ConfirmDialog, useLocale } from "@pte/ui";
import { EXAM_EDITOR_TEXT } from "../constants";
import type { ExamSession } from "../types";
import { ExamInformationPanel } from "./ExamInformationPanel";

export interface ExamOverviewLifecycle {
  lifecycleError: string | undefined;
  onOpen: () => void;
  onClose: () => void;
  onCancel: () => void;
  canOpen: boolean;
  canClose: boolean;
  canCancel: boolean;
  openPending: boolean;
  closePending: boolean;
  cancelPending: boolean;
}

interface ExamOverviewTabProps {
  session: ExamSession;
  lifecycle: ExamOverviewLifecycle;
}

export const ExamOverviewTab = ({ session, lifecycle }: ExamOverviewTabProps): ReactElement => {
  const { t } = useLocale();
  const [editing, setEditing] = useState(false);
  const [confirmStartSoon, setConfirmStartSoon] = useState(false);

  const requestEdit = (): void => {
    const remaining = new Date(session.opensAt).getTime() - Date.now();
    if (session.status === "SCHEDULED" && remaining > 0 && remaining <= 10 * 60 * 1000) {
      setConfirmStartSoon(true);
      return;
    }
    setEditing(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <ExamInformationPanel
        session={session}
        lifecycle={lifecycle}
        editing={editing}
        onEdit={requestEdit}
        onCancelEdit={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
      <ConfirmDialog
        open={confirmStartSoon}
        tone="warning"
        title={t("tenant.examDetails.startSoonTitle", EXAM_EDITOR_TEXT.START_SOON_TITLE)}
        description={t(
          "tenant.examDetails.startSoonDescription",
          EXAM_EDITOR_TEXT.START_SOON_DESCRIPTION,
        )}
        confirmLabel={t("tenant.examDetails.startSoonConfirm", EXAM_EDITOR_TEXT.START_SOON_CONFIRM)}
        cancelLabel={t("tenant.examDetails.startSoonCancel", EXAM_EDITOR_TEXT.START_SOON_CANCEL)}
        onConfirm={() => {
          setConfirmStartSoon(false);
          setEditing(true);
        }}
        onClose={() => setConfirmStartSoon(false)}
      />
    </div>
  );
};
