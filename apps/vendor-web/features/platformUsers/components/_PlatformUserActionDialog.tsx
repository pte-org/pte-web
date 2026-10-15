"use client";

import { Alert, ConfirmDialog } from "@pte/ui";
import {
  getUserFacingApiErrorMessage,
  type UserResponse,
} from "@pte/api-client";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { PLATFORM_USER_TEXT as RAW_PLATFORM_USER_TEXT } from "../constants";
import type { PlatformUserAction } from "../types";

export type { PlatformUserAction } from "../types";

type ActionDialogProps = {
  action: PlatformUserAction | null;
  target: UserResponse | null;
  error: unknown;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const PlatformUserActionDialog = ({
  action,
  target,
  error,
  isPending,
  onConfirm,
  onClose,
}: ActionDialogProps) => {
  const T = useAdminCopy(RAW_PLATFORM_USER_TEXT);
  const open = action !== null && target !== null;
  const isDanger = action === "suspend" || action === "archive";
  const title =
    action === "reset"
      ? T.RESET_PASSWORD_TITLE
      : action === "archive"
        ? T.ARCHIVE
        : action === "restore"
          ? T.RESTORE
          : action === "reactivate"
            ? T.REACTIVATE
            : T.SUSPEND;
  const confirmLabel =
    action === "reset"
      ? T.RESET_PASSWORD
      : action === "archive"
        ? T.ARCHIVE
        : action === "restore"
          ? T.RESTORE
          : action === "reactivate"
            ? T.REACTIVATE
            : T.SUSPEND;
  const description =
    action === "reset"
      ? T.RESET_PASSWORD_CONFIRM
      : action === "archive"
        ? T.ARCHIVE_CONFIRM
        : action === "restore"
          ? T.RESTORE_CONFIRM
          : action === "reactivate"
            ? T.REACTIVATE_CONFIRM
            : T.SUSPEND_CONFIRM;

  return (
    <ConfirmDialog
      open={open}
      title={title}
      description={
        <div className="space-y-3">
          {Boolean(error) && (
            <Alert tone="error">{getUserFacingApiErrorMessage(error, T.FORM_ERROR)}</Alert>
          )}
          <p>{description}</p>
          {target?.email && <p className="font-medium text-[var(--ink-primary)]">{target.email}</p>}
        </div>
      }
      confirmLabel={confirmLabel}
      cancelLabel={T.CANCEL}
      tone={isDanger ? "danger" : "primary"}
      isConfirming={isPending}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};
