"use client";
import type { ReactElement } from "react";
import { ErrorState, LoadingState, Modal } from "@pte/ui";
import type { RubricStatusRequest } from "@pte/api-client";
import { useVersionDiff } from "../versionApi";
import type { RubricEditText } from "../versionTypes";
import { ActivationAcknowledgement } from "./_ActivationAcknowledgement";

interface ActivateConfirmDialogProps { id: string; pending: boolean; text: RubricEditText; error?: string | null; onClose: () => void; onConfirm: (request: RubricStatusRequest) => void }
export const ActivateConfirmDialog = ({ id, pending, text: T, error, onClose, onConfirm }: ActivateConfirmDialogProps): ReactElement => {
  const diff = useVersionDiff(id, true);
  return <Modal open title={T.diff} onClose={onClose} size="xl" isDismissDisabled={pending}>
    {diff.isFetching && <LoadingState rows={3} />}{diff.isError && <ErrorState title={T.error} />}
    {error && <ErrorState title={error} />}
    {diff.data && <ActivationAcknowledgement key={diff.data.diffDigest} diff={diff.data} pending={pending || diff.isFetching} text={T} onConfirm={onConfirm} />}
  </Modal>;
};
