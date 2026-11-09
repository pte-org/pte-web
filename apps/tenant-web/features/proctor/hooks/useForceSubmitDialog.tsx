"use client";

import { useState, type ReactElement } from "react";
import type { AttendanceRowResponse } from "@pte/api-client";
import { useForceSubmitMutation } from "../api";
import { ForceSubmitDialog } from "../components/ForceSubmitDialog";
import { PROCTOR_FORCE_SUBMIT_TEXT } from "../constants";

interface ForceSubmitDialogControl {
  /** Opens the confirmation for a roster row whose attempt is in progress. */
  request: (row: AttendanceRowResponse) => void;
  dialog: ReactElement;
}

export function useForceSubmitDialog(sessionPublicId: string): ForceSubmitDialogControl {
  const [target, setTarget] = useState<AttendanceRowResponse | null>(null);
  const mutation = useForceSubmitMutation(sessionPublicId);

  const close = (): void => {
    mutation.reset();
    setTarget(null);
  };

  const confirm = (): void => {
    if (!target?.latestAttemptPublicId) return;
    mutation.mutate(target.latestAttemptPublicId, { onSuccess: () => setTarget(null) });
  };

  return {
    request: setTarget,
    dialog: (
      <ForceSubmitDialog
        studentName={target ? target.displayName || target.studentPublicId : null}
        isLoading={mutation.isPending}
        errorMessage={mutation.isError ? PROCTOR_FORCE_SUBMIT_TEXT.ERROR : null}
        onClose={close}
        onConfirm={confirm}
      />
    ),
  };
}
