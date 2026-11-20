"use client";

import type { ReactElement, ReactNode } from "react";
import { useLocale } from "../i18n";
import { ConfirmDialog } from "./ConfirmDialog";

export interface UnsavedChangesDialogProps {
  open: boolean;
  /** Saves, then leaves once the save succeeds. */
  onSaveAndLeave: () => void;
  /** Throws the changes away and leaves. */
  onLeave: () => void;
  /** The close (x) button: keep editing. */
  onStay: () => void;
  isSaving?: boolean;
  /** Copy defaults to the shared bilingual "unsaved changes" wording. */
  title?: string;
  description?: ReactNode;
}

/** The one "unsaved changes" popup: Save and leave / Leave without saving, and the x keeps editing. */
export const UnsavedChangesDialog = ({
  open,
  onSaveAndLeave,
  onLeave,
  onStay,
  isSaving = false,
  title,
  description,
}: UnsavedChangesDialogProps): ReactElement => {
  const { t } = useLocale();
  return (
    <ConfirmDialog
      open={open}
      tone="warning"
      title={title ?? t("common.unsaved.title", "Unsaved changes")}
      description={description ?? t("common.unsaved.description", "You have unsaved changes. Save them before you leave?")}
      confirmLabel={t("common.unsaved.saveAndLeave", "Save and leave")}
      cancelLabel={t("common.unsaved.leave", "Leave without saving")}
      isConfirming={isSaving}
      onConfirm={onSaveAndLeave}
      onCancel={() => { if (!isSaving) onLeave(); }}
      onClose={onStay}
    />
  );
};
