"use client";

import type { ReactElement } from "react";
import { ConfirmDialog } from "@pte/ui";
import { useClassActionText } from "../hooks/useClassActionText";

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
}: ClassStatusConfirmDialogsProps): ReactElement => {
  const T = useClassActionText();
  return (
  <>
    <ConfirmDialog
      open={action === "activate"}
      title={T.format("activateTitle", { label: classLabel })}
      description={T.format("activateDescription", { label: classLabel.toLowerCase() })}
      confirmLabel={T.confirm}
      cancelLabel={T.cancel}
      tone="primary"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
    <ConfirmDialog
      open={action === "deactivate"}
      title={T.format("deactivateTitle", { label: classLabel })}
      description={T.format("deactivateDescription", { label: classLabel.toLowerCase() })}
      confirmLabel={T.confirm}
      cancelLabel={T.cancel}
      tone="danger"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
    <ConfirmDialog
      open={action === "suspend"}
      title={T.format("suspendTitle", { label: classLabel })}
      description={T.format("suspendDescription", { label: classLabel.toLowerCase() })}
      confirmLabel={T.confirm}
      cancelLabel={T.cancel}
      tone="danger"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
    <ConfirmDialog
      open={action === "archive"}
      title={T.format("archiveTitle", { label: classLabel })}
      description={T.format("archiveDescription", { name: studentClassName, count: studentCount })}
      confirmLabel={T.confirm}
      cancelLabel={T.cancel}
      tone="danger"
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  </>
  );
};
