"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Input, Modal, PasswordInput, Select, cn } from "@pte/ui";
import { ASSIGN_PROCTOR_TEXT, EMPTY_CREATE_PROCTOR } from "../constants";
import { validateCreateProctor } from "../utils/validateCreateProctor";
import { useAssignProctor, useCreateProctorAccount, useTenantProctors } from "../api";
import type { CreateProctorErrors, CreateProctorInput } from "../types";

interface AssignProctorModalProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
  /** Proctors already assigned to this session — excluded from the "pick existing" list. */
  assignedProctorPublicIds: string[];
}

const T = ASSIGN_PROCTOR_TEXT;

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

const TAB_CLASS = (active: boolean): string =>
  cn(
    "rounded-md px-3 py-1.5 text-sm font-medium",
    active ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100",
  );

export const AssignProctorModal = ({
  open,
  onClose,
  sessionPublicId,
  assignedProctorPublicIds,
}: AssignProctorModalProps): ReactElement => {
  const [tab, setTab] = useState<"existing" | "new">("existing");
  const [selectedProctorId, setSelectedProctorId] = useState("");
  const [form, setForm] = useState<CreateProctorInput>(EMPTY_CREATE_PROCTOR);
  const [errors, setErrors] = useState<CreateProctorErrors>({});

  const { data: proctors, isLoading: proctorsLoading } = useTenantProctors();
  const assignProctor = useAssignProctor(sessionPublicId);
  const createProctor = useCreateProctorAccount();

  const assignedSet = new Set(assignedProctorPublicIds);
  const availableProctors = (proctors ?? []).filter((proctor) => !assignedSet.has(proctor.publicId));

  const isSubmitting = assignProctor.isPending || createProctor.isPending;
  const submitError = errorMessage(assignProctor.error) ?? errorMessage(createProctor.error);

  const handleChange = (field: keyof CreateProctorInput, value: string): void =>
    setForm((previous) => ({ ...previous, [field]: value }));

  // Switching tabs abandons whichever attempt was in progress on the other
  // one — clear its error/pending state so it can't be misread as the new
  // tab's own result (quality-gate QUAL-102).
  const handleTabChange = (next: "existing" | "new"): void => {
    assignProctor.reset();
    createProctor.reset();
    setTab(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (tab === "existing") {
      if (!selectedProctorId) return;
      assignProctor.mutate(selectedProctorId, { onSuccess: onClose });
      return;
    }

    const nextErrors = validateCreateProctor(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createProctor.mutate(form, {
      onSuccess: (proctor) => {
        assignProctor.mutate(proctor.publicId, {
          onSuccess: onClose,
          // The account now exists even though assigning it failed — a
          // plain retry would resubmit the same email and hit an
          // already-exists conflict instead of the real problem
          // (quality-gate QUAL-103). Route the Host to "pick existing",
          // pre-selected on the account that was just created, so
          // resubmitting assigns it instead of re-attempting creation.
          onError: () => {
            setTab("existing");
            setSelectedProctorId(proctor.publicId);
          },
        });
      },
    });
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
            disabled={isSubmitting || (tab === "existing" && !selectedProctorId)}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? T.SUBMITTING : T.SUBMIT}
          </button>
        </>
      }
    >
      {submitError && (
        <div className="mb-4">
          <Alert tone="error">{submitError}</Alert>
        </div>
      )}

      <div className="mb-4 flex gap-2 rounded-lg bg-gray-50 p-1">
        <button type="button" className={TAB_CLASS(tab === "existing")} onClick={() => handleTabChange("existing")}>
          {T.TAB_EXISTING}
        </button>
        <button type="button" className={TAB_CLASS(tab === "new")} onClick={() => handleTabChange("new")}>
          {T.TAB_NEW}
        </button>
      </div>

      <form id="assign-proctor-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {tab === "existing" ? (
          availableProctors.length === 0 && !proctorsLoading ? (
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
          )
        ) : (
          <>
            <Input
              label={T.EMAIL_LABEL}
              type="email"
              placeholder={T.EMAIL_PLACEHOLDER}
              value={form.email}
              error={errors.email}
              onChange={(event) => handleChange("email", event.target.value)}
            />
            <Input
              label={T.FULL_NAME_LABEL}
              value={form.fullName}
              error={errors.fullName}
              onChange={(event) => handleChange("fullName", event.target.value)}
            />
            <PasswordInput
              label={T.PASSWORD_LABEL}
              helperText={T.PASSWORD_HELPER}
              value={form.password}
              error={errors.password}
              onChange={(event) => handleChange("password", event.target.value)}
            />
          </>
        )}
      </form>
    </Modal>
  );
};
