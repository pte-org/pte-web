"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, Select } from "@pte/ui";
import type { ProctorRole } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import {
  ASSIGN_PROCTOR_TEXT,
  DEFAULT_PROCTOR_ROLE,
  PROCTOR_ROLE_DESCRIPTIONS,
  PROCTOR_ROLE_OPTIONS,
} from "../constants";
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
  const [selectedProctorId, setSelectedProctorId] = useState("");
  const [role, setRole] = useState<ProctorRole>(DEFAULT_PROCTOR_ROLE);

  const { data: proctors, isLoading: proctorsLoading } = useTenantProctors();
  const assignProctor = useAssignProctor(sessionPublicId);

  const assignedSet = new Set(assignedProctorPublicIds);
  const availableProctors = (proctors ?? []).filter(
    (proctor) => proctor.status === "ACTIVE" && !assignedSet.has(proctor.publicId),
  );
  const submitError = errorMessage(assignProctor.error);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!selectedProctorId) return;
    assignProctor.mutate({ proctorPublicId: selectedProctorId, role }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.TITLE}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.CANCEL}
          </button>
          <button
            type="submit"
            form="assign-proctor-form"
            disabled={assignProctor.isPending || !selectedProctorId}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {assignProctor.isPending ? T.SUBMITTING : T.SUBMIT}
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
          <p className="text-sm text-gray-500">{T.NO_EXISTING}</p>
        ) : (
          <Select
            label={T.EXISTING_LABEL}
            placeholder={T.EXISTING_PLACEHOLDER}
            value={selectedProctorId}
            disabled={proctorsLoading}
            onChange={(event) => setSelectedProctorId(event.target.value)}
            options={availableProctors.map((proctor) => ({
              label: `${proctor.fullName} (${proctor.email})`,
              value: proctor.publicId,
            }))}
          />
        )}

        <Select
          label={T.ROLE_LABEL}
          value={role}
          helperText={PROCTOR_ROLE_DESCRIPTIONS[role]}
          onChange={(event) => setRole(event.target.value as ProctorRole)}
          options={PROCTOR_ROLE_OPTIONS}
        />
      </form>
    </Modal>
  );
};
