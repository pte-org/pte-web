"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Input, Modal, PasswordInput, Select, cn } from "@pte/ui";
import { ASSIGN_COORDINATOR_TEXT, EMPTY_CREATE_COORDINATOR } from "../constants";
import { validateCreateCoordinator } from "../utils/validateCreateCoordinator";
import { useAssignCoordinator, useCreateCoordinatorAccount, useTenantCoordinators } from "../api";
import type { CreateCoordinatorErrors, CreateCoordinatorInput } from "../types";

interface AssignCoordinatorModalProps {
  open: boolean;
  onClose: () => void;
  organizationPublicId: string;
  programPublicId: string;
  /** Coordinators already assigned to this Program — excluded from the "pick existing" list. */
  assignedCoordinatorPublicIds: string[];
}

const T = ASSIGN_COORDINATOR_TEXT;

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

const TAB_CLASS = (active: boolean): string =>
  cn(
    "rounded-md px-3 py-1.5 text-sm font-medium",
    active ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100",
  );

export const AssignCoordinatorModal = ({
  open,
  onClose,
  organizationPublicId,
  programPublicId,
  assignedCoordinatorPublicIds,
}: AssignCoordinatorModalProps): ReactElement => {
  const [tab, setTab] = useState<"existing" | "new">("existing");
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState("");
  const [form, setForm] = useState<CreateCoordinatorInput>(EMPTY_CREATE_COORDINATOR);
  const [errors, setErrors] = useState<CreateCoordinatorErrors>({});

  const { data: coordinators, isLoading: coordinatorsLoading } = useTenantCoordinators();
  const assignCoordinator = useAssignCoordinator(organizationPublicId, programPublicId);
  const createCoordinator = useCreateCoordinatorAccount();

  const assignedSet = new Set(assignedCoordinatorPublicIds);
  const availableCoordinators = (coordinators ?? []).filter((coordinator) => !assignedSet.has(coordinator.publicId));

  const isSubmitting = assignCoordinator.isPending || createCoordinator.isPending;
  const submitError = errorMessage(assignCoordinator.error) ?? errorMessage(createCoordinator.error);

  const handleChange = (field: keyof CreateCoordinatorInput, value: string): void =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const handleTabChange = (next: "existing" | "new"): void => {
    assignCoordinator.reset();
    createCoordinator.reset();
    setTab(next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (tab === "existing") {
      if (!selectedCoordinatorId) return;
      assignCoordinator.mutate(selectedCoordinatorId, { onSuccess: onClose });
      return;
    }

    const nextErrors = validateCreateCoordinator(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createCoordinator.mutate(form, {
      onSuccess: (coordinator) => {
        assignCoordinator.mutate(coordinator.publicId, {
          onSuccess: onClose,
          // The account now exists even though assigning it failed — a plain
          // retry would resubmit the same email and hit an already-exists
          // conflict. Route to "pick existing", pre-selected on the account
          // that was just created, so resubmitting assigns it instead.
          onError: () => {
            setTab("existing");
            setSelectedCoordinatorId(coordinator.publicId);
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
            form="assign-coordinator-form"
            disabled={isSubmitting || (tab === "existing" && !selectedCoordinatorId)}
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

      <form id="assign-coordinator-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {tab === "existing" ? (
          availableCoordinators.length === 0 && !coordinatorsLoading ? (
            <p className="text-sm text-gray-500">{T.noExisting}</p>
          ) : (
            <Select
              label={T.existingLabel}
              placeholder={T.existingPlaceholder}
              value={selectedCoordinatorId}
              disabled={coordinatorsLoading}
              onChange={(event) => setSelectedCoordinatorId(event.target.value)}
              options={availableCoordinators.map((coordinator) => ({
                label: `${coordinator.fullName} (${coordinator.email})`,
                value: coordinator.publicId,
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
