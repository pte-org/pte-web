"use client";

import type { ReactElement } from "react";
import { ConfirmDialog } from "@pte/ui";
import { CLASS_STATUS_CONFIRM_TEXT } from "../constants/confirmText";

/** Which lifecycle mutation a row is currently confirming. */
export type ClassStatusAction = "activate" | "deactivate" | "suspend" | "archive";

interface ClassStatusConfirmDialogsProps {
  studentClassName: string;
  studentCount: number;
  classLabel: string;
  /** The action whose dialog is open, or `null` when all are closed. */
  action: ClassStatusAction | null;
  isConfirming: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const T = CLASS_STATUS_CONFIRM_TEXT;

/**
 * One dialog per class lifecycle transition, rendered as a sibling of the kebab menu.
 *
 * Kept in its own file because `ClassesSection.tsx` is already at the 300-line
 * ceiling — inlining four `ConfirmDialog` instances there would breach it.
 *
 * `studentCount` is frozen at dialog-open by the caller (passed in as a prop) so the
 * dialog never triggers its own query — per spec §6 stability rule.
 */
export const ClassStatusConfirmDialogs = ({
  studentClassName,
  studentCount,
  classLabel,
  action,
  isConfirming,
  onConfirm,
  onClose,
}: ClassStatusConfirmDialogsProps): ReactElement => (
  <>
    <ConfirmDialog
      open={action === "activate"}
      title={T.activateTitle(classLabel)}
      description={T.activateDescription(classLabel)}
      confirmLabel={T.confirmButton}
      cancelLabel={T.cancel}
      tone="primary"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
    <ConfirmDialog
      open={action === "deactivate"}
      title={T.deactivateTitle(classLabel)}
      description={T.deactivateDescription(classLabel)}
      confirmLabel={T.confirmButton}
      cancelLabel={T.cancel}
      tone="danger"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
    <ConfirmDialog
      open={action === "suspend"}
      title={T.suspendTitle(classLabel)}
      description={T.suspendDescription(classLabel)}
      confirmLabel={T.confirmButton}
      cancelLabel={T.cancel}
      tone="danger"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
    <ConfirmDialog
      open={action === "archive"}
      title={T.archiveTitle(classLabel)}
      description={T.archiveDescription(studentClassName, studentCount)}
      confirmLabel={CLASS_STATUS_CONFIRM_TEXT.confirmButton}
      cancelLabel={T.cancel}
      tone="danger"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  </>
);
