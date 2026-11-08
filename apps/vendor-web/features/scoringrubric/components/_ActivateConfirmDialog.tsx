"use client";
import type { ReactElement } from "react";
import { ErrorState, LoadingState, Modal } from "@pte/ui";
import type { RubricStatusRequest } from "@pte/api-client";
import { useRubricTaskTypes } from "../api";
import { useVersionDiff } from "../versionApi";
import type { RubricEditText } from "../versionTypes";
import { ActivationAcknowledgement } from "./_ActivationAcknowledgement";

interface ActivateConfirmDialogProps { id: string; pending: boolean; text: RubricEditText; error?: string | null; onClose: () => void; onConfirm: (request: RubricStatusRequest) => void }
export const ActivateConfirmDialog = ({ id, pending, text: T, error, onClose, onConfirm }: ActivateConfirmDialogProps): ReactElement => {
  const diff = useVersionDiff(id, true);
  const active = useRubricTaskTypes();
  return <Modal open title={T.diff} onClose={onClose} size="xl" isDismissDisabled={pending}>
    {(diff.isFetching || active.isLoading) && <LoadingState rows={3} />}{(diff.isError || active.isError) && <ErrorState title={T.error} />}
    {error && <ErrorState title={error} />}
    {diff.data && active.data && <ActivationAcknowledgement key={diff.data.diffDigest} versionId={id} diff={diff.data} activeRubrics={active.data}
      pending={pending || diff.isFetching} text={T} onConfirm={onConfirm} />}
  </Modal>;
};
