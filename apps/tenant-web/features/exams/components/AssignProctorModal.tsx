"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, Select, useLocale } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { ASSIGN_PROCTOR_TEXT } from "../constants";
import { useAssignProctor, useTenantProctors } from "../api";

interface AssignProctorModalProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
  /** Proctors already assigned to this session - excluded from the list. */
  assignedProctorPublicIds: string[];
}

const T = ASSIGN_PROCTOR_TEXT;

export const AssignProctorModal = ({
  open,
  onClose,
  sessionPublicId,
  assignedProctorPublicIds,
}: AssignProctorModalProps): ReactElement => {
  const { t } = useLocale();
  const [selectedProctorId, setSelectedProctorId] = useState("");

  const { data: proctors, isLoading: proctorsLoading } = useTenantProctors();
  const assignProctor = useAssignProctor(sessionPublicId);

  const assignedSet = new Set(assignedProctorPublicIds);
  const availableProctors = (proctors ?? []).filter(
    (proctor) => proctor.status === "ACTIVE" && !assignedSet.has(proctor.publicId),
  );
  const submitError = errorMessage(assignProctor.error);
  const text = {
    title: t("tenant.proctor.assignTitle", T.TITLE),
    cancel: t("tenant.proctor.cancel", T.CANCEL),
    submit: t("tenant.proctor.submit", T.SUBMIT),
    submitting: t("tenant.proctor.submitting", T.SUBMITTING),
    noExisting: t("tenant.proctor.noExisting", T.NO_EXISTING),
    existing: t("tenant.proctor.existing", T.EXISTING_LABEL),
    select: t("tenant.proctor.select", T.EXISTING_PLACEHOLDER),
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!selectedProctorId) return;
    assignProctor.mutate({ proctorPublicId: selectedProctorId }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={text.title}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--shell-border)] px-4 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]"
          >
            {text.cancel}
          </button>
          <button
            type="submit"
            form="assign-proctor-form"
            disabled={assignProctor.isPending || !selectedProctorId}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {assignProctor.isPending ? text.submitting : text.submit}
          </button>
        </>
      }
    >
      {submitError && (
        <div className="mb-4">
          <Alert tone="error">{submitError}</Alert>
        </div>
      )}

      <form
        id="assign-proctor-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {availableProctors.length === 0 && !proctorsLoading ? (
          <p className="text-sm text-[var(--ink-secondary)]">{text.noExisting}</p>
        ) : (
          <Select
            label={text.existing}
            placeholder={text.select}
            value={selectedProctorId}
            disabled={proctorsLoading}
            onChange={(event) => setSelectedProctorId(event.target.value)}
            options={availableProctors.map((proctor) => ({
              label: `${proctor.fullName} (${proctor.email})`,
              value: proctor.publicId,
            }))}
          />
        )}
      </form>
    </Modal>
  );
};
