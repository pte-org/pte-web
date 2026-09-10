"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Input, Modal, PasswordInput, Select, cn } from "@pte/ui";
import { ASSIGN_LECTURER_TEXT, EMPTY_CREATE_LECTURER } from "../constants";
import { validateCreateLecturer } from "../utils/validateCreateLecturer";
import { useAssignLecturer, useCreateLecturerAccount, useTenantLecturers } from "../api";
import type { CreateLecturerErrors, CreateLecturerInput } from "../types";

interface AssignLecturerModalProps {
  open: boolean;
  onClose: () => void;
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
  /** Lecturers already assigned to this Class — excluded from the "pick existing" list. */
  assignedLecturerPublicIds: string[];
}

const T = ASSIGN_LECTURER_TEXT;

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

const TAB_CLASS = (active: boolean): string =>
  cn(
    "rounded-md px-3 py-1.5 text-sm font-medium",
    active ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100",
  );

export const AssignLecturerModal = ({
  open,
  onClose,
  organizationPublicId,
  programPublicId,
  classPublicId,
  assignedLecturerPublicIds,
}: AssignLecturerModalProps): ReactElement => {
  const [tab, setTab] = useState<"existing" | "new">("existing");
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [form, setForm] = useState<CreateLecturerInput>(EMPTY_CREATE_LECTURER);
  const [errors, setErrors] = useState<CreateLecturerErrors>({});

  const { data: lecturers, isLoading: lecturersLoading } = useTenantLecturers();
  const assignLecturer = useAssignLecturer(organizationPublicId, programPublicId, classPublicId);
  const createLecturer = useCreateLecturerAccount();

  const assignedSet = new Set(assignedLecturerPublicIds);
  const availableLecturers = (lecturers ?? []).filter((lecturer) => !assignedSet.has(lecturer.publicId));

  const isSubmitting = assignLecturer.isPending || createLecturer.isPending;
  const submitError = errorMessage(assignLecturer.error) ?? errorMessage(createLecturer.error);

  const handleChange = (field: keyof CreateLecturerInput, value: string): void =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const handleTabChange = (next: "existing" | "new"): void => {
    assignLecturer.reset();
    createLecturer.reset();
    setTab(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (tab === "existing") {
      if (!selectedLecturerId) return;
      assignLecturer.mutate(selectedLecturerId, { onSuccess: onClose });
      return;
    }

    const nextErrors = validateCreateLecturer(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createLecturer.mutate(form, {
      onSuccess: (lecturer) => {
        assignLecturer.mutate(lecturer.publicId, {
          onSuccess: onClose,
          // The account now exists even though assigning it failed — a plain
          // retry would resubmit the same email and hit an already-exists
          // conflict. Route to "pick existing", pre-selected on the account
          // that was just created, so resubmitting assigns it instead.
          onError: () => {
            setTab("existing");
            setSelectedLecturerId(lecturer.publicId);
          },
        });
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.title}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.cancel}
          </button>
          <button
            type="submit"
            form="assign-lecturer-form"
            disabled={isSubmitting || (tab === "existing" && !selectedLecturerId)}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? T.submitting : T.submit}
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
          {T.tabExisting}
        </button>
        <button type="button" className={TAB_CLASS(tab === "new")} onClick={() => handleTabChange("new")}>
          {T.tabNew}
        </button>
      </div>

      <form id="assign-lecturer-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {tab === "existing" ? (
          availableLecturers.length === 0 && !lecturersLoading ? (
            <p className="text-sm text-gray-500">{T.noExisting}</p>
          ) : (
            <Select
              label={T.existingLabel}
              placeholder={T.existingPlaceholder}
              value={selectedLecturerId}
              disabled={lecturersLoading}
              onChange={(event) => setSelectedLecturerId(event.target.value)}
              options={availableLecturers.map((lecturer) => ({
                label: `${lecturer.fullName} (${lecturer.email})`,
                value: lecturer.publicId,
              }))}
            />
          )
        ) : (
          <>
            <Input
              label={T.emailLabel}
              type="email"
              placeholder={T.emailPlaceholder}
              value={form.email}
              error={errors.email}
              onChange={(event) => handleChange("email", event.target.value)}
            />
            <Input
              label={T.fullNameLabel}
              value={form.fullName}
              error={errors.fullName}
              onChange={(event) => handleChange("fullName", event.target.value)}
            />
            <PasswordInput
              label={T.passwordLabel}
              helperText={T.passwordHelper}
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
