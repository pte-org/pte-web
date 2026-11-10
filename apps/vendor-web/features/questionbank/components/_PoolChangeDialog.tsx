"use client";

import type { ReactElement } from "react";
import { ConfirmDialog } from "@pte/ui";
import type { QuestionPool } from "@pte/api-client";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { POOL_CHANGE_TEXT as RAW_POOL_CHANGE_TEXT } from "../constants";

interface PoolChangeDialogProps {
  open: boolean;
  targetPool: QuestionPool;
  previouslyPublished: boolean;
  isConfirming: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Warns before a draft moves between Official and Practice, where exam content can leak. */
export const PoolChangeDialog = ({
  open,
  targetPool,
  previouslyPublished,
  isConfirming,
  onConfirm,
  onClose,
}: PoolChangeDialogProps): ReactElement => {
  const T = useAdminCopy(RAW_POOL_CHANGE_TEXT);
  const toPractice = targetPool === "PRACTICE";
  return (
    <ConfirmDialog
      open={open}
      tone="warning"
      title={toPractice ? T.TO_PRACTICE_TITLE : T.TO_OFFICIAL_TITLE}
      description={
        <div className="flex flex-col gap-2">
          <p>{toPractice ? T.TO_PRACTICE_BODY : T.TO_OFFICIAL_BODY}</p>
          {toPractice && previouslyPublished && (
            <p className="font-medium text-[var(--cream-action)]">{T.TO_PRACTICE_RISK}</p>
          )}
        </div>
      }
      confirmLabel={T.CONFIRM}
      cancelLabel={T.CANCEL}
      isConfirming={isConfirming}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};
